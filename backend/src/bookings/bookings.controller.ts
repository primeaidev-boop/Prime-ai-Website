// Bookings controller — public POST for lead capture, guarded admin routes

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
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';

@ApiTags('bookings')
@Controller()
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post('bookings')
  @HttpCode(201)
  create(@Body() dto: CreateBookingDto) {
    return this.bookingsService.create(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('admin/bookings')
  findAll(
    @Query('status') status?: LeadStatus,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.bookingsService.findAll({
      status,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      search,
    });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('admin/bookings/export')
  async exportCsv(@Res() res: Response) {
    const csv = await this.bookingsService.exportCsv();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="bookings.csv"',
    );
    res.send(csv);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('admin/bookings/:id')
  findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('admin/bookings/:id')
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: LeadStatus; notes?: string },
  ) {
    return this.bookingsService.updateStatus(id, body.status, body.notes);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('admin/bookings/:id')
  remove(@Param('id') id: string) {
    return this.bookingsService.remove(id);
  }
}
