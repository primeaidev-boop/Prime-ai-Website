import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  NotFoundException,
  Param,
  Put,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
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

  /**
   * Public - the Live Demo document embedded by the project detail page's
   * sandboxed iframe. Responds with its OWN relaxed CSP: this document
   * intentionally runs third-party CDN scripts (Tailwind CDN, fonts) and
   * inline code that the site-wide strict-dynamic/nonce policy would block.
   * The security boundary is the embedding iframe's sandbox="allow-scripts"
   * (no allow-same-origin), not this header.
   */
  @Get('demo/:slug')
  async demo(@Param('slug') slug: string, @Res() res: Response) {
    const html = await this.projectsService.buildDemoHtml(slug);
    if (html === null) {
      throw new NotFoundException('Demo not found');
    }
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self' https: data: blob: 'unsafe-inline' 'unsafe-eval'",
    );
    res.setHeader('X-Robots-Tag', 'noindex');
    res.setHeader('Cache-Control', 'no-store');
    res.type('html').send(html);
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
