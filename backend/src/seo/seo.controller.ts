import { Controller, Get, Header, Req, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { SeoService } from './seo.service';
import { SeoRenderService } from './seo-render.service';

// SkipThrottle: these endpoints serve ordinary page loads (Nginx proxies
// document requests here) and crawler traffic - the global 100 req/15 min
// rate limit would 429 normal visitors browsing the site.
@SkipThrottle()
@ApiTags('seo')
@Controller('seo')
export class SeoController {
  constructor(
    private readonly seoService: SeoService,
    private readonly seoRenderService: SeoRenderService,
  ) {}

  /** Public - Nginx proxies https://primaiinstitute.com/sitemap.xml here */
  @Get('sitemap.xml')
  @Header('Content-Type', 'application/xml; charset=utf-8')
  @Header('Cache-Control', 'public, max-age=3600')
  async sitemap(): Promise<string> {
    return this.seoService.buildSitemapXml();
  }

  /**
   * Public - Nginx proxies document requests for crawler-relevant routes
   * (/, /blog/*, /courses/*, /tutorials/*, /projects/*, /about, /contact,
   * /programs/*) here. Returns the built SPA index.html with per-route
   * title/description/OG/Twitter/JSON-LD injected server-side, so social
   * crawlers (which don't run JS) see correct link previews.
   * Same HTML for everyone - no user-agent sniffing.
   */
  @Get(['render', 'render/*'])
  @Header('Content-Type', 'text/html; charset=utf-8')
  @Header('Cache-Control', 'no-cache')
  async render(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<string> {
    // Path after the /api/seo/render prefix = the original site path
    const sitePath = req.path.replace(/^\/api\/seo\/render/, '') || '/';
    // Same nonce main.ts stamped into this response's CSP script-src header,
    // so inline <script> tags (GTM bootstrap, JSON-LD) are allowed without 'unsafe-inline'.
    const nonce = res.locals.cspNonce as string;
    return this.seoRenderService.renderRoute(sitePath, nonce);
  }
}
