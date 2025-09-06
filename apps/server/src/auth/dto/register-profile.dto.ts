import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterProfileDto {
  @ApiProperty({
    required: true, type: String, example: 'user@example.com'
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ type: String, example: 'FUTURENOSTICS_OFFICIAL' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  company: string;

  @ApiProperty({
    required: true, 
    type: String, 
    example: 'Usama'
  })
  @Matches(/^[a-zA-Z ]+$/)
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    required: true,
     type: String, 
     example: 'Usama@23'
  })
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @IsPhoneNumber('US')
  @ApiProperty({
    required: true, 
    type: String, 
    example: '+1234567890'
  })
  @IsNotEmpty()
  phone: string;
}
