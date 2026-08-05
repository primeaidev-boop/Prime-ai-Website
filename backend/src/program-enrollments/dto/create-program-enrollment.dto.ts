import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProgramEnrollmentDto {
  @ApiProperty({ example: 'Rahul Sharma' })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  fullName: string;

  @ApiProperty({ example: '9876543210' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^[6-9]\d{9}$/, {
    message: 'Enter valid 10-digit Indian mobile number',
  })
  whatsappNumber: string;

  @ApiPropertyOptional({ example: 'Ahmedabad' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({ example: 'rahul@example.com' })
  @IsOptional()
  @IsEmail()
  @MaxLength(150)
  email?: string;

  @ApiPropertyOptional({ example: 'College Student' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  userType?: string;

  @ApiProperty({ example: '10-day-ai' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  programSlug: string;

  @ApiProperty({ example: '10-Day Hands-On AI Program' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  programTitle: string;

  @ApiProperty({ example: 'Batch 7' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  batchName: string;

  // Referral ref from ?ref= on the landing page. The client already
  // sanitizes, but the whitelist is re-applied here - never trust the client.
  // Nullable so the form can send an explicit null for direct traffic.
  @ApiPropertyOptional({ example: 'it_jobs_gujarat' })
  @IsOptional()
  @ValidateIf((_o, v) => v !== null)
  @IsString()
  @MaxLength(100)
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: 'source may only contain letters, numbers, hyphen and underscore',
  })
  source?: string | null;
}
