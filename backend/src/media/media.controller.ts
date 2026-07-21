import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MediaService, MediaVariant } from './media.service';
import { IsIn, IsOptional, IsUrl } from 'class-validator';

class FetchUrlDto {
  @IsUrl({ protocols: ['https'], require_protocol: true })
  url: string;

  @IsOptional()
  @IsIn(['cover', 'content', 'avatar'])
  variant?: MediaVariant;
}

const MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024; // 8 MB
// Videos skip the sharp pipeline and are stored as-is, so they get a higher
// cap - the admin UI still tells editors to aim for ~5 MB loops.
const MAX_VIDEO_SIZE_BYTES = 15 * 1024 * 1024; // 15 MB

@ApiTags('media')
@Controller()
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('admin/media/upload')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_VIDEO_SIZE_BYTES },
    }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Query('variant') variant: MediaVariant = 'content',
  ) {
    if (!file) {
      return { error: 'No file uploaded' };
    }
    if (file.mimetype.startsWith('video/')) {
      this.mediaService.validateVideoMimeType(file.mimetype);
      return this.mediaService.uploadVideo(
        file.buffer,
        file.originalname,
        file.mimetype,
      );
    }
    if (file.buffer.length > MAX_IMAGE_SIZE_BYTES) {
      throw new BadRequestException('Images are capped at 8 MB');
    }
    this.mediaService.validateMimeType(file.mimetype);
    return this.mediaService.upload(file.buffer, file.originalname, variant);
  }

  /**
   * Fetches an external image (Google Drive share link, etc.) once and
   * re-hosts it under our own domain. Fixes the "works in admin preview,
   * broken for visitors" failure mode of hotlinking Drive/Photos URLs -
   * see MediaService.fetchFromUrl for why that happens.
   */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('admin/media/fetch-url')
  async fetchUrl(@Body() body: FetchUrlDto) {
    return this.mediaService.fetchFromUrl(body.url, body.variant ?? 'content');
  }
}
