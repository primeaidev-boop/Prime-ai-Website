// Enquiries service — CRUD, pagination, search, CSV export, status updates

import { Injectable, NotFoundException } from '@nestjs/common';
import { LeadStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateEnquiryDto } from './dto/create-enquiry.dto';

interface FindAllQuery {
  status?: LeadStatus;
  page?: number;
  limit?: number;
  search?: string;
}

@Injectable()
export class EnquiriesService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  async create(dto: CreateEnquiryDto) {
    const enquiry = await this.prisma.enquiry.create({ data: dto });
    await this.notifications.sendEnquiryAlert(enquiry);
    return enquiry;
  }

  async findAll(query: FindAllQuery) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (query.status) where.status = query.status;
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { phone: { contains: query.search } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.enquiry.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.enquiry.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findOne(id: string) {
    const enquiry = await this.prisma.enquiry.findUnique({ where: { id } });
    if (!enquiry) throw new NotFoundException(`Enquiry ${id} not found`);
    return enquiry;
  }

  async updateStatus(id: string, status: LeadStatus, notes?: string) {
    await this.findOne(id);
    return this.prisma.enquiry.update({
      where: { id },
      data: { status, ...(notes !== undefined && { notes }) },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.enquiry.delete({ where: { id } });
  }

  async exportCsv(): Promise<string> {
    const enquiries = await this.prisma.enquiry.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const header = 'Name,Phone,Email,Profile,Course,Message,Status,Notes,Date';
    const rows = enquiries.map((e) =>
      [
        `"${e.name}"`,
        e.phone,
        e.email ?? '',
        e.profile,
        e.courseInterest,
        `"${e.message.replace(/"/g, '""')}"`,
        e.status,
        `"${e.notes ?? ''}"`,
        e.createdAt.toISOString(),
      ].join(','),
    );

    return [header, ...rows].join('\n');
  }
}
