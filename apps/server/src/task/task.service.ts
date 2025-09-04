import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { TaskRepository } from './task.repository';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { BulkUpdateTaskDto } from './dto/bulk-update-task.dto';
import { TaskQueryDto } from './dto/task-query.dto';
import { Task, TaskDocument, TaskStatus } from './task.model';
import { Types } from 'mongoose';
import { CacheService } from 'src/common/cache/cache.service';

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);

  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly cacheService: CacheService,
  ) {}

  // RBAC Helper Methods
  private getUserRole(userRoles: string[]): 'USER' | 'MANAGER' | 'ADMIN' {
    if (userRoles.includes('ADMIN')) return 'ADMIN';
    if (userRoles.includes('MANAGER')) return 'MANAGER';
    return 'USER';
  }

  private canAccessTask(
    userRole: 'USER' | 'MANAGER' | 'ADMIN',
    userId: string,
    userOrganizationId: string,
    task: TaskDocument,
    operation: 'read' | 'write' | 'delete'
  ): { allowed: boolean; reason?: string } {
    const taskOrganizationId = task.organizationId;
    const taskCreatedBy = task.createdBy;

    this.logger.log(`RBAC Check: ${operation}`, {
      userRole,
      userId,
      userOrganizationId,
      taskOrganizationId,
      taskCreatedBy,
      taskId: task._id
    });

    switch (userRole) {
      case 'ADMIN':
        // Admin can access tasks across all organizations
        return { allowed: true };

      case 'MANAGER':
        // Manager can access tasks within their organization
        if (taskOrganizationId === userOrganizationId) {
          return { allowed: true };
        }
        return { 
          allowed: false, 
          reason: 'Manager can only access tasks within their organization' 
        };

      case 'USER':
        // User can only access their own tasks
        if (taskCreatedBy === userId) {
          return { allowed: true };
        }
        return { 
          allowed: false, 
          reason: 'User can only access tasks they created' 
        };

      default:
        return { 
          allowed: false, 
          reason: 'Invalid user role' 
        };
    }
  }

  async createTask(createTaskDto: CreateTaskDto, organizationId: string, createdBy: string): Promise<TaskDocument> {
    try {
      const taskData = {
        ...createTaskDto,
        organizationId,
        createdBy,
        dueDate: new Date(createTaskDto.dueDate),
        completedAt: createTaskDto.status === TaskStatus.COMPLETED ? new Date() : undefined,
      };

      const task = await this.taskRepository.create(taskData);
      
      // Invalidate cache for this organization
      await this.cacheService.deletePattern(
        this.cacheService.generateTaskInvalidationPattern(organizationId)
      );
      
      this.logger.log(`Task created successfully: ${task._id}`, { taskId: task._id, organizationId });
      return task;
    } catch (error) {
      this.logger.error('Error creating task', error);
      throw new BadRequestException('Failed to create task');
    }
  }

  async getTasks(organizationId: string, query: TaskQueryDto): Promise<{
    tasks: TaskDocument[];
    nextCursor?: string;
    hasMore: boolean;
    totalPages?: number;
    total?: number;
  }> {
    try {
      // Generate cache key
      const cacheKey = this.cacheService.generateTaskCacheKey(organizationId, query);
      
      // Try to get from cache first
      const cachedResult = await this.cacheService.get<{
        tasks: TaskDocument[];
        nextCursor?: string;
        hasMore: boolean;
        totalPages?: number;
        total?: number;
      }>(cacheKey);
      if (cachedResult) {
        this.logger.log(`Tasks retrieved from cache for organization: ${organizationId}`, {
          organizationId,
          count: cachedResult.tasks.length,
          hasMore: cachedResult.hasMore,
        });
        return cachedResult;
      }

      // If not in cache, fetch from database
      this.logger.log(`Fetching tasks from database`, {
        organizationId,
        query: JSON.stringify(query),
        limit: query.limit || 20,
        cursor: query.cursor,
      });

      const result = await this.taskRepository.findWithPagination(
        organizationId,
        query,
        query.limit || 20,
        query.cursor,
      );

      // Cache the result for 5 minutes
      await this.cacheService.set(cacheKey, result, 300);

      this.logger.log(`Tasks retrieved from database for organization: ${organizationId}`, {
        organizationId,
        count: result.tasks.length,
        hasMore: result.hasMore,
        query: JSON.stringify(query),
      });

      return result;
    } catch (error) {
      this.logger.error('Error retrieving tasks', error);
      throw new BadRequestException('Failed to retrieve tasks');
    }
  }

  async updateTask(taskId: string, updateTaskDto: UpdateTaskDto, organizationId: string): Promise<TaskDocument> {
    try {
      // Verify task exists and belongs to organization
      const existingTask = await this.taskRepository.findById(taskId);
      if (!existingTask) {
        throw new NotFoundException('Task not found');
      }

      // Check if task belongs to organization OR was created by the user
      this.logger.log(`Updating task ${taskId}`, {
        taskOrganizationId: existingTask.organizationId,
        taskCreatedBy: existingTask.createdBy,
        userOrganizationId: organizationId,
      });

      if (existingTask.organizationId !== organizationId && existingTask.createdBy !== organizationId) {
        throw new BadRequestException('Task does not belong to this organization');
      }

      const updateData: any = { ...updateTaskDto };

      // Handle due date conversion
      if (updateTaskDto.dueDate) {
        updateData.dueDate = new Date(updateTaskDto.dueDate);
      }

      // Handle completion date
      if (updateTaskDto.status === TaskStatus.COMPLETED && !existingTask.completedAt) {
        updateData.completedAt = new Date();
      } else if (updateTaskDto.status !== TaskStatus.COMPLETED && updateTaskDto.completedAt) {
        updateData.completedAt = new Date(updateTaskDto.completedAt);
      }

      const updatedTask = await this.taskRepository.update(taskId, updateData);
      
      // Invalidate cache for this organization
      await this.cacheService.deletePattern(
        this.cacheService.generateTaskInvalidationPattern(organizationId)
      );
      
      this.logger.log(`Task updated successfully: ${taskId}`, { taskId, organizationId });
      return updatedTask;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error('Error updating task', error);
      throw new BadRequestException('Failed to update task');
    }
  }

  async updateTaskWithRBAC(
    taskId: string, 
    updateTaskDto: UpdateTaskDto, 
    userId: string, 
    userRoles: string[], 
    userOrganizationId: string
  ): Promise<TaskDocument> {
    try {
      const existingTask = await this.taskRepository.findById(taskId);
      if (!existingTask) {
        throw new NotFoundException('Task not found');
      }

      const userRole = this.getUserRole(userRoles);
      const accessCheck = this.canAccessTask(userRole, userId, userOrganizationId, existingTask, 'write');

      if (!accessCheck.allowed) {
        this.logger.warn(`Access denied for task update`, {
          userId,
          userRole,
          userRoles,
          taskId: existingTask._id,
          reason: accessCheck.reason
        });
        throw new BadRequestException(accessCheck.reason || 'Access denied');
      }

      const updateData: any = { ...updateTaskDto };

      // Handle due date conversion
      if (updateTaskDto.dueDate) {
        updateData.dueDate = new Date(updateTaskDto.dueDate);
      }

      // Handle completion date
      if (updateTaskDto.status === TaskStatus.COMPLETED && !existingTask.completedAt) {
        updateData.completedAt = new Date();
      } else if (updateTaskDto.status !== TaskStatus.COMPLETED && updateTaskDto.completedAt) {
        updateData.completedAt = new Date(updateTaskDto.completedAt);
      }

      const updatedTask = await this.taskRepository.update(taskId, updateData);
      
      // Invalidate cache for this organization
      await this.cacheService.deletePattern(
        this.cacheService.generateTaskInvalidationPattern(userOrganizationId)
      );
      
      this.logger.log(`Task updated successfully with RBAC: ${taskId}`, { 
        taskId, 
        userId, 
        userRole,
        taskTitle: existingTask.title 
      });
      
      return updatedTask;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error('Error updating task with RBAC', error);
      throw new BadRequestException('Failed to update task');
    }
  }

  async bulkUpdateTasks(bulkUpdateDto: BulkUpdateTaskDto, organizationId: string): Promise<TaskDocument[]> {
    try {
      // Verify all tasks exist and belong to organization OR were created by the user
      const tasks = await this.taskRepository.findAll({
        filter: {
          _id: { $in: bulkUpdateDto.taskIds.map(id => new Types.ObjectId(id)) },
          $or: [
            { organizationId },
            { createdBy: organizationId }
          ],
        },
      });

      if (tasks.length !== bulkUpdateDto.taskIds.length) {
        throw new BadRequestException('Some tasks not found or do not belong to this organization');
      }

      const updateData: Partial<Task> = {};
      if (bulkUpdateDto.status !== undefined) updateData.status = bulkUpdateDto.status;
      if (bulkUpdateDto.priority !== undefined) updateData.priority = bulkUpdateDto.priority;
      if (bulkUpdateDto.assignedTo !== undefined) updateData.assignedTo = bulkUpdateDto.assignedTo;

      // Handle completion date for status changes
      if (bulkUpdateDto.status === TaskStatus.COMPLETED) {
        updateData.completedAt = new Date();
      }

      const updatedTasks = await this.taskRepository.bulkUpdate(bulkUpdateDto.taskIds, updateData);
      
      // Invalidate cache for this organization
      await this.cacheService.deletePattern(
        this.cacheService.generateTaskInvalidationPattern(organizationId)
      );
      
      this.logger.log(`Bulk update completed for ${updatedTasks.length} tasks`, {
        taskIds: bulkUpdateDto.taskIds,
        organizationId,
      });
      return updatedTasks;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error('Error in bulk update', error);
      throw new BadRequestException('Failed to bulk update tasks');
    }
  }

  async getTaskById(taskId: string, organizationId: string): Promise<TaskDocument> {
    try {
      const task = await this.taskRepository.findById(taskId);
      if (!task) {
        throw new NotFoundException('Task not found');
      }

      // Check if task belongs to organization OR was created by the user
      if (task.organizationId !== organizationId && task.createdBy !== organizationId) {
        throw new BadRequestException('Task does not belong to this organization');
      }

      return task;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error('Error retrieving task', error);
      throw new BadRequestException('Failed to retrieve task');
    }
  }

  async deleteTask(taskId: string, organizationId: string): Promise<void> {
    try {
      const task = await this.taskRepository.findById(taskId);
      if (!task) {
        throw new NotFoundException('Task not found');
      }

      // Check if task belongs to organization OR was created by the user
      this.logger.log(`Deleting task ${taskId}`, {
        taskOrganizationId: task.organizationId,
        taskCreatedBy: task.createdBy,
        userOrganizationId: organizationId,
        taskId: task._id,
        taskTitle: task.title
      });

      if (task.organizationId !== organizationId && task.createdBy !== organizationId) {
        this.logger.error(`Task ownership validation failed`, {
          taskOrganizationId: task.organizationId,
          taskCreatedBy: task.createdBy,
          userOrganizationId: organizationId,
          taskId: task._id
        });
        throw new BadRequestException('Task does not belong to this organization');
      }

      await this.taskRepository.delete(taskId);
      this.logger.log(`Task deleted successfully: ${taskId}`, { taskId, organizationId });
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error('Error deleting task', error);
      throw new BadRequestException('Failed to delete task');
    }
  }

  async deleteTaskWithRBAC(
    taskId: string, 
    userId: string, 
    userRoles: string[], 
    userOrganizationId: string
  ): Promise<{ message: string }> {
    try {
      const task = await this.taskRepository.findById(taskId);
      if (!task) {
        throw new NotFoundException('Task not found');
      }

      const userRole = this.getUserRole(userRoles);
      const accessCheck = this.canAccessTask(userRole, userId, userOrganizationId, task, 'delete');

      if (!accessCheck.allowed) {
        this.logger.warn(`Access denied for task deletion`, {
          userId,
          userRole,
          userRoles,
          taskId: task._id,
          reason: accessCheck.reason
        });
        throw new BadRequestException(accessCheck.reason || 'Access denied');
      }

      await this.taskRepository.delete(taskId);
      this.logger.log(`Task deleted successfully with RBAC: ${taskId}`, { 
        taskId, 
        userId, 
        userRole,
        taskTitle: task.title 
      });

      return { message: 'Task deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error('Error deleting task with RBAC', error);
      throw new BadRequestException('Failed to delete task');
    }
  }

  async getOverdueTasks(organizationId?: string): Promise<TaskDocument[]> {
    try {
      const overdueTasks = await this.taskRepository.findOverdueTasks(organizationId);
      this.logger.log(`Found ${overdueTasks.length} overdue tasks`, { organizationId });
      return overdueTasks;
    } catch (error) {
      this.logger.error('Error retrieving overdue tasks', error);
      throw new BadRequestException('Failed to retrieve overdue tasks');
    }
  }

  async markTasksAsOverdue(taskIds: string[]): Promise<void> {
    try {
      await this.taskRepository.markTasksAsOverdue(taskIds);
      this.logger.log(`Marked ${taskIds.length} tasks as overdue`, { taskIds });
    } catch (error) {
      this.logger.error('Error marking tasks as overdue', error);
      throw new BadRequestException('Failed to mark tasks as overdue');
    }
  }

  async debugTasks(organizationId: string): Promise<any> {
    try {
      // Get all tasks for this organization
      const allTasks = await this.taskRepository.findAll({
        filter: { organizationId }
      });

      // Get tasks created by this user
      const createdTasks = await this.taskRepository.findAll({
        filter: { organizationId, createdBy: organizationId }
      });

      // Get tasks assigned to this user
      const assignedTasks = await this.taskRepository.findAll({
        filter: { organizationId, assignedTo: organizationId }
      });

      return {
        organizationId,
        totalTasks: allTasks.length,
        createdTasksCount: createdTasks.length,
        assignedTasksCount: assignedTasks.length,
        allTasks: allTasks.map(task => ({
          _id: task._id,
          title: task.title,
          status: task.status,
          priority: task.priority,
          organizationId: task.organizationId,
          createdBy: task.createdBy,
          assignedTo: task.assignedTo,
          dueDate: task.dueDate,
          createdAt: (task as any).createdAt,
        })),
        createdTasks: createdTasks.map(task => ({
          _id: task._id,
          title: task.title,
          status: task.status,
          priority: task.priority,
          organizationId: task.organizationId,
          createdBy: task.createdBy,
          assignedTo: task.assignedTo,
          dueDate: task.dueDate,
          createdAt: (task as any).createdAt,
        })),
        assignedTasks: assignedTasks.map(task => ({
          _id: task._id,
          title: task.title,
          status: task.status,
          priority: task.priority,
          organizationId: task.organizationId,
          createdBy: task.createdBy,
          assignedTo: task.assignedTo,
          dueDate: task.dueDate,
          createdAt: (task as any).createdAt,
        })),
      };
    } catch (error) {
      this.logger.error('Error in debug tasks', error);
      throw new BadRequestException('Failed to debug tasks');
    }
  }
}
