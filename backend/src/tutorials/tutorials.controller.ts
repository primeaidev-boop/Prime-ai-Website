import { Body, Controller, Get, Header, HttpCode, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TutorialsService } from './tutorials.service';

@ApiTags('tutorials')
@Controller('tutorials')
export class TutorialsController {
  constructor(private readonly tutorialsService: TutorialsService) {}

  @Get('data')
  @Header('Cache-Control', 'no-store')
  async getData() {
    return this.tutorialsService.getData();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put('data')
  @HttpCode(200)
  async saveData(@Body() body: Record<string, unknown>) {
    await this.tutorialsService.saveData(body);
    return { ok: true };
  }
}
