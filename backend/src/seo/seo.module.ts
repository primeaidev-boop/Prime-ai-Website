import { Module } from '@nestjs/common';
import { SeoController } from './seo.controller';
import { SeoService } from './seo.service';
import { SeoRenderService } from './seo-render.service';

@Module({
  controllers: [SeoController],
  providers: [SeoService, SeoRenderService],
})
export class SeoModule {}
