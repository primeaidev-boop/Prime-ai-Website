import { Controller, Get, Header } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { SeoService } from './seo.service';

// SkipThrottle: these endpoints serve ordinary page loads (Nginx proxies
// document requests here) and crawler traffic - the global 100 req/15 min
// rate limit would 429 normal visitors browsing the site.
@SkipThrottle()
@ApiTags('seo')
@Controller('seo')
export class SeoController {
  constructor(private readonly seoService: SeoService) {}

  /** Public - Nginx proxies https://primaiinstitute.com/sitemap.xml here */
  @Get('sitemap.xml')
  @Header('Content-Type', 'application/xml; charset=utf-8')
  @Header('Cache-Control', 'public, max-age=3600')
  async sitemap(): Promise<string> {
    return this.seoService.buildSitemapXml();
  }
}
