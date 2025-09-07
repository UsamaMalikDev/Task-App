import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseModel } from 'src/common/models/base.model';

export type TaskDocument = HydratedDocument<Task>;

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

@Schema({ timestamps: true })
export class Task extends BaseModel {
  @Prop({ required: true, type: String })
  title: string;

  @Prop({ required: false, type: String })
  description?: string;

  @Prop({
    required: true,
    enum: TaskStatus,
    default: TaskStatus.PENDING,
  })
  status: TaskStatus;

  @Prop({
    required: true,
    enum: TaskPriority,
    default: TaskPriority.MEDIUM,
  })
  priority: TaskPriority;

  @Prop({ required: true, type: Date })
  dueDate: Date;

  @Prop({ required: true, type: String })
  organizationId: string;

  @Prop({ required: true, type: String })
  createdBy: string;

  @Prop({ required: false, type: String })
  assignedTo?: string;

  @Prop({ required: false, type: [String], default: [] })
  tags: string[];

  @Prop({ required: false, type: Boolean, default: false })
  isOverdue: boolean;

  @Prop({ required: false, type: Date })
  completedAt?: Date;
}

export const TaskModel = SchemaFactory.createForClass(Task);

// Indexes for better  performance
TaskModel.index({ organizationId: 1, status: 1 });
TaskModel.index({ organizationId: 1, dueDate: 1 });
TaskModel.index({ organizationId: 1, createdBy: 1 });
TaskModel.index({ organizationId: 1, assignedTo: 1 });
TaskModel.index({ organizationId: 1, isOverdue: 1 });
TaskModel.index({ organizationId: 1, title: 'text', description: 'text' });
