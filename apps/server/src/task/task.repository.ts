import { Injectable, BadRequestException } from '@nestjs/common';
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

  async findWithPaginationCustom(
    filter: any,
    query: any,
    limit: number,
    cursor?: string,
  ): Promise<{ tasks: TaskDocument[]; nextCursor?: string; hasMore: boolean; totalPages?: number; total?: number }> {
    // Sort
    const sort: Record<string, 1 | -1> = {};
    sort[query.sortBy || 'createdAt'] = query.sortOrder === 'asc' ? 1 : -1;

    const total = await this.taskModel.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    let tasks: TaskDocument[];
    let hasMore = false;
    let nextCursor: string | undefined;

    if (query.page) {
      const skip = (query.page - 1) * limit;
      
      tasks = await this.taskModel
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec();

      hasMore = query.page < totalPages;
    } else {
      if (cursor) {
        filter.createdAt = { $lt: new Date(cursor) };
      }

      // Execute query with limit + 1 to check if there are more results
      const results = await this.taskModel
        .find(filter)
        .sort(sort)
        .limit(limit + 1)
        .exec();

      hasMore = results.length > limit;
      tasks = results.slice(0, limit);

      if (hasMore) {
        const last = tasks[tasks.length - 1] as TaskDocument & { createdAt: Date };
        nextCursor = last.createdAt.toISOString();
      }
    }

    return {
      tasks,
      nextCursor,
      hasMore,
      totalPages,
      total,
    };
  }

  async findWithPagination(
    organizationId: string,
    query: any,
    limit: number,
    cursor?: string,
  ): Promise<{ tasks: TaskDocument[]; nextCursor?: string; hasMore: boolean; totalPages?: number; total?: number }> {
    const filter: any = { organizationId };

    if (query.status) filter.status = query.status;
    if (query.priority) filter.priority = query.priority;
    if (query.assignedTo) filter.assignedTo = query.assignedTo;
    if (query.createdBy) filter.createdBy = query.createdBy;
    if (query.isOverdue !== undefined) filter.isOverdue = query.isOverdue;

    if (query.search) {
      const searchRegex = new RegExp(query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [
        { title: { $regex: searchRegex } },
        { description: { $regex: searchRegex } }
      ];
    }
    
    // for Sort
    const sort: Record<string, 1 | -1> = {};
    sort[query.sortBy || 'createdAt'] = query.sortOrder === 'asc' ? 1 : -1;

    const total = await this.taskModel.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    let tasks: TaskDocument[];
    let hasMore = false;
    let nextCursor: string | undefined;

    if (query.page) {
      const skip = (query.page - 1) * limit;
      
      console.log(' Task Repository Query Debug:', {
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
      if (cursor) {
        const cursorDate = new Date(cursor);
        filter.createdAt = { $lt: cursorDate };
      }

      const results = await this.taskModel
        .find(filter)
        .sort(sort)
        .limit(limit + 1)
        .exec();

      hasMore = results.length > limit;
      tasks = results.slice(0, limit);

      if (hasMore) {
        const last = tasks[tasks.length - 1] as TaskDocument & { createdAt: Date };
        nextCursor = last.createdAt.toISOString();
      }
    }

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

  async createAll(tasks: Partial<Task>[]): Promise<TaskDocument[]> {
    try {
      const result = await this.taskModel.insertMany(tasks);
      return result as TaskDocument[];
    } catch (error) {
      throw new BadRequestException(`Error creating tasks: ${error.message}`);
    }
  }

  async count(): Promise<number> {
    try {
      return await this.taskModel.countDocuments();
    } catch (error) {
      throw new BadRequestException(`Error counting tasks: ${error.message}`);
    }
  }
}
