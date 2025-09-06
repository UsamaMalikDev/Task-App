import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { APP_ROLES } from 'src/app/app.roles';
import { ROLES_KEY } from './role.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<APP_ROLES[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) return true;
    

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (user.disabled) {
      console.error({ error: 'User is disabled' });
      return false;
    }

    if (!user) {
      console.error({ error: 'User not found' });
      return false;
    }

    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}
