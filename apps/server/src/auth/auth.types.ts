import { APP_ROLES } from 'src/app/app.roles';
import { ProfileDocument } from '../profile/profile.model';
import { RegisterProfileDto } from './dto/register-profile.dto';

export type JwtPayload = {
  iat: number;
  exp: number;
  _id: string;
};

export type TokenData = {
  roles?: APP_ROLES[];
};

export type SignupPayload = {
  userInfo: RegisterProfileDto;
};

export type CreateToken = Pick<
  ProfileDocument,
  '_id' | 'email' | 'avatar' | 'roles'
> & {
  expireTime?: string;
};


