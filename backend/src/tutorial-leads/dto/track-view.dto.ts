import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TrackViewDto {
  @ApiProperty({ example: '9876543210' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^[6-9]\d{9}$/, {
    message: 'Enter valid 10-digit Indian mobile number',
  })
  mobile: string;

  @ApiProperty({ example: 'chatgpt' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  tutorialAccessed: string;
}
