import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import { TokenData } from 'src/auth/auth.types';
import { FindPayloadType } from './types';

export const encryptPassword = (password: string) => {
  return crypto.createHmac('sha256', password).digest('hex');
};

export const extractTokenFromHeader = (authHeader: string): string | null => {
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
};

export const verifyToken = (
  token: string,
  secretKey: string,
): TokenData | null => {
  try {
    return jwt.verify(token, secretKey) as TokenData;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getFindQueryProps = (payload: FindPayloadType<any>) => {
  const {
    filter = {},
    options = {},
    ref = [],
    sort = {},
    where = {},
    projection = {},
  } = payload;

  return { filter, options, ref, sort, where, projection };
};

export const createAvatarURL = (role: string) => {
  return `https://ui-avatars.com/api/?name=${role}`;
};

