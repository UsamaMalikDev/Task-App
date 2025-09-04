import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task, TaskDocument, TaskStatus } from './task.model';

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);

  constructor(
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
  ) {}

  async findOverdueTasks(): Promise<TaskDocument[]> {
    try {
      const now = new Date();
      const overdueTasks = await this.taskModel.find({
        dueDate: { $lt: now },
        status: { $nin: [TaskStatus.COMPLETED, TaskStatus.CANCELLED] },
        isOverdue: false,
      }).exec();

      this.logger.log(`Found ${overdueTasks.length} overdue tasks`);
      return overdueTasks;
    } catch (error) {
      this.logger.error('Error finding overdue tasks', error);
      throw error;
    }
  }

  async markTasksAsOverdue(taskIds: string[]): Promise<void> {
    try {
      const result = await this.taskModel.updateMany(
        { _id: { $in: taskIds } },
        { isOverdue: true },
      ).exec();

      this.logger.log(`Marked ${result.modifiedCount} tasks as overdue`, {
        taskIds,
        modifiedCount: result.modifiedCount,
      });
    } catch (error) {
      this.logger.error('Error marking tasks as overdue', error);
      throw error;
    }
  }

  async getTaskStats(): Promise<{
    totalTasks: number;
    overdueTasks: number;
    completedTasks: number;
    pendingTasks: number;
  }> {
    try {
      const [totalTasks, overdueTasks, completedTasks, pendingTasks] = await Promise.all([
        this.taskModel.countDocuments(),
        this.taskModel.countDocuments({ isOverdue: true }),
        this.taskModel.countDocuments({ status: TaskStatus.COMPLETED }),
        this.taskModel.countDocuments({ status: TaskStatus.PENDING }),
      ]);

      return {
        totalTasks,
        overdueTasks,
        completedTasks,
        pendingTasks,
      };
    } catch (error) {
      this.logger.error('Error getting task stats', error);
      throw error;
    }
  }
}
