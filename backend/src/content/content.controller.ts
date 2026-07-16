import { Body, Controller, Get, Header, Param, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ContentService } from './content.service';

@ApiTags('content')
@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  /** Public - visitors fetch published page content on every page load.
   *  SkipThrottle: same reasoning as the SEO endpoints - ordinary browsing
   *  must never trip the 100 req/15 min limiter. Returns null when nothing
   *  has been published for the key yet. */
  @SkipThrottle()
  @Get(':key')
  @Header('Cache-Control', 'no-store')
  get(@Param('key') key: string) {
    return this.contentService.get(key);
  }

  /** Admin-only - saves the full page document (same auth pattern as the
   *  Blog admin endpoints). */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put(':key')
  put(@Param('key') key: string, @Body() body: unknown) {
    return this.contentService.put(key, body);
  }
}
