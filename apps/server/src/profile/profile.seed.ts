import { Profile } from './profile.model';
import { APP_ROLES } from '../app/app.roles';
import { PROFILE_STATUS } from '../utils/constants';
import { ORGANIZATIONS } from '../utils/organizations';

export const profileSeedData: Partial<Profile>[] = [
  // Organization A Users
  {
    email: 'admin@orga.com',
    password: 'password123', // Will be hashed before insertion
    name: 'Admin User',
    phone: '+1234567890',
    isVerified: PROFILE_STATUS.ACTIVE,
    avatar: 'https://ui-avatars.com/api/?name=Admin+User',
    roles: [APP_ROLES.ADMIN],
    organizationId: ORGANIZATIONS.ORG_A.id,
    disabled: false,
    deleted: false,
  },
  {
    email: 'manager@orga.com',
    password: 'password123',
    name: 'Manager User',
    phone: '+1234567891',
    isVerified: PROFILE_STATUS.ACTIVE,
    avatar: 'https://ui-avatars.com/api/?name=Manager+User',
    roles: [APP_ROLES.MANAGER],
    organizationId: ORGANIZATIONS.ORG_A.id,
    disabled: false,
    deleted: false,
  },
  {
    email: 'user1@orga.com',
    password: 'password123',
    name: 'John Doe',
    phone: '+1234567892',
    isVerified: PROFILE_STATUS.ACTIVE,
    avatar: 'https://ui-avatars.com/api/?name=User+Usama',
    roles: [APP_ROLES.USER],
    organizationId: ORGANIZATIONS.ORG_A.id,
    disabled: false,
    deleted: false,
  },
  {
    email: 'user2@orga.com',
    password: 'password123',
    name: 'Jane Smith',
    phone: '+1234567893',
    isVerified: PROFILE_STATUS.ACTIVE,
    avatar: 'https://ui-avatars.com/api/?name=Malik+Usama',
    roles: [APP_ROLES.USER],
    organizationId: ORGANIZATIONS.ORG_A.id,
    disabled: false,
    deleted: false,
  },
  // Organization B Users
  {
    email: 'user1@orgb.com',
    password: 'password123',
    name: 'Alice Johnson',
    phone: '+1234567894',
    isVerified: PROFILE_STATUS.ACTIVE,
    avatar: 'https://ui-avatars.com/api/?name=Usama+Malik',
    roles: [APP_ROLES.USER],
    organizationId: ORGANIZATIONS.ORG_B.id,
    disabled: false,
    deleted: false,
  },
  {
    email: 'user2@orgb.com',
    password: 'password123',
    name: 'Bob Wilson',
    phone: '+1234567895',
    isVerified: PROFILE_STATUS.ACTIVE,
    avatar: 'https://ui-avatars.com/api/?name=Osama+Malik',
    roles: [APP_ROLES.USER],
    organizationId: ORGANIZATIONS.ORG_B.id,
    disabled: false,
    deleted: false,
  },
];
