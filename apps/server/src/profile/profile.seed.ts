import { Profile } from './profile.model';
import { APP_ROLES } from '../app/app.roles';
import { PROFILE_STATUS } from '../utils/constants';

export const profileSeedData: Partial<Profile>[] = [
  // Organization A Users
  {
    email: 'admin@orga.com',
    password: 'password123', // Will be hashed before insertion
    name: 'Admin User',
    isVerified: PROFILE_STATUS.ACTIVE,
    avatar: 'https://ui-avatars.com/api/?name=Admin+User',
    roles: [APP_ROLES.ADMIN],
    organization: 'orgA',
    disabled: false,
  },
  {
    email: 'manager@orga.com',
    password: 'password123',
    name: 'Manager User',
    isVerified: PROFILE_STATUS.ACTIVE,
    avatar: 'https://ui-avatars.com/api/?name=Manager+User',
    roles: [APP_ROLES.MANAGER],
    organization: 'orgA',
    disabled: false,
  },
  {
    email: 'user1@orga.com',
    password: 'password123',
    name: 'John Doe',
    isVerified: PROFILE_STATUS.ACTIVE,
    avatar: 'https://ui-avatars.com/api/?name=John+Doe',
    roles: [APP_ROLES.CONTRACTOR],
    organization: 'orgA',
    disabled: false,
  },
  {
    email: 'user2@orga.com',
    password: 'password123',
    name: 'Jane Smith',
    isVerified: PROFILE_STATUS.ACTIVE,
    avatar: 'https://ui-avatars.com/api/?name=Jane+Smith',
    roles: [APP_ROLES.CONTRACTOR],
    organization: 'orgA',
    disabled: false,
  },
  // Organization B Users
  {
    email: 'user1@orgb.com',
    password: 'password123',
    name: 'Alice Johnson',
    isVerified: PROFILE_STATUS.ACTIVE,
    avatar: 'https://ui-avatars.com/api/?name=Alice+Johnson',
    roles: [APP_ROLES.CONTRACTOR],
    organization: 'orgB',
    disabled: false,
  },
  {
    email: 'user2@orgb.com',
    password: 'password123',
    name: 'Bob Wilson',
    isVerified: PROFILE_STATUS.ACTIVE,
    avatar: 'https://ui-avatars.com/api/?name=Bob+Wilson',
    roles: [APP_ROLES.CONTRACTOR],
    organization: 'orgB',
    disabled: false,
  },
];
