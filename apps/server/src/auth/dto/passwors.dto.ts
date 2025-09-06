import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    required: true,
    type: String,
  })
  @IsString()
  token: string;

  @ApiProperty({
    required: true,
    type: String,
  })
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}

export class SendResetPasswordEmailDto {
  @ApiProperty({
    required: true,
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  email: string;
}
