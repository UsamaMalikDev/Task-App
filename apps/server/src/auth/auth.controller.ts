import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { AuthService, ITokenReturnBody, ITokenShape } from './auth.service';
import { SignupPayload } from './auth.types';
import { LoginProfileDto } from './dto/login-profile.dto';
import {
  ResetPasswordDto,
  SendResetPasswordEmailDto,
} from '../auth/dto/passwors.dto';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Login Completed' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  async login(@Body() payload: LoginProfileDto): Promise<ITokenReturnBody> {
    return this.authService.login(payload);
  }

  @Post('register')
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Registration Completed',
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  register(@Body() signupPayload: SignupPayload): Promise<ITokenShape> {
    return this.authService.register(signupPayload);
  }

  @Post('reset-password-email')
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Sends reset password email.',
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  sendResetPasswordEmail(
    @Body() payload: SendResetPasswordEmailDto,
  ): Promise<boolean> {
    return this.authService.sendResetPasswordEmail(payload);
  }

  @Patch('reset-password')
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Updates Reset Password.',
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  resetPassword(@Body() payload: ResetPasswordDto): Promise<boolean> {
    return this.authService.resetPassword(payload);
  }

  @Get('verify-email/:token')
  @ApiOperation({
    summary: 'Verify the profile email through token',
  })
  @ApiOkResponse({
    description: 'Verified successfully',
  })
  @ApiBadRequestResponse({
    description: 'Verification failed',
  })
  verifyEmail(@Param('token') token: string): Promise<boolean> {
    return this.authService.verifyEmail(token);
  }

  @Post('refresh')
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Returned Refreshed Token',
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  refresh(@Body() body: { userId: string }): Promise<ITokenReturnBody> {
    return this.authService.refreshToken(body.userId);
  }
}
