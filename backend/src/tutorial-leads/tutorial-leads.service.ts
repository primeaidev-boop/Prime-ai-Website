import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTutorialLeadDto } from './dto/create-tutorial-lead.dto';
import { TrackViewDto } from './dto/track-view.dto';

interface FindAllQuery {
  search?: string;
  city?: string;
  userType?: string;
  tutorial?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class TutorialLeadsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTutorialLeadDto) {
    return this.prisma.tutorialLead.upsert({
      where: { mobile: dto.mobile },
      update: {
        tutorialsViewedCount: { increment: 1 },
        tutorialAccessed: dto.tutorialAccessed,
        updatedAt: new Date(),
      },
      create: {
        fullName: dto.fullName,
        mobile: dto.mobile,
        city: dto.city,
        userType: dto.userType,
        tutorialAccessed: dto.tutorialAccessed,
        sourcePage: dto.sourcePage,
      },
    });
  }

  async trackView(dto: TrackViewDto) {
    return this.prisma.tutorialLead.updateMany({
      where: { mobile: dto.mobile },
      data: {
        tutorialsViewedCount: { increment: 1 },
        tutorialAccessed: dto.tutorialAccessed,
        updatedAt: new Date(),
      },
    });
  }

  async findAll(query: FindAllQuery) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 25;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (query.city) where.city = { contains: query.city, mode: 'insensitive' };
    if (query.userType) where.userType = query.userType;
    if (query.tutorial)
      where.tutorialAccessed = {
        contains: query.tutorial,
        mode: 'insensitive',
      };
    if (query.search) {
      where.OR = [
        { fullName: { contains: query.search, mode: 'insensitive' } },
        { mobile: { contains: query.search } },
        { city: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.tutorialLead.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.tutorialLead.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async getStats() {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 7);

    const [total, todayCount, weekCount, topTutorials, byUserType] =
      await Promise.all([
        this.prisma.tutorialLead.count(),
        this.prisma.tutorialLead.count({ where: { createdAt: { gte: todayStart } } }),
        this.prisma.tutorialLead.count({ where: { createdAt: { gte: weekStart } } }),
        this.prisma.tutorialLead.groupBy({
          by: ['tutorialAccessed'],
          _count: { tutorialAccessed: true },
          orderBy: { _count: { tutorialAccessed: 'desc' } },
          take: 5,
        }),
        this.prisma.tutorialLead.groupBy({
          by: ['userType'],
          _count: { userType: true },
          orderBy: { _count: { userType: 'desc' } },
        }),
      ]);

    return {
      total,
      todayCount,
      weekCount,
      topTutorials: topTutorials.map((t) => ({
        tutorial: t.tutorialAccessed,
        count: t._count.tutorialAccessed,
      })),
      byUserType: byUserType.map((u) => ({
        userType: u.userType,
        count: u._count.userType,
      })),
    };
  }

  async exportCsv(): Promise<string> {
    const leads = await this.prisma.tutorialLead.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const header =
      'Name,Mobile,City,User Type,Tutorial Accessed,Source Page,Views,Date';
    const rows = leads.map((l) =>
      [
        `"${l.fullName}"`,
        l.mobile,
        `"${l.city}"`,
        `"${l.userType}"`,
        l.tutorialAccessed,
        l.sourcePage,
        l.tutorialsViewedCount,
        l.createdAt.toISOString(),
      ].join(','),
    );

    return [header, ...rows].join('\n');
  }
}
