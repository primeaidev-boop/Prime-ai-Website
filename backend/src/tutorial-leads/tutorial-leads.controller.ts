import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TutorialLeadsService } from './tutorial-leads.service';
import { CreateTutorialLeadDto } from './dto/create-tutorial-lead.dto';
import { TrackViewDto } from './dto/track-view.dto';

@ApiTags('tutorial-leads')
@Controller()
export class TutorialLeadsController {
  constructor(private readonly service: TutorialLeadsService) {}

  // 10 submissions per hour per IP
  @Throttle({ default: { ttl: 60 * 60 * 1000, limit: 10 } })
  @Post('tutorial-leads')
  @HttpCode(201)
  create(@Body() dto: CreateTutorialLeadDto) {
    return this.service.create(dto);
  }

  // 60 view-tracks per hour per IP (returning visitors)
  @Throttle({ default: { ttl: 60 * 60 * 1000, limit: 60 } })
  @Post('tutorial-leads/view')
  @HttpCode(200)
  trackView(@Body() dto: TrackViewDto) {
    return this.service.trackView(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('admin/tutorial-leads/stats')
  getStats() {
    return this.service.getStats();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('admin/tutorial-leads/export')
  async exportCsv(@Res() res: Response) {
    const csv = await this.service.exportCsv();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="tutorial-leads.csv"',
    );
    res.send(csv);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('admin/tutorial-leads')
  findAll(
    @Query('search') search?: string,
    @Query('city') city?: string,
    @Query('userType') userType?: string,
    @Query('tutorial') tutorial?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.findAll({
      search,
      city,
      userType,
      tutorial,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }
}
