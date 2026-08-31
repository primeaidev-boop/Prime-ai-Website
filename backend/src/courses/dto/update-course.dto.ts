import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsInt,
  Min,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateCourseHeroDto {
  @IsOptional() @IsString() badgeText?: string;
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() tagline?: string;
  @IsOptional() @IsString() heroImageUrl?: string;
  @IsOptional() @IsString() duration?: string;
  @IsOptional() @IsString() mentorship?: string;
  @IsOptional() @IsString() trainingDays?: string;
  @IsOptional() @IsString() language?: string;
  @IsOptional() @IsString() mode?: string;
  @IsOptional() @IsString() certificate?: string;
  @IsOptional() @IsString() placementInfo?: string;
  @IsOptional() @IsString() levelLabel?: string;
  @IsOptional() @IsString() ctaDemoText?: string;
  @IsOptional() @IsString() ctaWaText?: string;
  @IsOptional() @IsString() ctaDownloadText?: string;
  /** Shown when a visitor clicks any WhatsApp link on this course's page. Empty/null falls back to the site default (contact_whatsapp_message). */
  @IsOptional() @IsString() @MaxLength(500) whatsappMessage?: string;
}

export class WhoItemDto {
  @IsString() emoji: string;
  @IsString() title: string;
  @IsString() desc: string;
  @IsInt() @Min(0) order: number;
}

export class UpdateWhoItemsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WhoItemDto)
  items: WhoItemDto[];
}

export class ModuleDto {
  @IsString() label: string;
  @IsString() title: string;
  @IsArray() @IsString({ each: true }) topics: string[];
  @IsInt() @Min(0) order: number;
}

export class UpdateModulesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ModuleDto)
  items: ModuleDto[];
}

export class ToolDto {
  @IsString() emoji: string;
  @IsString() name: string;
  @IsString() category: string;
  @IsInt() @Min(0) order: number;
}

export class UpdateToolsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ToolDto)
  items: ToolDto[];
}

export class OutcomeDto {
  @IsString() title: string;
  @IsString() desc: string;
  @IsInt() @Min(0) order: number;
}

export class UpdateOutcomesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OutcomeDto)
  items: OutcomeDto[];
}

export class UpdateBeforeAfterDto {
  @IsArray() @IsString({ each: true }) beforeItems: string[];
  @IsArray() @IsString({ each: true }) afterItems: string[];
}

export class EligibilityItemDto {
  @IsString() text: string;
  @IsInt() @Min(0) order: number;
}

export class UpdateEligibilityDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EligibilityItemDto)
  items: EligibilityItemDto[];
}

export class FaqDto {
  @IsString() question: string;
  @IsString() answer: string;
  @IsInt() @Min(0) order: number;
}

export class UpdateFaqsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FaqDto)
  items: FaqDto[];
}

export class TestimonialDto {
  @IsString() initials: string;
  @IsString() name: string;
  @IsString() meta: string;
  @IsString() avatarGrad: string;
  @IsString() quote: string;
  @IsString() before: string;
  @IsString() after: string;
  @IsInt() @Min(0) order: number;
}

export class UpdateTestimonialsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TestimonialDto)
  items: TestimonialDto[];
}

export class UpdateListingPageDto {
  @IsOptional() @IsString() heroTag?: string;
  @IsOptional() @IsString() heroHeadingMain?: string;
  @IsOptional() @IsString() heroHeadingAccent?: string;
  @IsOptional() @IsString() heroSubtitle?: string;
  @IsOptional() @IsString() whoTag?: string;
  @IsOptional() @IsString() whoHeadingMain?: string;
  @IsOptional() @IsString() whoHeadingAccent?: string;
  @IsOptional() @IsString() ctaTag?: string;
  @IsOptional() @IsString() ctaHeading?: string;
  @IsOptional() @IsString() ctaDesc?: string;
  @IsOptional() @IsString() ctaBtnPrimary?: string;
  @IsOptional() @IsString() ctaBtnSecondary?: string;
}

export class ListingWhoCardDto {
  @IsString() emoji: string;
  @IsString() title: string;
  @IsString() desc: string;
  @IsInt() @Min(0) order: number;
}

export class UpdateListingWhoCardsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ListingWhoCardDto)
  items: ListingWhoCardDto[];
}
