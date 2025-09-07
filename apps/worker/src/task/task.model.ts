import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TaskDocument = HydratedDocument<Task>;

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Schema({ timestamps: true })
export class Task {
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

  @Prop({ required: false, type: Date })
  createdAt?: Date;

  @Prop({ required: false, type: Date })
  updatedAt?: Date;
}

export const TaskModel = SchemaFactory.createForClass(Task);

TaskModel.index({ organizationId: 1, dueDate: 1 });
TaskModel.index({ organizationId: 1, isOverdue: 1 });
TaskModel.index({ dueDate: 1, status: 1, isOverdue: 1 });
