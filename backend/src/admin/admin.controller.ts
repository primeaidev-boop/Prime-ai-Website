// Admin controller — dashboard stats and recent leads (all protected by JWT)

import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminService } from './admin.service';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }

  @Get('recent-leads')
  getRecentLeads(@Query('limit') limit?: string) {
    return this.adminService.getRecentLeads(limit ? parseInt(limit, 10) : 10);
  }
}
