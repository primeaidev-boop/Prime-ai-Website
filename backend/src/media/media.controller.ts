import {
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

const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024; // 8 MB

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
      limits: { fileSize: MAX_FILE_SIZE_BYTES },
    }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Query('variant') variant: MediaVariant = 'content',
  ) {
    if (!file) {
      return { error: 'No file uploaded' };
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
