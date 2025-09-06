import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class LoginProfileDto {
  @ApiProperty({
    required: true, type: String, example: 'user@example.com'
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    required: true, type: String, example: 'myPass@123'
  })
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}
