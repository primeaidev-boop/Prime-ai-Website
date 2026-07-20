import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EnrollmentStatus, Prisma } from '@prisma/client';
import { CreateProgramEnrollmentDto } from './dto/create-program-enrollment.dto';
import { UpdateProgramEnrollmentDto } from './dto/update-program-enrollment.dto';

interface FindAllQuery {
  search?: string;
  program?: string;
  batch?: string;
  status?: EnrollmentStatus;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

// Same WhatsApp number + same program, resubmitted within this window, is
// treated as repeat interest in the same enrollment attempt (e.g. they
// changed their batch choice, or hit submit twice) rather than a fresh
// signup. Past this window a new submission is a new enrollment - someone
// coming back for a later batch cycle should show up as its own row.
const DEDUP_WINDOW_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class ProgramEnrollmentsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateProgramEnrollmentDto) {
    const existing = await this.prisma.programEnrollment.findFirst({
      where: {
        whatsappNumber: dto.whatsappNumber,
        programSlug: dto.programSlug,
        createdAt: { gte: new Date(Date.now() - DEDUP_WINDOW_MS) },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (existing) {
      return this.prisma.programEnrollment.update({
        where: { id: existing.id },
        data: {
          fullName: dto.fullName,
          city: dto.city,
          email: dto.email,
          userType: dto.userType,
          programTitle: dto.programTitle,
          batchName: dto.batchName,
          submissionCount: { increment: 1 },
        },
      });
    }

    return this.prisma.programEnrollment.create({
      data: {
        fullName: dto.fullName,
        whatsappNumber: dto.whatsappNumber,
        city: dto.city,
        email: dto.email,
        userType: dto.userType,
        programSlug: dto.programSlug,
        programTitle: dto.programTitle,
        batchName: dto.batchName,
      },
    });
  }

  async updateStatus(id: string, dto: UpdateProgramEnrollmentDto) {
    return this.prisma.programEnrollment.update({
      where: { id },
      data: {
        ...(dto.status !== undefined ? { status: dto.status } : {}),
        ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
      },
    });
  }

  async findAll(query: FindAllQuery) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 25;
    const skip = (page - 1) * limit;

    const where: Prisma.ProgramEnrollmentWhereInput = {};

    if (query.program) where.programSlug = query.program;
    if (query.batch) where.batchName = query.batch;
    if (query.status) where.status = query.status;
    if (query.dateFrom || query.dateTo) {
      where.createdAt = {
        ...(query.dateFrom ? { gte: new Date(query.dateFrom) } : {}),
        ...(query.dateTo ? { lte: new Date(query.dateTo) } : {}),
      };
    }
    if (query.search) {
      where.OR = [
        { fullName: { contains: query.search, mode: 'insensitive' } },
        { whatsappNumber: { contains: query.search } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.programEnrollment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.programEnrollment.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async getStats() {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(todayStart);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6); // today + 6 previous days = 7 buckets

    const [total, todayCount, byProgramCounts, byBatchCounts, recentRows] =
      await Promise.all([
        this.prisma.programEnrollment.count(),
        this.prisma.programEnrollment.count({ where: { createdAt: { gte: todayStart } } }),
        this.prisma.programEnrollment.groupBy({
          by: ['programSlug'],
          _count: { programSlug: true },
          orderBy: { _count: { programSlug: 'desc' } },
        }),
        this.prisma.programEnrollment.groupBy({
          by: ['programSlug', 'batchName'],
          _count: { batchName: true },
          orderBy: { _count: { batchName: 'desc' } },
        }),
        this.prisma.programEnrollment.findMany({
          where: { createdAt: { gte: sevenDaysAgo } },
          select: { createdAt: true },
        }),
      ]);

    // One representative title per program slug (most recent submission's title)
    const titleRows = await this.prisma.programEnrollment.findMany({
      distinct: ['programSlug'],
      orderBy: { createdAt: 'desc' },
      select: { programSlug: true, programTitle: true },
    });
    const titleBySlug = new Map(titleRows.map((r) => [r.programSlug, r.programTitle]));

    // Last-7-days trend bucketed by local calendar day
    const trend: { date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date(todayStart);
      day.setDate(day.getDate() - i);
      const dayKey = day.toISOString().slice(0, 10);
      trend.push({ date: dayKey, count: 0 });
    }
    const trendIndex = new Map(trend.map((t, i) => [t.date, i]));
    for (const row of recentRows) {
      const key = row.createdAt.toISOString().slice(0, 10);
      const idx = trendIndex.get(key);
      if (idx !== undefined) trend[idx].count += 1;
    }

    return {
      total,
      todayCount,
      byProgram: byProgramCounts.map((p) => ({
        programSlug: p.programSlug,
        programTitle: titleBySlug.get(p.programSlug) ?? p.programSlug,
        count: p._count.programSlug,
      })),
      byBatch: byBatchCounts.map((b) => ({
        programSlug: b.programSlug,
        programTitle: titleBySlug.get(b.programSlug) ?? b.programSlug,
        batchName: b.batchName,
        count: b._count.batchName,
      })),
      last7Days: trend,
    };
  }

  async exportCsv(): Promise<string> {
    const rows = await this.prisma.programEnrollment.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const header =
      'Name,WhatsApp Number,City,Email,User Type,Program,Batch,Status,Notes,Submissions,Date';
    const csvRows = rows.map((r) =>
      [
        `"${r.fullName}"`,
        r.whatsappNumber,
        `"${r.city ?? ''}"`,
        `"${r.email ?? ''}"`,
        `"${r.userType ?? ''}"`,
        `"${r.programTitle}"`,
        `"${r.batchName}"`,
        r.status,
        `"${(r.notes ?? '').replace(/"/g, '""')}"`,
        r.submissionCount,
        r.createdAt.toISOString(),
      ].join(','),
    );

    return [header, ...csvRows].join('\n');
  }
}
