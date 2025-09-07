import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Res,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Response, Request } from 'express';

import { AuthService, ITokenReturnBody, ITokenShape } from './auth.service';
import { SignupPayload } from './auth.types';
import { LoginProfileDto } from './dto/login-profile.dto';
import { JwtAuthGuard } from './decorators/jwt-auth.guard';
import { User } from './decorators/user.decorator';
import { Profile } from '../profile/profile.model';
import {
  ResetPasswordDto,
  SendResetPasswordEmailDto,
} from './dto/password.dto';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Login Completed' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  async login(@Body() payload: LoginProfileDto, @Res() res: Response) {
    const result = await this.authService.login(payload, res);
    return res.status(HttpStatus.OK).json(result);
  }

  @Post('logout')
  @ApiResponse({ status: HttpStatus.OK, description: 'Logout Completed' })
  async logout(@Res() res: Response) {
    const result = await this.authService.logout(res);
    return res.status(HttpStatus.OK).json(result);
  }

  @Get('me')
  @ApiResponse({ status: HttpStatus.OK, description: 'User profile retrieved' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  async getProfile(@Req() req: Request, @Res() res: Response) {
    const token = req.cookies?.auth_token;
    if (!token) {
      return res.status(HttpStatus.UNAUTHORIZED).json({ message: 'No token provided' });
    }
    
    const user = await this.authService.getProfileFromToken(token);
    return res.status(HttpStatus.OK).json({ user });
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
  refresh(@Req() req: Request, @Res() res: Response): Promise<void> {
    return this.authService.refreshTokenFromRequest(req as any, res);
  }
}
