import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const Profile = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    if (request.user && request.user._id) return request.user._id;
    return null;
  },
);
