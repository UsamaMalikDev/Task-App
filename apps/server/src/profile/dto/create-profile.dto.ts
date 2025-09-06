import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  Matches,
  MinLength,
} from 'class-validator';

import { APP_ROLES } from 'src/app/app.roles';
import { BaseModel } from 'src/common/models/base.model';
import { PROFILE_STATUS } from 'src/utils/constants';

export class CreateProfileDto extends BaseModel {
  @ApiProperty({
    required: true, type: String, example: 'user@example.com'
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    required: true, type: String, example: 'Usama'
  })
  @Matches(/^[a-zA-Z ]+$/)
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    required: false, type: String, example: 'https://ui-avatars.com/api/?name=Usama'
  })
  @IsOptional()
  avatar: string;

  @ApiProperty({
    required: true,
    enum: PROFILE_STATUS,
  })
  isVerified: string;

  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @IsEnum(APP_ROLES, { each: true })
  @ApiProperty({
    required: true,
    enum: APP_ROLES,
    type: [String],
    example: APP_ROLES.USER,
  })
  roles: APP_ROLES[];

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ required: false })
  disabled?: boolean;
}
