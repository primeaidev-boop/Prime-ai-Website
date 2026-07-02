import { Body, Controller, Get, Header, HttpCode, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProjectsService } from './projects.service';

@ApiTags('projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  /** Public - any visitor fetches the live projects data */
  @Get('data')
  @Header('Cache-Control', 'no-store')
  async getData() {
    return this.projectsService.getData();
  }

  /** Admin-only - persists the full projects payload to the DB */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put('data')
  @HttpCode(200)
  async saveData(@Body() body: Record<string, unknown>) {
    await this.projectsService.saveData(body);
    return { ok: true };
  }
}
