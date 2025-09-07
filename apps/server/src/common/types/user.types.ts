export interface AuthenticatedUser {
  _id: string;
  email: string;
  roles: string[];
  organizationId?: string;
  avatar?: string;
  name?: string;
  isVerified?: string;
  disabled?: boolean;
}

export interface UserContext {
  userId: string;
  userRoles: string[];
  organizationId: string;
}

export interface RBACContext extends UserContext {
  userRole: 'USER' | 'MANAGER' | 'ADMIN';
}
