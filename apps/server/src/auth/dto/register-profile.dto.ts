import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { VALID_ORGANIZATION_IDS } from 'src/utils/organizations';

export class RegisterProfileDto {
  @ApiProperty({
    required: true, type: String, example: 'user@example.com'
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ type: String, example: 'org_a_001' })
  @IsString()
  @IsNotEmpty()
  @IsIn(VALID_ORGANIZATION_IDS, { message: 'Invalid organization ID' })
  organizationId: string;

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
