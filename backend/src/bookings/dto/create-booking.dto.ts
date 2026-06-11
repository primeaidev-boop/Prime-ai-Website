// DTO for creating a demo booking — validates Indian mobile and enum fields

import {
  IsEnum,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Profile, Course } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty({ example: 'Rahul Sharma' })
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

  @ApiProperty({ enum: Profile })
  @IsNotEmpty()
  @IsEnum(Profile)
  profile: Profile;

  @ApiProperty({ enum: Course })
  @IsNotEmpty()
  @IsEnum(Course)
  courseInterest: Course;
}
