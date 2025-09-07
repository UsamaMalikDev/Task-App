import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from 'src/common/config/config.service';
import { ProfilesService } from 'src/profile/profile.service';
import { JwtPayload } from './auth.types';
import { Profile } from 'src/profile/profile.model';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly profilesService: ProfilesService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.auth_token;
        },
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get('WEBTOKEN_SECRET_KEY'),
    });
  }

  async validate(
    { iat, exp, _id }: JwtPayload,
    done: (arg0: null, arg1: Profile) => void,
  ): Promise<boolean> {
    const timeDiff = exp - iat;
    if (timeDiff <= 0) throw new UnauthorizedException();

    const user = await this.profilesService.get(_id);
    if (!user) throw new UnauthorizedException();
    done(null, user);
    return true;
  }
}
