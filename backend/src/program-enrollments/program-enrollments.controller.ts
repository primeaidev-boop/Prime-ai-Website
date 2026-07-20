import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { EnrollmentStatus } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProgramEnrollmentsService } from './program-enrollments.service';
import { CreateProgramEnrollmentDto } from './dto/create-program-enrollment.dto';
import { UpdateProgramEnrollmentDto } from './dto/update-program-enrollment.dto';

@ApiTags('program-enrollments')
@Controller()
export class ProgramEnrollmentsController {
  constructor(private readonly service: ProgramEnrollmentsService) {}

  // 10 submissions per hour per IP - same limit as tutorial-leads
  @Throttle({ default: { ttl: 60 * 60 * 1000, limit: 10 } })
  @Post('program-enrollments')
  @HttpCode(201)
  create(@Body() dto: CreateProgramEnrollmentDto) {
    return this.service.create(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('admin/program-enrollments/stats')
  getStats() {
    return this.service.getStats();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('admin/program-enrollments/export')
  async exportCsv(@Res() res: Response) {
    const csv = await this.service.exportCsv();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="program-enrollments.csv"',
    );
    res.send(csv);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('admin/program-enrollments')
  findAll(
    @Query('search') search?: string,
    @Query('program') program?: string,
    @Query('batch') batch?: string,
    @Query('status') status?: EnrollmentStatus,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.findAll({
      search,
      program,
      batch,
      status,
      dateFrom,
      dateTo,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('admin/program-enrollments/:id')
  update(@Param('id') id: string, @Body() dto: UpdateProgramEnrollmentDto) {
    return this.service.updateStatus(id, dto);
  }
}
