// Admin service — aggregated dashboard stats and recent leads from both tables

import { Injectable } from '@nestjs/common';
import { LeadStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [
      bookingsCount,
      enquiriesCount,
      newBookings,
      newEnquiries,
      weekBookings,
      weekEnquiries,
      convertedBookings,
      convertedEnquiries,
    ] = await Promise.all([
      this.prisma.demoBooking.count(),
      this.prisma.enquiry.count(),
      this.prisma.demoBooking.count({ where: { status: LeadStatus.NEW } }),
      this.prisma.enquiry.count({ where: { status: LeadStatus.NEW } }),
      this.prisma.demoBooking.count({
        where: { createdAt: { gte: sevenDaysAgo } },
      }),
      this.prisma.enquiry.count({
        where: { createdAt: { gte: sevenDaysAgo } },
      }),
      this.prisma.demoBooking.count({
        where: { status: LeadStatus.CONVERTED },
      }),
      this.prisma.enquiry.count({ where: { status: LeadStatus.CONVERTED } }),
    ]);

    return {
      totalLeads: bookingsCount + enquiriesCount,
      newLeads: newBookings + newEnquiries,
      thisWeekLeads: weekBookings + weekEnquiries,
      convertedLeads: convertedBookings + convertedEnquiries,
      bookingsCount,
      enquiriesCount,
    };
  }

  async getRecentLeads(limit = 10) {
    const [bookings, enquiries] = await Promise.all([
      this.prisma.demoBooking.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.enquiry.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const merged = [
      ...bookings.map((b) => ({ ...b, type: 'booking' as const })),
      ...enquiries.map((e) => ({ ...e, type: 'enquiry' as const })),
    ];

    merged.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return merged.slice(0, limit);
  }
}
