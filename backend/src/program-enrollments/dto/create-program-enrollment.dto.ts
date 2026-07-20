import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
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
}
