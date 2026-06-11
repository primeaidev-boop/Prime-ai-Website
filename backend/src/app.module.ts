// Root application module — imports all feature modules

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { BookingsModule } from './bookings/bookings.module';
import { EnquiriesModule } from './enquiries/enquiries.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SettingsModule } from './settings/settings.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    BookingsModule,
    EnquiriesModule,
    AuthModule,
    AdminModule,
    NotificationsModule,
    SettingsModule,
  ],
})
export class AppModule {}
