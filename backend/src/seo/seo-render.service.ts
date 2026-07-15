import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BlogStatus, CourseLevel } from '@prisma/client';
import { readFileSync, statSync } from 'fs';
import { resolve } from 'path';

const SITE = 'https://primaiinstitute.com';
const DEFAULT_TITLE = 'PRIM AI Institute - Learn AI. Use AI. Lead with AI.';
const DEFAULT_DESC =
  "Gujarat's premier AI training institute - empowering students, professionals, and entrepreneurs with real-world AI skills.";
const DEFAULT_IMAGE = `${SITE}/og-image.png`;

interface RouteMeta {
  title: string;
  description: string;
  image?: string;      // absolute URL
  ogType?: string;     // default 'website'
  jsonLd?: object;     // extra per-page schema
}

/** Escape a string for use inside an HTML attribute. */
function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** Make a possibly-relative asset URL absolute. */
function abs(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  return url.startsWith('http') ? url : `${SITE}${url.startsWith('/') ? '' : '/'}${url}`;
}

/** JSON-LD safe serialization (prevents </script> breakout). */
function jsonLd(obj: object): string {
  return JSON.stringify(obj).replace(/</g, '\\u003c');
}

// Static-copy routes. Text mirrors the real page content, not invented claims.
const STATIC_META: Record<string, Omit<RouteMeta, 'jsonLd'>> = {
  '/': { title: DEFAULT_TITLE, description: DEFAULT_DESC },
  '/about': {
    title: 'About Us - PRIM AI Institute',
    description:
      'ISO 9001:2015 certified AI training institute in Ahmedabad. We believe AI education should be accessible to every Indian - from Class 6 to CEO.',
  },
  '/courses': {
    title: 'AI Courses & Programs - PRIM AI Institute',
    description:
      'Structured AI programs: AI Foundation, AI Generalist (15+ tools, no coding), and AI Developer. Hands-on training with mentorship and certification in Ahmedabad.',
  },
  '/contact': {
    title: 'Contact Us - PRIM AI Institute',
    description:
      'Start your AI journey today. Connect with our admissions team for course details, campus visits, or corporate AI training. Ahmedabad, Gujarat.',
  },
  '/tutorials': {
    title: 'Free AI Tool Tutorials - PRIM AI Institute',
    description:
      'Master every AI tool, one tutorial at a time. 40+ tools, 120+ free step-by-step tutorials: ChatGPT, Claude, Gemini, Midjourney, GitHub Copilot and more.',
  },
  '/projects': {
    title: 'Student Projects - PRIM AI Institute',
    description:
      'Explore AI applications, websites, automations, and business solutions built by our students - real projects with real impact.',
  },
  '/blog': {
    title: 'Blog - PRIM AI Institute',
    description:
      'Practical AI insights: tool guides, career advice, prompt engineering, and the future of generative AI - from the PRIM AI Institute team.',
  },
  '/programs/10-day-ai-launchpad': {
    title: '10-Day AI Launchpad - PRIM AI Institute',
    description:
      'An intensive 10-day program to go from AI-curious to AI-confident: daily hands-on sessions, real tools, and a completion certificate.',
  },
  '/privacy': {
    title: 'Privacy Policy - PRIM AI Institute',
    description: 'How PRIM AI Institute collects, uses, and protects your personal information.',
  },
  '/terms': {
    title: 'Terms & Conditions - PRIM AI Institute',
    description: 'Terms and conditions governing use of the PRIM AI Institute website and services.',
  },
  '/refund-policy': {
    title: 'Refund Policy - PRIM AI Institute',
    description: 'Our refund and cancellation policy for PRIM AI Institute courses and programs.',
  },
};

const COURSE_ROUTE_LEVEL: Record<string, CourseLevel> = {
  '/courses/l1': CourseLevel.L1_FOUNDATION,
  '/courses/l2a': CourseLevel.L2A_GENERALIST,
  '/courses/l2b': CourseLevel.L2B_DEVELOPER,
};

