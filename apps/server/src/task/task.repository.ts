import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Task, TaskDocument, TaskStatus } from './task.model';
import { FindPayloadType } from 'src/utils/types';

@Injectable()
export class TaskRepository {
  constructor(
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
  ) {}

  async create(taskData: Partial<Task>): Promise<TaskDocument> {
    const task = new this.taskModel(taskData);
    return task.save();
  }

  async findById(id: string): Promise<TaskDocument> {
    return this.taskModel.findById(id).exec();
  }

  async findOne(payload: FindPayloadType<Task>): Promise<TaskDocument> {
    return this.taskModel.findOne(payload.filter).exec();
  }

  async findAll(payload: FindPayloadType<Task>): Promise<TaskDocument[]> {
    return this.taskModel.find(payload.filter).exec();
  }

  async update(id: string, updateData: Partial<Task>): Promise<TaskDocument> {
    return this.taskModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  async delete(id: string): Promise<TaskDocument> {
    return this.taskModel.findByIdAndDelete(id).exec();
  }

  async findWithPagination(
    organizationId: string,
    query: any,
    limit: number,
    cursor?: string,
  ): Promise<{ tasks: TaskDocument[]; nextCursor?: string; hasMore: boolean; totalPages?: number; total?: number }> {
    const filter: any = { organizationId };

    // Apply filters
    if (query.status) filter.status = query.status;
    if (query.priority) filter.priority = query.priority;
    if (query.assignedTo) filter.assignedTo = query.assignedTo;
    if (query.createdBy) filter.createdBy = query.createdBy;
    if (query.isOverdue !== undefined) filter.isOverdue = query.isOverdue;

    // Apply search
    if (query.search) {
      filter.$text = { $search: query.search };
    }

    // Sort
    const sort: any = {};
    sort[query.sortBy || 'createdAt'] = query.sortOrder === 'asc' ? 1 : -1;

    // Get total count for page-based pagination
    const total = await this.taskModel.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    let tasks: TaskDocument[];
    let hasMore = false;
    let nextCursor: string | undefined;

    if (query.page) {
      // Page-based pagination
      const skip = (query.page - 1) * limit;
      
      console.log('🔍 Task Repository Query Debug (Page-based):', {
        organizationId,
        filter: JSON.stringify(filter, null, 2),
        sort: JSON.stringify(sort, null, 2),
        page: query.page,
        limit,
        skip,
        total,
        totalPages,
      });

      tasks = await this.taskModel
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec();

      hasMore = query.page < totalPages;
    } else {
      // Cursor-based pagination (legacy)
      if (cursor) {
        const cursorDate = new Date(cursor);
        filter.createdAt = { $lt: cursorDate };
      }

      console.log('🔍 Task Repository Query Debug (Cursor-based):', {
        organizationId,
        filter: JSON.stringify(filter, null, 2),
        sort: JSON.stringify(sort, null, 2),
        limit,
        cursor,
      });

      // Execute query with limit + 1 to check if there are more results
      const allTasks = await this.taskModel
        .find(filter)
        .sort(sort)
        .limit(limit + 1)
        .exec();

      hasMore = allTasks.length > limit;
      tasks = hasMore ? allTasks.slice(0, limit) : allTasks;
      nextCursor = hasMore ? (tasks[tasks.length - 1] as any).createdAt.toISOString() : undefined;
    }

    console.log('📊 Task Repository Results:', {
      totalTasks: tasks.length,
      hasMore,
      total,
      totalPages,
    });

    return {
      tasks,
      nextCursor,
      hasMore,
      totalPages,
      total,
    };
  }

  async bulkUpdate(taskIds: string[], updateData: Partial<Task>): Promise<TaskDocument[]> {
    const objectIds = taskIds.map(id => new Types.ObjectId(id));
    await this.taskModel.updateMany(
      { _id: { $in: objectIds } },
      updateData,
    ).exec();

    return this.taskModel.find({ _id: { $in: objectIds } }).exec();
  }

  async findOverdueTasks(organizationId?: string): Promise<TaskDocument[]> {
    const filter: any = {
      dueDate: { $lt: new Date() },
      status: { $nin: [TaskStatus.COMPLETED, TaskStatus.CANCELLED] },
      isOverdue: false,
    };

    if (organizationId) {
      filter.organizationId = organizationId;
    }

    return this.taskModel.find(filter).exec();
  }

  async markTasksAsOverdue(taskIds: string[]): Promise<void> {
    await this.taskModel.updateMany(
      { _id: { $in: taskIds.map(id => new Types.ObjectId(id)) } },
      { isOverdue: true },
    ).exec();
  }
}
