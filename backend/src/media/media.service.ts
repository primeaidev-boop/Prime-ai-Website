import {
  Injectable,
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';
import { lookup as dnsLookup } from 'dns/promises';
import { isIP } from 'net';

export type MediaVariant = 'cover' | 'content' | 'avatar';

interface VariantSpec {
  width: number;
  height?: number;
  fit: 'cover' | 'inside';
}

const VARIANT_SPECS: Record<MediaVariant, VariantSpec> = {
  cover:   { width: 1600, height: 900, fit: 'cover' },
  content: { width: 1200, fit: 'inside' },
  avatar:  { width: 200, height: 200, fit: 'cover' },
};

export interface UploadResult {
  url: string;
  originalSizeKb: number;
  convertedSizeKb: number;
  width: number;
  height: number;
}

@Injectable()
export class MediaService {
  private readonly spacesKey: string;
  private readonly spacesSecret: string;
  private readonly spacesEndpoint: string;
  private readonly bucket: string;
  private readonly cdnUrl: string;
  private readonly spacesConfigured: boolean;

  // Local disk fallback
  private readonly uploadDir: string;
  private readonly publicUrl: string;

  constructor(private config: ConfigService) {
    this.spacesKey      = config.get<string>('DO_SPACES_KEY', '');
    this.spacesSecret   = config.get<string>('DO_SPACES_SECRET', '');
    this.spacesEndpoint = config.get<string>('DO_SPACES_ENDPOINT', '');
    this.bucket         = config.get<string>('DO_SPACES_BUCKET', '');
    this.cdnUrl         = config.get<string>('DO_SPACES_CDN_URL', '');

    this.spacesConfigured =
      Boolean(this.spacesKey) &&
      Boolean(this.spacesSecret) &&
      Boolean(this.spacesEndpoint) &&
      Boolean(this.bucket) &&
      Boolean(this.cdnUrl);

    // Local disk storage - used when DO Spaces is not configured
    this.uploadDir = config.get<string>('UPLOAD_DIR', '/var/www/primai/uploads');
    this.publicUrl = config.get<string>('PUBLIC_URL', 'http://64.227.143.243');
  }

  private getS3(): S3Client {
    if (!this.spacesConfigured) {
      throw new ServiceUnavailableException('DO Spaces not configured');
    }
    return new S3Client({
      endpoint: this.spacesEndpoint,
      region: 'us-east-1',
      credentials: {
        accessKeyId: this.spacesKey,
        secretAccessKey: this.spacesSecret,
      },
      forcePathStyle: false,
    });
  }

  async upload(
    buffer: Buffer,
    originalName: string,
    variant: MediaVariant = 'content',
  ): Promise<UploadResult> {
    const spec = VARIANT_SPECS[variant];
    const originalSizeKb = Math.round(buffer.length / 1024);

    let pipeline = sharp(buffer).rotate();

    if (spec.height) {
      pipeline = pipeline.resize(spec.width, spec.height, { fit: spec.fit });
    } else {
      pipeline = pipeline.resize(spec.width, undefined, {
        fit: spec.fit,
        withoutEnlargement: true,
      });
    }

    const { data: webpBuffer, info } = await pipeline
      .webp({ quality: 82 })
      .toBuffer({ resolveWithObject: true });

    const convertedSizeKb = Math.round(webpBuffer.length / 1024);
    const key = this.buildKey(originalName, variant);

    let url: string;

    if (this.spacesConfigured) {
      // Upload to DO Spaces / S3-compatible storage
      const s3 = this.getS3();
      await s3.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: webpBuffer,
          ContentType: 'image/webp',
          ACL: 'public-read' as never,
          CacheControl: 'public, max-age=31536000, immutable',
        }),
      );
      url = `${this.cdnUrl.replace(/\/$/, '')}/${key}`;
    } else {
      // Fallback: save to local disk, served by Nginx at /uploads/*
      const destPath = path.join(this.uploadDir, key);
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      fs.writeFileSync(destPath, webpBuffer);
      url = `${this.publicUrl.replace(/\/$/, '')}/uploads/${key}`;
    }

    return {
      url,
      originalSizeKb,
      convertedSizeKb,
      width: info.width,
      height: info.height,
    };
  }

  private buildKey(originalName: string, variant: MediaVariant): string {
    const base = originalName
      .replace(/\.[^.]+$/, '')
      .replace(/[^a-z0-9]/gi, '-')
      .toLowerCase()
      .slice(0, 60);
    const ts = Date.now();
    return `blog/${variant}/${ts}-${base}.webp`;
  }

  validateMimeType(mimetype: string): void {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(mimetype)) {
      throw new BadRequestException(
        `Unsupported file type: ${mimetype}. Allowed: jpg, png, webp, gif`,
      );
    }
  }

  validateVideoMimeType(mimetype: string): void {
    if (!['video/mp4', 'video/webm'].includes(mimetype)) {
      throw new BadRequestException(
        `Unsupported video type: ${mimetype}. Allowed: mp4, webm`,
      );
    }
  }

  /**
   * Stores a short looping video for program-page media slots. Unlike images
   * there is no sharp re-encode - the file is stored byte-for-byte (with a
   * sanitized name), so what the admin previews is exactly what visitors
   * stream. Nginx serves /uploads/* statically, which gives correct
   * Content-Type by extension and HTTP range-request support out of the box.
   */
  async uploadVideo(
    buffer: Buffer,
    originalName: string,
    mimetype: string,
  ): Promise<{ url: string; sizeKb: number }> {
    const MAX_BYTES = 15 * 1024 * 1024;
    if (buffer.length > MAX_BYTES) {
      throw new BadRequestException('Videos are capped at 15 MB');
    }
    const ext = mimetype === 'video/webm' ? 'webm' : 'mp4';
    const base = originalName
      .replace(/\.[^.]+$/, '')
      .replace(/[^a-z0-9]/gi, '-')
      .toLowerCase()
      .slice(0, 60);
    const key = `program/video/${Date.now()}-${base}.${ext}`;

    let url: string;
    if (this.spacesConfigured) {
      const s3 = this.getS3();
      await s3.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: buffer,
          ContentType: mimetype,
          ACL: 'public-read' as never,
          CacheControl: 'public, max-age=31536000, immutable',
        }),
      );
      url = `${this.cdnUrl.replace(/\/$/, '')}/${key}`;
    } else {
      const destPath = path.join(this.uploadDir, key);
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      fs.writeFileSync(destPath, buffer);
      url = `${this.publicUrl.replace(/\/$/, '')}/uploads/${key}`;
    }

    return { url, sizeKb: Math.round(buffer.length / 1024) };
  }

  /**
   * Convert a Google Drive share link to its thumbnail-redirect form.
   * Kept in sync by hand with frontend/src/lib/imageUrl.ts (separate build,
   * can't share a module across the two apps) - same regexes, same intent.
   */
  private convertDriveUrl(raw: string): string {
    const m1 = raw.match(/drive\.google\.com\/file\/d\/([^/?#]+)/);
    if (m1) return `https://drive.google.com/thumbnail?id=${m1[1]}&sz=w1200`;
    const m2 = raw.match(/drive\.google\.com\/(?:open|uc)\?[^#]*[?&]?id=([^&#]+)/);
    if (m2) return `https://drive.google.com/thumbnail?id=${m2[1]}&sz=w1200`;
    return raw;
  }

  /** Reject loopback/private/link-local targets so an admin pasting a URL
   *  can't be used to make the server fetch its own internal endpoints. */
  private async assertPublicHost(hostname: string): Promise<void> {
    const candidates = isIP(hostname)
      ? [hostname]
      : (await dnsLookup(hostname, { all: true })).map((r) => r.address);
    const isPrivate = (ip: string) =>
      /^127\.|^10\.|^192\.168\.|^169\.254\.|^0\.|^::1$|^fc00:|^fe80:/.test(ip) ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(ip);
    if (candidates.length === 0 || candidates.some(isPrivate)) {
      throw new BadRequestException('That URL points to a non-public address and cannot be fetched');
    }
  }

  /**
   * Fetches an external image (e.g. a Google Drive link) exactly once,
   * server-side, and re-hosts it through the normal upload pipeline. This
   * is the permanent fix for hotlinked images: drive.google.com/thumbnail
   * and lh3.googleusercontent.com are Drive's on-demand preview generator,
   * not a CDN - Google gives no uptime guarantee for external embedding
   * and can throttle or fail the request per-viewer with no warning, even
   * when the file is correctly shared as public. Downloading once and
   * serving from our own domain removes that dependency entirely.
   */
  async fetchFromUrl(
    sourceUrl: string,
    variant: MediaVariant = 'content',
  ): Promise<UploadResult> {
    let parsed: URL;
    try {
      parsed = new URL(this.convertDriveUrl(sourceUrl));
    } catch {
      throw new BadRequestException('Not a valid URL');
    }
    if (parsed.protocol !== 'https:') {
      throw new BadRequestException('Only https:// URLs are supported');
    }
    await this.assertPublicHost(parsed.hostname);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);
    let res: Response;
    try {
      res = await fetch(parsed.toString(), {
        signal: controller.signal,
        redirect: 'follow',
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PrimAIBot/1.0)' },
      });
    } catch {
      throw new BadRequestException('Could not reach that URL (timed out or unreachable)');
    } finally {
      clearTimeout(timeout);
    }
    if (!res.ok) {
      throw new BadRequestException(`Source returned HTTP ${res.status} - the file may not be public`);
    }
    const contentType = res.headers.get('content-type') ?? '';
    if (!contentType.startsWith('image/')) {
      throw new BadRequestException(
        `That URL did not return an image (got '${contentType || 'unknown'}') - ` +
        'for Google Drive, confirm the file is shared as "Anyone with the link can view"',
      );
    }

    const MAX_BYTES = 15 * 1024 * 1024;
    const contentLength = Number(res.headers.get('content-length') ?? 0);
    if (contentLength > MAX_BYTES) {
      throw new BadRequestException('Source image exceeds the 15 MB fetch limit');
    }
    const arrayBuffer = await res.arrayBuffer();
    if (arrayBuffer.byteLength > MAX_BYTES) {
      throw new BadRequestException('Source image exceeds the 15 MB fetch limit');
    }
    const buffer = Buffer.from(arrayBuffer);
    this.validateMimeType(contentType.split(';')[0].trim());

    return this.upload(buffer, `fetched-${Date.now()}`, variant);
  }
}