@Injectable()
export class SeoRenderService {
  constructor(private prisma: PrismaService) {}

  // ── Built index.html (cached, re-read when the build changes) ─────────────
  private indexCache: { html: string; mtimeMs: number; checkedAt: number } | null = null;

  private get indexPath(): string {
    return process.env.FRONTEND_INDEX ?? resolve(process.cwd(), '../frontend/dist/index.html');
  }

  private readIndexHtml(): string {
    const now = Date.now();
    // Re-stat at most once per 30s; re-read only if the build changed
    if (this.indexCache && now - this.indexCache.checkedAt < 30_000) {
      return this.indexCache.html;
    }
    const mtimeMs = statSync(this.indexPath).mtimeMs;
    if (!this.indexCache || this.indexCache.mtimeMs !== mtimeMs) {
      this.indexCache = { html: readFileSync(this.indexPath, 'utf8'), mtimeMs, checkedAt: now };
    } else {
      this.indexCache.checkedAt = now;
    }
    return this.indexCache.html;
  }

  private async settingJson<T>(key: string): Promise<T | null> {
    const row = await this.prisma.siteSetting.findUnique({ where: { key } });
    if (!row) return null;
    try {
      return JSON.parse(row.value) as T;
    } catch {
      return null;
    }
  }

  // ── Per-route meta resolution ──────────────────────────────────────────────
  private async resolveMeta(path: string): Promise<RouteMeta> {
    // Blog post detail
    const blogMatch = path.match(/^\/blog\/([^/]+)\/?$/);
    if (blogMatch) {
      const post = await this.prisma.blogPost.findUnique({
        where: { slug: blogMatch[1] },
        select: {
          title: true, excerpt: true, coverImageUrl: true, status: true,
          publishedAt: true, updatedAt: true, showAuthor: true,
          author: { select: { name: true } },
        },
      });
      if (post && post.status === BlogStatus.PUBLISHED) {
        return {
          title: `${post.title} - PRIM AI Institute`,
          description: post.excerpt,
          image: abs(post.coverImageUrl) ?? DEFAULT_IMAGE,
          ogType: 'article',
          jsonLd: {
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.title,
            description: post.excerpt,
            image: abs(post.coverImageUrl) ?? DEFAULT_IMAGE,
            datePublished: post.publishedAt?.toISOString(),
            dateModified: post.updatedAt.toISOString(),
            ...(post.showAuthor && post.author
              ? { author: { '@type': 'Person', name: post.author.name } }
              : {}),
            publisher: {
              '@type': 'Organization',
              name: 'PRIM AI Institute',
              logo: { '@type': 'ImageObject', url: `${SITE}/Asset%2025.svg` },
            },
            mainEntityOfPage: `${SITE}${path}`,
          },
        };
      }
    }

    // Course detail pages (fixed routes backed by AiCourse rows)
    const level = COURSE_ROUTE_LEVEL[path];
    if (level) {
      const course = await this.prisma.aiCourse.findUnique({
        where: { level },
        select: { title: true, tagline: true, heroImageUrl: true, duration: true, mode: true },
      });
      if (course) {
        return {
          title: `${course.title} - PRIM AI Institute`,
          description: course.tagline,
          image: abs(course.heroImageUrl) ?? DEFAULT_IMAGE,
          jsonLd: {
            '@context': 'https://schema.org',
            '@type': 'Course',
            name: course.title,
            description: course.tagline,
            url: `${SITE}${path}`,
            provider: {
              '@type': 'EducationalOrganization',
              name: 'PRIM AI Institute',
              url: SITE,
            },
          },
        };
      }
    }

    // Tutorial detail (slug from the tutorial_data blob; lesson pages inherit)
    const tutMatch = path.match(/^\/tutorials\/([^/]+)(?:\/[^/]+)?\/?$/);
    if (tutMatch) {
      const data = await this.settingJson<{ tutorials?: { slug?: string; name?: string; description?: string; isVisible?: boolean }[] }>('tutorial_data');
      const tut = data?.tutorials?.find((t) => t.slug === tutMatch[1] && t.isVisible !== false);
      if (tut?.name) {
        return {
          title: `${tut.name} Tutorial - Free AI Training | PRIM AI Institute`,
          description: tut.description || `Free step-by-step ${tut.name} tutorials from PRIM AI Institute.`,
        };
      }
    }

    // Project detail (slug from the projects_data blob)
    const projMatch = path.match(/^\/projects\/([^/]+)\/?$/);
    if (projMatch) {
      const data = await this.settingJson<{ projects?: { slug?: string; title?: string; shortDescription?: string; coverImageUrl?: string; visible?: boolean }[] }>('projects_data');
      const proj = data?.projects?.find((p) => p.slug === projMatch[1] && p.visible !== false);
      if (proj?.title) {
        return {
          title: `${proj.title} - Student Project | PRIM AI Institute`,
          description: proj.shortDescription || DEFAULT_DESC,
          image: abs(proj.coverImageUrl) ?? DEFAULT_IMAGE,
        };
      }
    }

    // Static map (exact match, trailing slash tolerated)
    const normalized = path !== '/' && path.endsWith('/') ? path.slice(0, -1) : path;
    if (STATIC_META[normalized]) return { ...STATIC_META[normalized] };

    // Unknown route: default meta (SPA renders its own 404 UI client-side)
    return { title: DEFAULT_TITLE, description: DEFAULT_DESC };
  }

