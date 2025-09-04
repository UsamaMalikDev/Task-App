import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    required: true,
  })
  @IsString()
  token: string;

  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}

export class SendResetPasswordEmailDto {
  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  email: string;
}
