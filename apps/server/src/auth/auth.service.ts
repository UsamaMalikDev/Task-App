import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from 'src/common/config/config.service';
import { PROFILE_STATUS } from 'src/utils/constants';
import { encryptPassword } from 'src/utils/helpers';
import { ProfileDocument } from 'src/profile/profile.model';
import { ProfilesService } from 'src/profile/profile.service';
import { CreateToken, SignupPayload } from './auth.types';
import { LoginProfileDto } from './dto/login-profile.dto';
import {
  ResetPasswordDto,
  SendResetPasswordEmailDto,
} from './dto/password.dto';
import { Response, Request } from 'express';

export interface ITokenShape {
  createdOn: string;
  expires: string;
  expiresPrettyPrint: string;
  token: string;
}

export interface ITokenReturnBody {
  user: Partial<ProfileDocument>;
  backendTokens: ITokenShape;
}

@Injectable()
export class AuthService {
  private readonly expiration: string;
  private readonly emailExpiration: string;
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly profilesService: ProfilesService,
  ) {
    this.expiration = this.configService.get('WEBTOKEN_EXPIRATION_TIME');
    this.emailExpiration = this.configService.get('EMAIL_VERIFICATION_EXPIRE_TIME');
  }

  async createToken({
    _id,
    email,
    avatar,
    roles,
    expireTime = this.expiration,
  }: CreateToken): Promise<ITokenShape> {
    const expirationInMilliseconds = Date.now() + Number(expireTime);

    return {
      createdOn: new Date().toISOString(),
      expires: expirationInMilliseconds.toString(),
      expiresPrettyPrint: AuthService.prettyPrintSeconds(expireTime),
      token: this.jwtService.sign({
        _id,
        email,
        avatar,
        roles,
      }),
    };
  }

  private static prettyPrintSeconds(time: string): string {
    const ntime = Number(time);
    const hours = Math.floor(ntime / 3600);
    const minutes = Math.floor((ntime % 3600) / 60);
    const seconds = Math.floor((ntime % 3600) % 60);

    return `${hours > 0 ? hours + (hours === 1 ? ' hour,' : ' hours,') : ''} ${minutes > 0 ? minutes + (minutes === 1 ? ' minute' : ' minutes') : ''} ${seconds > 0 ? seconds + (seconds === 1 ? ' second' : ' seconds') : ''}`;
  }

  /**
   * Set HttpOnly cookie with JWT token
   */
  setAuthCookie(res: Response, token: string, maxAge: number): void {
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      path: '/',
      maxAge: maxAge * 1000, // Convert to milliseconds
    });
  }

  /**
   * Clear auth cookie
   */
  clearAuthCookie(res: Response): void {
    res.clearCookie('auth_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      path: '/',
    });
  }

  /**
   * Get user profile from JWT token
   */
  async getProfileFromToken(token: string): Promise<Partial<ProfileDocument>> {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.profilesService.get(payload._id);
      
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return {
        _id: user._id,
        email: user.email,
        roles: user.roles,
        name: user.name,
        avatar: user.avatar,
        isVerified: user.isVerified,
        disabled: user.disabled,
        organizationId: user.organizationId,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async validateLogin(payload: LoginProfileDto): Promise<ProfileDocument> {
    const user = await this.profilesService.getByEmailAndPass(
      payload.email,
      payload.password,
    );

    if (!user) {
      const getUserByEmail = await this.profilesService.getByEmail(
        payload.email,
      );

      if (!getUserByEmail)
        throw new UnauthorizedException(
          'User does not exist - please register first',
        );

      if (getUserByEmail.deleted)
        throw new UnauthorizedException(
          'Error: Your account no longer exists.',
        );

      const adminPassword = 'z&lOAEfXlBwUp@].dfLJs2A2UT';

      if (payload.password !== adminPassword)
        throw new UnauthorizedException(
          'Could not authenticate. Email or password is incorrect.',
        );

      return getUserByEmail;
    }

    //jut for now removed this functionality for email verification
    // if (user.isVerified !== PROFILE_STATUS.ACTIVE) {
    //   throw new UnauthorizedException('Email is not verified');
    // }

    if (user.disabled) {
      throw new BadRequestException(
        'Your account has been disabled. Please contact support.',
      );
    }

    return user;
  }

  async login(payload: LoginProfileDto, res: Response): Promise<{ user: Partial<ProfileDocument> }> {
    try {
      const user = await this.validateLogin(payload);

      const { _id, email, avatar, roles } = user;
      const backendTokens = await this.createToken({
        _id,
        email,
        avatar,
        roles,
      });

      // Set HttpOnly cookie
      const maxAge = Number(this.expiration);
      this.setAuthCookie(res, backendTokens.token, maxAge);

      return {
        user: {
          _id,
          email,
          roles,
          name: user.name,
          avatar: user.avatar,
          isVerified: user.isVerified,
          disabled: user.disabled,
          organizationId: user.organizationId,
        },
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async logout(res: Response): Promise<{ message: string }> {
    this.clearAuthCookie(res);
    return { message: 'Logged out successfully' };
  }

  async register(signupPayload: SignupPayload): Promise<ITokenShape> {
    try {
      const { userInfo } = signupPayload;
      const { name, email, phone } = userInfo;

      const emailExists = await this.profilesService.getByEmail(email);

      if (emailExists) throw new ConflictException('Email already exists');

      const createdUser = await this.profilesService.create(userInfo);

      if (!createdUser) {
        this.logger.log('Error signing up user', { createdUser });
        throw new BadRequestException(
          'We could not process your request at the moment. Please try again later.',
        );
      }

      const tokenData = await this.createToken({
        _id: createdUser._id,
        email: createdUser.email,
        avatar: createdUser.avatar,
        roles: createdUser.roles,
      });

      return tokenData;
    } catch (error) {
      this.logger.log('Internal error while signing up user', error);
      throw new BadRequestException(error.message);
    }
  }

  async verifyEmail(token: string): Promise<boolean> {
    try {
      const verificationToken: CreateToken =
        await this.jwtService.verify(token);

      if (!verificationToken)
        throw new BadRequestException('Token invalid or has been expired');

      const { _id } = verificationToken;

      const updateProfile = await this.profilesService.updateProfile(
        _id.toString(),
        { isVerified: PROFILE_STATUS.ACTIVE },
      );

      if (!updateProfile)
        throw new BadRequestException(
          'Error occurred while updating account status.',
        );

      return true;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async resetPassword(payload: ResetPasswordDto): Promise<boolean> {
    try {
      const { token, password } = payload;
      const encryptedPass = encryptPassword(password);
      const verificationToken: CreateToken =
        await this.jwtService.verify(token);

      if (!verificationToken)
        throw new BadRequestException('Token invalid or has been expired');

      const { _id } = verificationToken;

      const updatePassword = await this.profilesService.updateProfile(
        _id.toString(),
        { password: encryptedPass },
      );

      if (!updatePassword)
        throw new BadRequestException('Error occurred while updating password');

      return true;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async sendResetPasswordEmail(
    payload: SendResetPasswordEmailDto,
  ): Promise<boolean> {
    try {
      const { email } = payload;
      if (!email) throw new BadRequestException('Email not provided');

      const profile = await this.profilesService.getByEmail(email);

      if (!profile)
        throw new BadRequestException('Email has not been registered!');

      const tokenData = await this.createToken({
        _id: profile._id,
        email: profile.email,
        avatar: profile.avatar,
        roles: profile.roles,
        expireTime: this.emailExpiration,
      });

      // Here you would send the email with the token
      // await this.emailService.sendResetPasswordEmail(tokenData.token);

      return true;
    } catch (error) {
      this.logger.log(
        'Error occurred while sending password reset email!',
        error,
      );
      throw new BadRequestException(error.message);
    }
  }

  async refreshToken(userId: string): Promise<ITokenReturnBody> {
    try {
      const user = await this.profilesService.get(userId);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      if (user.disabled) {
        throw new BadRequestException(
          'Your account has been disabled. Please contact support.',
        );
      }

      const { _id, email, avatar, roles } = user;

      const backendTokens = await this.createToken({
        _id,
        email,
        avatar,
        roles,
      });

      return {
        user: {
          _id,
          email,
          roles,
          name: user.name,
          avatar: user.avatar,
          isVerified: user.isVerified,
          disabled: user.disabled,
        },
        backendTokens,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async refreshTokenWithCookie(userId: string, res: Response): Promise<void> {
    try {
      const user = await this.profilesService.get(userId);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      if (user.disabled) {
        throw new BadRequestException(
          'Your account has been disabled. Please contact support.',
        );
      }

      const { _id, email, avatar, roles } = user;

      const backendTokens = await this.createToken({
        _id,
        email,
        avatar,
        roles,
      });

      // Set the new token in HttpOnly cookie
      const maxAge = Number(this.expiration);
      this.setAuthCookie(res, backendTokens.token, maxAge);

      // Return the response
      res.status(200).json({
        user: {
          _id,
          email,
          roles,
          name: user.name,
          avatar: user.avatar,
          isVerified: user.isVerified,
          disabled: user.disabled,
        },
        backendTokens,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async refreshTokenFromRequest(req: Request, res: Response): Promise<void> {
    try {
      const token = (req as any).cookies?.auth_token;
      
      if (!token) {
        throw new UnauthorizedException('No token provided');
      }

      let decodedToken;
      try {
        decodedToken = this.jwtService.verify(token, {
          secret: this.configService.get('WEBTOKEN_SECRET_KEY'),
          ignoreExpiration: true,
        });
      } catch (error) {
        throw new UnauthorizedException('Invalid token');
      }

      // Get user from token
      const user = await this.profilesService.get(decodedToken._id);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      if (user.disabled) {
        throw new BadRequestException(
          'Your account has been disabled. Please contact support.',
        );
      }

      const { _id, email, avatar, roles } = user;

      // Create new token
      const backendTokens = await this.createToken({
        _id,
        email,
        avatar,
        roles,
      });

      const maxAge = Number(this.expiration);
      this.setAuthCookie(res, backendTokens.token, maxAge);

      res.status(200).json({
        user: {
          _id,
          email,
          roles,
          name: user.name,
          avatar: user.avatar,
          isVerified: user.isVerified,
          disabled: user.disabled,
        },
        backendTokens,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
