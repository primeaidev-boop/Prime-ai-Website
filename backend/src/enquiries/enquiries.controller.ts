// Enquiries controller — public POST for lead capture, guarded admin routes

import {
  Body,
  Controller,
  Delete,
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
import { LeadStatus } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { EnquiriesService } from './enquiries.service';
import { CreateEnquiryDto } from './dto/create-enquiry.dto';

@ApiTags('enquiries')
@Controller()
export class EnquiriesController {
  constructor(private readonly enquiriesService: EnquiriesService) {}

  @Post('enquiries')
  @HttpCode(201)
  create(@Body() dto: CreateEnquiryDto) {
    return this.enquiriesService.create(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('admin/enquiries')
  findAll(
    @Query('status') status?: LeadStatus,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.enquiriesService.findAll({
      status,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      search,
    });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('admin/enquiries/export')
  async exportCsv(@Res() res: Response) {
    const csv = await this.enquiriesService.exportCsv();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="enquiries.csv"',
    );
    res.send(csv);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('admin/enquiries/:id')
  findOne(@Param('id') id: string) {
    return this.enquiriesService.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('admin/enquiries/:id')
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: LeadStatus; notes?: string },
  ) {
    return this.enquiriesService.updateStatus(id, body.status, body.notes);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('admin/enquiries/:id')
  remove(@Param('id') id: string) {
    return this.enquiriesService.remove(id);
  }
}
