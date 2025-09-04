import { SetMetadata } from '@nestjs/common';
import { APP_ROLES } from 'src/app/app.roles';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: APP_ROLES[]) => SetMetadata(ROLES_KEY, roles);
