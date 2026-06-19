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

    // Local disk storage — used when DO Spaces is not configured
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
}
