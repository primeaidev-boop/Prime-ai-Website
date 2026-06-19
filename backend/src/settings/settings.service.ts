// Settings service - key-value site settings with public subset for frontend

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const PUBLIC_KEYS = new Set([
  // Navigation
  'nav_logo_text', 'nav_cta_text',
  'nav_link_home', 'nav_link_about', 'nav_link_courses', 'nav_link_contact',
  // Home hero
  'hero_badge_text',
  'hero_heading_line1', 'hero_heading_cyan', 'hero_heading_white', 'hero_heading_orange',
  'hero_subtext', 'hero_cta1_text', 'hero_cta2_text',
  'hero_students_count', 'hero_students_label',
  'hero_companies_count', 'hero_companies_label',
  'hero_years_count', 'hero_years_label', 'hero_iso_show',
  'new_batch_banner', 'new_batch_text',
  // About hero
  'about_badge_text', 'about_hero_h1', 'about_hero_h1_accent', 'about_hero_subtext',
  'about_stat1_count', 'about_stat1_label',
  'about_stat2_count', 'about_stat2_label',
  'about_stat3_count', 'about_stat3_label',
  'about_show_iso',
  // About quote
  'about_show_quote', 'about_quote_main', 'about_quote_accent',
  // About differentiators
  'about_show_diff',
  'about_diff1_icon', 'about_diff1_title', 'about_diff1_body',
  'about_diff2_icon', 'about_diff2_title', 'about_diff2_body',
  'about_diff3_icon', 'about_diff3_title', 'about_diff3_body',
  'about_diff4_icon', 'about_diff4_title', 'about_diff4_body',
  // About trainers
  'about_show_trainers',
  'about_trainer1_name', 'about_trainer1_role', 'about_trainer1_exp', 'about_trainer1_img',
  'about_trainer2_name', 'about_trainer2_role', 'about_trainer2_exp', 'about_trainer2_img',
  'about_trainer3_name', 'about_trainer3_role', 'about_trainer3_exp', 'about_trainer3_img',
  // About CTA
  'about_show_cta', 'about_cta_heading', 'about_cta_subtext',
  'about_cta_btn1_text', 'about_cta_btn2_text',
  // Contact hero & info
  'contact_badge', 'contact_heading', 'contact_subtext',
  'contact_address', 'contact_phone', 'contact_email', 'contact_hours',
  'contact_form_title',
  // Contact WhatsApp & Map
  'contact_show_whatsapp', 'contact_whatsapp_number', 'contact_whatsapp_message',
  'contact_show_map', 'contact_map_embed_url', 'contact_map_link_url',
  // Contact FAQ
  'contact_show_faq', 'contact_faq_title', 'contact_faqs',
  // Courses page (single JSON blob)
  'course_page_data',
  // Footer social links (existing)
  'footer_social_facebook', 'footer_social_youtube',
  'footer_social_instagram', 'footer_social_linkedin',
  // Footer -new full-footer keys
  'footer_cta_show', 'footer_cta_heading', 'footer_cta_subtext',
  'footer_cta_demo_btn_text', 'footer_cta_wa_btn_text',
  'footer_stats_show',
  'footer_stat_1_num', 'footer_stat_1_label',
  'footer_stat_2_num', 'footer_stat_2_label',
  'footer_stat_3_num', 'footer_stat_3_label',
  'footer_stat_4_num', 'footer_stat_4_label',
  'footer_stat_5_num', 'footer_stat_5_label',
  'footer_desc', 'footer_iso_show',
  'footer_quicklinks_show', 'footer_courses_show', 'footer_explore_more_show',
  'footer_contact_show', 'footer_address', 'footer_phone',
  'footer_email', 'footer_hours',
  'footer_social_show', 'footer_social_whatsapp',
  'footer_wa_float_show', 'footer_wa_float_number',
  'footer_privacy_url', 'footer_terms_url', 'footer_refund_url',
  'footer_sitemap_url', 'footer_franchise_url',
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
