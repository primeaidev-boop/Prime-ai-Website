// Settings service — key-value site settings with public subset for frontend

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const PUBLIC_KEYS = new Set([
  'hero_students_count',
  'hero_companies_count',
  'hero_years_count',
  'new_batch_banner',
  'new_batch_text',
]);

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Record<string, string>> {
    const rows = await this.prisma.siteSetting.findMany();
    return Object.fromEntries(rows.map((r) => [r.key, r.value]));
  }

  async findPublic(): Promise<Record<string, string>> {
    const rows = await this.prisma.siteSetting.findMany({
      where: { key: { in: [...PUBLIC_KEYS] } },
    });
    return Object.fromEntries(rows.map((r) => [r.key, r.value]));
  }

  async update(key: string, value: string) {
    return this.prisma.siteSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }
}
