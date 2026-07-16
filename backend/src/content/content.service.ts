import { BadRequestException, Injectable, PayloadTooLargeException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

// Whitelist: only known page documents can be created/read. Prevents the
// endpoint being used as an arbitrary key/value dump.
export const CONTENT_KEYS = [
  'programPages',
  'projects',
  'tutorials',
  'homePage',
  'aboutPage',
  'coursesPage',
  'contactPage',
] as const;
export type ContentKey = (typeof CONTENT_KEYS)[number];

// Hard cap per document (serialized). Nginx/Express already cap bodies at
// 10 MB; this keeps a single page document sane and protects the DB.
const MAX_CONTENT_BYTES = 4 * 1024 * 1024; // 4 MB

@Injectable()
export class ContentService {
  constructor(private prisma: PrismaService) {}

  assertValidKey(key: string): asserts key is ContentKey {
    if (!(CONTENT_KEYS as readonly string[]).includes(key)) {
      throw new BadRequestException(`Unknown content key '${key}'`);
    }
  }

  /** Public read. Returns null when nothing has been published yet - the
   *  frontend falls back to its bundled default data in that case. */
  async get(key: string): Promise<{ key: string; content: Prisma.JsonValue; updatedAt: Date } | null> {
    this.assertValidKey(key);
    const row = await this.prisma.pageContent.findUnique({ where: { key } });
    return row ? { key: row.key, content: row.content, updatedAt: row.updatedAt } : null;
  }

  /** Admin write. Upserts the whole document. */
  async put(key: string, content: unknown): Promise<{ ok: true; updatedAt: Date }> {
    this.assertValidKey(key);
    if (content === null || typeof content !== 'object') {
      throw new BadRequestException('Content must be a JSON object or array');
    }
    const serialized = JSON.stringify(content);
    if (Buffer.byteLength(serialized, 'utf8') > MAX_CONTENT_BYTES) {
      throw new PayloadTooLargeException(
        `Content for '${key}' exceeds ${MAX_CONTENT_BYTES / 1024 / 1024} MB. ` +
        'Large images must be uploaded as files, not embedded as base64.',
      );
    }
    const row = await this.prisma.pageContent.upsert({
      where: { key },
      update: { content: content as Prisma.InputJsonValue },
      create: { key, content: content as Prisma.InputJsonValue },
    });
    return { ok: true, updatedAt: row.updatedAt };
  }
}
