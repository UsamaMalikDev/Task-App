import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { AuthenticatedUser } from '../../common/types/user.types';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): AuthenticatedUser | null => {
    const request = ctx.switchToHttp().getRequest();
    
    // The JWT strategy should have already validated the token and set the user
    // in the request object
    if (request.user) return request.user as AuthenticatedUser;
    return null;
  },
);
