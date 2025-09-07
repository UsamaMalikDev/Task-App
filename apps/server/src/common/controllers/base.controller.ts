import { UnauthorizedException } from '@nestjs/common';
import { AuthenticatedUser, UserContext, RBACContext } from '../types/user.types';

export abstract class BaseController {
  protected extractUserContext(user: AuthenticatedUser): UserContext {
    if (!user || !user._id) throw new UnauthorizedException('User not authenticated');
    

    return {
      userId: user._id,
      userRoles: user.roles || [],
      organizationId: user.organizationId
    };
  }

  protected extractRBACContext(user: AuthenticatedUser): RBACContext {
    const userContext = this.extractUserContext(user);
    
    let userRole: 'USER' | 'MANAGER' | 'ADMIN' = 'USER';
    if (userContext.userRoles.includes('ADMIN')) userRole = 'ADMIN';
    else if (userContext.userRoles.includes('MANAGER')) userRole = 'MANAGER';

    return {
      ...userContext,
      userRole,
    };
  }
}
