// Root application module - imports all feature modules

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { BookingsModule } from './bookings/bookings.module';
import { EnquiriesModule } from './enquiries/enquiries.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SettingsModule } from './settings/settings.module';
import { MediaModule } from './media/media.module';
import { BlogModule } from './blog/blog.module';
import { CoursesModule } from './courses/courses.module';
import { TutorialsModule } from './tutorials/tutorials.module';
import { TutorialLeadsModule } from './tutorial-leads/tutorial-leads.module';
import { ProjectsModule } from './projects/projects.module';
import { SeoModule } from './seo/seo.module';
import { ContentModule } from './content/content.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Global rate limit: 100 requests per 15 minutes per IP
    // name 'default' is used so @Throttle({ default: {...} }) overrides work
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 15 * 60 * 1000,
        limit: 100,
      },
    ]),
    PrismaModule,
    BookingsModule,
    EnquiriesModule,
    AuthModule,
    AdminModule,
    NotificationsModule,
    SettingsModule,
    MediaModule,
    BlogModule,
    CoursesModule,
    TutorialsModule,
    TutorialLeadsModule,
    ProjectsModule,
    SeoModule,
    ContentModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
