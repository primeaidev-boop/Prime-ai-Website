import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BlogStatus } from '@prisma/client';

const SITE = 'https://primaiinstitute.com';

// Public routes that always exist (mirrors frontend/src/App.tsx router)
const STATIC_ROUTES = [
  '/',
  '/about',
  '/courses',
  '/courses/l1',
  '/courses/l2a',
  '/courses/l2b',
  '/contact',
  '/tutorials',
  '/projects',
  '/blog',
  '/programs/10-day-ai-launchpad',
  '/privacy',
  '/terms',
  '/refund-policy',
];

interface UrlEntry {
  loc: string;
  lastmod?: string; // ISO date
}

@Injectable()
export class SeoService {
  constructor(private prisma: PrismaService) {}

  /** Parse a site_settings JSON blob, returning [] on any error. */
  private async settingJson<T>(key: string): Promise<T | null> {
    const row = await this.prisma.siteSetting.findUnique({ where: { key } });
    if (!row) return null;
    try {
      return JSON.parse(row.value) as T;
    } catch {
      return null;
    }
  }

  async buildSitemapXml(): Promise<string> {
    const entries: UrlEntry[] = STATIC_ROUTES.map((path) => ({ loc: `${SITE}${path}` }));

    // Published blog posts - real DB timestamps
    const posts = await this.prisma.blogPost.findMany({
      where: { status: BlogStatus.PUBLISHED },
      select: { slug: true, updatedAt: true },
      orderBy: { publishedAt: 'desc' },
    });
    for (const p of posts) {
      entries.push({ loc: `${SITE}/blog/${p.slug}`, lastmod: p.updatedAt.toISOString().slice(0, 10) });
    }

    // Tutorial detail pages - slugs live in the tutorial_data JSON blob
    const tutorialData = await this.settingJson<{ tutorials?: { slug?: string; isVisible?: boolean }[] }>('tutorial_data');
    for (const t of tutorialData?.tutorials ?? []) {
      if (t.slug && t.isVisible !== false) {
        entries.push({ loc: `${SITE}/tutorials/${t.slug}` });
      }
    }

    // Project detail pages - slugs live in the projects_data JSON blob
    const projectsData = await this.settingJson<{ projects?: { slug?: string; visible?: boolean }[] }>('projects_data');
    for (const p of projectsData?.projects ?? []) {
      if (p.slug && p.visible !== false) {
        entries.push({ loc: `${SITE}/projects/${p.slug}` });
      }
    }

    const body = entries
      .map((e) => {
        const lastmod = e.lastmod ? `\n    <lastmod>${e.lastmod}</lastmod>` : '';
        return `  <url>\n    <loc>${e.loc}</loc>${lastmod}\n  </url>`;
      })
      .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
  }
}
