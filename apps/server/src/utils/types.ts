import { Condition, QueryOptions, RootQuerySelector } from 'mongoose';
import { TaskDocument, TaskStatus } from 'src/task/task.model';

export type FindPayloadType<Model> = {
  filter?: FilterQuery<Model>;
  options?: QueryOptions;
  ref?: any;
  where?: Record<string, any>;
  sort?: Record<string, 1 | -1>;
  projection?: Record<string, 1 | 0>;
};

type FilterQuery<T> = {
  [P in keyof T]?: Condition<T[P]>;
} & RootQuerySelector<T> & { _id?: Condition<string> };


export type UserRole = 'USER' | 'MANAGER' | 'ADMIN';
export type TaskOperation = 'read' | 'write' | 'delete';

export interface AccessCheckResult {
  allowed: boolean;
  reason?: string;
}

export interface TaskFilter {
  organizationId?: string;
  status?: TaskStatus;
  priority?: string;
  assignedTo?: string;
  createdBy?: string;
  isOverdue?: boolean;
  $or?: Array<{ title: { $regex: RegExp } } | { description: { $regex: RegExp } }>;
}

export interface TaskUpdateData {
  status?: TaskStatus;
  priority?: string;
  assignedTo?: string;
  dueDate?: Date;
  completedAt?: Date;
  title?: string;
  description?: string;
  tags?: string[];
  createdBy?: string;
}

export interface CachedTaskResult {
  tasks: TaskDocument[];
  nextCursor?: string;
  hasMore: boolean;
  totalPages?: number;
  total?: number;
}