  // ── HTML injection ─────────────────────────────────────────────────────────
  async renderRoute(rawPath: string, nonce: string): Promise<string> {
    const path = (rawPath.split('?')[0] || '/').replace(/\/{2,}/g, '/');
    const meta = await this.resolveMeta(path);
    let html = this.readIndexHtml();

    const title = meta.title || DEFAULT_TITLE;
    const description = meta.description || DEFAULT_DESC;
    const image = meta.image || DEFAULT_IMAGE;
    const url = `${SITE}${path}`;

    // Stamp the request's CSP nonce onto EVERY <script> tag in the build (GTM
    // bootstrap, site-wide JSON-LD, and the Vite module entry point). Required
    // because 'strict-dynamic' makes browsers ignore the 'self' host-source
    // entirely, so the Vite entry script depends on this nonce to run at all -
    // missing it here would blank the whole site.
    html = html.replace(/<script(?=[ >])/g, `<script nonce="${nonce}"`);

    // Replace the static <title> and meta description
    html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`);
    html = html.replace(
      /<meta name="description"[^>]*\/?>/,
      `<meta name="description" content="${esc(description)}" />`,
    );

    // Strip the build's static OG/Twitter tags (we re-inject per-route below)
    html = html.replace(/[ \t]*<meta (?:property="og:|name="twitter:)[^>]*\/?>\s*\n?/g, '');

    const block = [
      `    <link rel="canonical" href="${esc(url)}" />`,
      `    <meta property="og:type" content="${esc(meta.ogType || 'website')}" />`,
      `    <meta property="og:site_name" content="PRIM AI Institute" />`,
      `    <meta property="og:url" content="${esc(url)}" />`,
      `    <meta property="og:title" content="${esc(title)}" />`,
      `    <meta property="og:description" content="${esc(description)}" />`,
      `    <meta property="og:image" content="${esc(image)}" />`,
      `    <meta property="og:image:width" content="1200" />`,
      `    <meta property="og:image:height" content="630" />`,
      `    <meta name="twitter:card" content="summary_large_image" />`,
      `    <meta name="twitter:title" content="${esc(title)}" />`,
      `    <meta name="twitter:description" content="${esc(description)}" />`,
      `    <meta name="twitter:image" content="${esc(image)}" />`,
      ...(meta.jsonLd
        ? [`    <script type="application/ld+json" nonce="${nonce}">${jsonLd(meta.jsonLd)}</script>`]
        : []),
    ].join('\n');

    return html.replace('</head>', `${block}\n  </head>`);
  }
}
