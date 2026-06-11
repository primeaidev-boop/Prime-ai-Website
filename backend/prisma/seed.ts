// Seed script — creates default admin account and site settings

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
    { key: 'hero_students_count', value: '5000+' },
    { key: 'hero_companies_count', value: '350+' },
    { key: 'hero_years_count', value: '10+' },
    { key: 'new_batch_banner', value: 'true' },
    { key: 'new_batch_text', value: 'New Batch Starting Soon — Limited Seats!' },
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

  console.log('✅ Seed complete — admin and settings created');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
