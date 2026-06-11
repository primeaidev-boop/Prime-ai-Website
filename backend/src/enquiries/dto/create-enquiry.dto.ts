// DTO for creating an enquiry — extends booking fields with email and message

import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Profile, Course } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEnquiryDto {
  @ApiProperty({ example: 'Priya Patel' })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @ApiProperty({ example: '9876543210' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^[6-9]\d{9}$/, {
    message: 'Enter valid 10-digit Indian mobile number',
  })
  phone: string;

  @ApiPropertyOptional({ example: 'priya@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ enum: Profile })
  @IsNotEmpty()
  @IsEnum(Profile)
  profile: Profile;

  @ApiProperty({ enum: Course })
  @IsNotEmpty()
  @IsEnum(Course)
  courseInterest: Course;

  @ApiProperty({ example: 'I want to learn AI for my business' })
  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  message: string;
}
