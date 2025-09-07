import { APP_ROLES, PROFILE_STATUS } from "./utils/constants";

export type AuthShape = {
  user: Profile;
  backendTokens: TokenShape;
  company?: Company;
  companySubscription?: CompanySubscriptionModel;
};

export type TokenShape = {
  createdOn: string;
  expires: string;
  expiresPrettyPrint: string;
  token: string;
};

export type Profile = {
  _id: string;
  email: string;
  name: string;
  avatar: string;
  roles: APP_ROLES[];
  isVerified: PROFILE_STATUS;
  disabled: boolean;
  deleted?: boolean;
  password?: string;
  company?: string;
  createdAt?: Date;
};

export type SignInPayloadType = {
  email: string;
  password: string;
};

export type SignUpPayloadType = {
  userInfo: {
    name: string;
    email: string;
    organizationId: string;
    phone: string;
    password: string;
    confirmPassword: string;
    source: string;
    reason?: string;
    agreedToTerms: boolean;
  };
  selectedPlan: string;
};

export type Company = {
  _id: string;
  name: string;
  phone?: string;
  businessEmails?: string[];
  address?: {
    streetLine1: string;
    streetLine2: string;
    city: string;
    state: string;
    zip: string;
  };
  website?: string;
  searchTracking?: {
    enabled?: boolean;
    emailSent?: boolean;
    sentOn?: Date;
  };
};

export interface CompanySubscriptionModel {
  _id: string;
  subscriptionPlan: string;
  company: string;
  stripeSubscription: StripeSubscription | null;
}

export type StripeSubscription = {
  stripeSubscriptionId: string;
  subscriptionStatus: string;
  periodStartDate: string;
  periodEndDate: string;
  failedDate: string | null;
  stripeCustomerId: string;
  subscriptionCancelled: string | null;
};
export type HeadersType = {
  Authorization?: string;
  "Content-Type"?: string;
  "api-key"?: string;
};

// Task-related types
export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export type Task = {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  organizationId: string;
  createdBy: string;
  assignedTo?: string;
  tags: string[];
  isOverdue: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateTaskPayload = {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate: string;
  assignedTo?: string;
  tags?: string[];
};

export type UpdateTaskPayload = {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
  assignedTo?: string;
  tags?: string[];
  completedAt?: string;
};

export type BulkUpdateTaskPayload = {
  taskIds: string[];
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedTo?: string;
};

export type TaskQueryParams = {
  cursor?: string;
  limit?: number;
  page?: number;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedTo?: string;
  createdBy?: string;
  isOverdue?: boolean;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

export type TaskResponse = {
  tasks: Task[];
  nextCursor?: string;
  hasMore: boolean;
  totalPages?: number;
  total?: number;
};

export type TaskScope = 'my' | 'org';

export interface SignupFormData {
  name: string;
  email: string;
  organizationId: string;
  phone: string;
  password: string;
  confirmPassword: string;
  source: string;
  reason: string;
  agreedToTerms: boolean;
  selectedPlan: string;
}
