export enum HTTP_METHODS {
  GET = "GET",
  POST = "POST",
  PATCH = "PATCH",
  PUT = "PUT",
  DELETE = "DELETE",
}
export enum PROFILE_STATUS {
  ACTIVE = "Active",
  EMAIL_SENT = "Email Sent",
  NONE = "None",
}

export enum APP_ROLES {
  USER = "USER",
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
}

export enum NOTIFY_TYPE {
  Success = "success",
  Error = "error",
  Info = "info",
  Warning = "warning",
}

export enum NAV_PATHS {
  USER = 'USER',
  PROFILE = 'PROFILE',
  MANAGER = 'MANAGER',
  TASK = 'TASK',
}

export const ORGANIZATIONS = {
  ORG_A: {
    id: 'org_a_001',
    name: 'orgA',
    displayName: 'Organization A'
  },
  ORG_B: {
    id: 'org_b_002', 
    name: 'orgB',
    displayName: 'Organization B'
  }
} as const;

export type OrganizationId = typeof ORGANIZATIONS[keyof typeof ORGANIZATIONS]['id'];
export type OrganizationName = typeof ORGANIZATIONS[keyof typeof ORGANIZATIONS]['name'];