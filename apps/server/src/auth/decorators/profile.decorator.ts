import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const Profile = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    
    // The JWT strategy should have already validated the token and set the user
    // in the request object
    if (request.user && request.user._id) return request.user._id;
    return null;
  },
);
