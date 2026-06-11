// Seed script - creates default admin account and site settings

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Admin@123', 10);

  await prisma.admin.upsert({
    where: { email: 'admin@primaiinstitute.com' },
    update: {},
    create: {
      email: 'admin@primaiinstitute.com',
      passwordHash,
      name: 'PRIM AI Admin',
    },
  });

  const defaultSettings = [
    // Navigation
    { key: 'nav_logo_text', value: 'PRIM AI' },
    { key: 'nav_cta_text', value: 'Book Free Demo' },
    { key: 'nav_link_home', value: 'Home' },
    { key: 'nav_link_about', value: 'About' },
    { key: 'nav_link_courses', value: 'Courses' },
    { key: 'nav_link_contact', value: 'Contact' },
    // Hero content
    { key: 'hero_badge_text', value: "India's AI-First Training Institute" },
    { key: 'hero_heading_line1', value: 'The Future Runs on AI.' },
    { key: 'hero_heading_cyan', value: 'Are' },
    { key: 'hero_heading_white', value: 'You' },
    { key: 'hero_heading_orange', value: 'Ready?' },
    { key: 'hero_subtext', value: "Join PRIM AI Institute — where school students, professionals & entrepreneurs learn to harness the power of Artificial Intelligence and lead the next decade." },
    { key: 'hero_cta1_text', value: 'Book Your Free Demo Class' },
    { key: 'hero_cta2_text', value: 'Explore Courses' },
    // Hero stats
    { key: 'hero_students_count', value: '5000+' },
    { key: 'hero_students_label', value: 'Students' },
    { key: 'hero_companies_count', value: '350+' },
    { key: 'hero_companies_label', value: 'Companies' },
    { key: 'hero_years_count', value: '10+' },
    { key: 'hero_years_label', value: 'Years' },
    { key: 'hero_iso_show', value: 'true' },
    // Batch banner
    { key: 'new_batch_banner', value: 'true' },
    { key: 'new_batch_text', value: 'New Batch Starting Soon — Limited Seats!' },
    // Admin contact
    { key: 'admin_whatsapp', value: '917573055191' },
    { key: 'admin_email', value: 'info@stadsolution.com' },
  ];

  for (const setting of defaultSettings) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }

  console.log('✅ Seed complete - admin and settings created');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
