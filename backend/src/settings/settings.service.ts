// Settings service - key-value site settings with public subset for frontend

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const PUBLIC_KEYS = new Set([
  'nav_logo_text', 'nav_cta_text',
  'nav_link_home', 'nav_link_about', 'nav_link_courses', 'nav_link_contact',
  'hero_badge_text',
  'hero_heading_line1', 'hero_heading_cyan', 'hero_heading_white', 'hero_heading_orange',
  'hero_subtext', 'hero_cta1_text', 'hero_cta2_text',
  'hero_students_count', 'hero_students_label',
  'hero_companies_count', 'hero_companies_label',
  'hero_years_count', 'hero_years_label', 'hero_iso_show',
  'new_batch_banner', 'new_batch_text',
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
