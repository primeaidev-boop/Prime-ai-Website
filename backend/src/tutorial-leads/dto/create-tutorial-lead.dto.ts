import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTutorialLeadDto {
  @ApiProperty({ example: 'Rahul Sharma' })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  fullName: string;

  @ApiProperty({ example: '9876543210' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^[6-9]\d{9}$/, {
    message: 'Enter valid 10-digit Indian mobile number',
  })
  mobile: string;

  @ApiProperty({ example: 'Ahmedabad' })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  city: string;

  @ApiProperty({ example: 'College Student' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  userType: string;

  @ApiProperty({ example: 'chatgpt' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  tutorialAccessed: string;

  @ApiProperty({ example: '/tutorials' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  sourcePage: string;
}
