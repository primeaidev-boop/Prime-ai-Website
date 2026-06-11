// Bookings service — CRUD, pagination, search, CSV export, status updates

import { Injectable, NotFoundException } from '@nestjs/common';
import { LeadStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateBookingDto } from './dto/create-booking.dto';

interface FindAllQuery {
  status?: LeadStatus;
  page?: number;
  limit?: number;
  search?: string;
}

@Injectable()
export class BookingsService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  async create(dto: CreateBookingDto) {
    const booking = await this.prisma.demoBooking.create({ data: dto });
    await this.notifications.sendBookingAlert(booking);
    return booking;
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
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.demoBooking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.demoBooking.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findOne(id: string) {
    const booking = await this.prisma.demoBooking.findUnique({ where: { id } });
    if (!booking) throw new NotFoundException(`Booking ${id} not found`);
    return booking;
  }

  async updateStatus(id: string, status: LeadStatus, notes?: string) {
    await this.findOne(id);
    return this.prisma.demoBooking.update({
      where: { id },
      data: { status, ...(notes !== undefined && { notes }) },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.demoBooking.delete({ where: { id } });
  }

  async exportCsv(): Promise<string> {
    const bookings = await this.prisma.demoBooking.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const header = 'Name,Phone,Profile,Course,Status,Notes,Date';
    const rows = bookings.map((b) =>
      [
        `"${b.name}"`,
        b.phone,
        b.profile,
        b.courseInterest,
        b.status,
        `"${b.notes ?? ''}"`,
        b.createdAt.toISOString(),
      ].join(','),
    );

    return [header, ...rows].join('\n');
  }
}
