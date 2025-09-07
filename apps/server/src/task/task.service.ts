import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { TaskRepository } from './task.repository';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { BulkUpdateTaskDto } from './dto/bulk-update-task.dto';
import { TaskQueryDto } from './dto/task-query.dto';
import { Task, TaskDocument, TaskStatus } from './task.model';
import { Types } from 'mongoose';
import { CacheService } from 'src/common/cache/cache.service';
import { AccessCheckResult, CachedTaskResult, TaskFilter, TaskOperation, TaskUpdateData, UserRole } from 'src/utils/types';

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);

  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly cacheService: CacheService,
  ) {}

  private getUserRole(userRoles: string[]): UserRole {
    if (userRoles.includes('ADMIN')) return 'ADMIN';
    if (userRoles.includes('MANAGER')) return 'MANAGER';
    return 'USER';
  }

  private canAccessTask(
    userRole: UserRole,
    userId: string,
    userOrganizationId: string,
    task: TaskDocument,
    operation: TaskOperation
  ): AccessCheckResult {
    const taskOrganizationId = task.organizationId;
    const taskCreatedBy = task.createdBy;

    this.logger.debug(`RBAC Check: ${operation}`, {
      userRole,
      taskId: task._id,
      operation,
    });

    switch (userRole) {
      case 'ADMIN':
        return { allowed: true };

      case 'MANAGER':
        const userOrgIdStr = String(userOrganizationId);
        const taskOrgIdStr = String(taskOrganizationId);
        
        if (taskOrgIdStr === userOrgIdStr) return { allowed: true };
        return { 
          allowed: false, 
          reason: 'Manager can only access tasks within their organizationId' 
        };

      case 'USER':
        const userIdStr = String(userId);
        const taskCreatedByStr = String(taskCreatedBy);
        
        if (userIdStr === taskCreatedByStr) {
          this.logger.debug('USER access granted - task created by user');
          return { allowed: true };
        }
        this.logger.debug('USER access denied - task not created by user');
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
      
      // Invalidate cache for this organizationId
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

  async getTasksWithRBAC(
    organizationId: string, 
    query: TaskQueryDto, 
    userId: string, 
    userRoles: string[]
  ): Promise<{
    tasks: TaskDocument[];
    nextCursor?: string;
    hasMore: boolean;
    totalPages?: number;
    total?: number;
  }> {
    try {
      const userRole = this.getUserRole(userRoles);
      const cacheKey = `${this.cacheService.generateTaskCacheKey(organizationId, query)}_${userId}_${userRole}`;
      
      // Try to get from cache first
      const cachedResult = await this.cacheService.get<CachedTaskResult>(cacheKey);
      if (cachedResult) {
        this.logger.log(`Tasks retrieved from cache for user: ${userId} with role: ${userRole}`, {
          userId,
          userRole,
          count: cachedResult.tasks.length,
          hasMore: cachedResult.hasMore,
        });
        return cachedResult;
      }
      let filter: TaskFilter= {};
      
      switch (userRole) {
        case 'ADMIN':
          filter = {};
          break;
        case 'MANAGER':
          filter = { organizationId };
          break;
        case 'USER':
        default:
          filter = { organizationId };
          break;
      }

      // for additional filters
      if (query.status) filter.status = query.status;
      if (query.priority) filter.priority = query.priority;
      if (query.assignedTo) filter.assignedTo = query.assignedTo;
      if (query.createdBy) filter.createdBy = query.createdBy;
      if (query.isOverdue !== undefined) filter.isOverdue = query.isOverdue;

      // for search - use regex for left-to-right matching
      if (query.search) {
        const searchRegex = new RegExp(query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        filter.$or = [
          { title: { $regex: searchRegex } },
          { description: { $regex: searchRegex } }
        ];
      }
      

      this.logger.log(`Fetching tasks with RBAC filter`, {
        userId,
        userRole,
        userRoles,
        filter: JSON.stringify(filter, null, 2),
        query: JSON.stringify(query),
      });

      const result = await this.taskRepository.findWithPaginationCustom(
        filter,
        query,
        query.limit || 20,
        query.cursor,
      );

      // caches the result for 5 minutes
      await this.cacheService.set(cacheKey, result, 300);

      this.logger.log(`Tasks retrieved with RBAC for user: ${userId} with role: ${userRole}`, {
        userId,
        userRole,
        count: result.tasks.length,
        hasMore: result.hasMore,
        query: JSON.stringify(query),
      });

      return result;
    } catch (error) {
      this.logger.error('Error retrieving tasks with RBAC', error);
      throw new BadRequestException('Failed to retrieve tasks');
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

      const cachedResult = await this.cacheService.get<CachedTaskResult>(cacheKey);
      if (cachedResult) {
        this.logger.log(`Tasks retrieved from cache for organizationId: ${organizationId}`, {
          organizationId,
          count: cachedResult.tasks.length,
          hasMore: cachedResult.hasMore,
        });
        return cachedResult;
      }

      // If not in cache, get form DB
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

      this.logger.log(`Tasks retrieved from database for organizationId: ${organizationId}`, {
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

      const existingTask = await this.taskRepository.findById(taskId);
      if (!existingTask) throw new NotFoundException('Task not found');

      this.logger.log(`Updating task ${taskId}`, {
        taskOrganizationId: existingTask.organizationId,
        taskCreatedBy: existingTask.createdBy,
        userOrganizationId: organizationId,
      });

      if (existingTask.organizationId !== organizationId && existingTask.createdBy !== organizationId) {
        throw new BadRequestException('Task does not belong to this organizationId');
      }

      const updateData: TaskUpdateData = {
        ...updateTaskDto,
        dueDate: updateTaskDto.dueDate ? new Date(updateTaskDto.dueDate) : undefined,
        completedAt: updateTaskDto.completedAt ? new Date(updateTaskDto.completedAt) : undefined,
      };
    
      // Handle completion date
      if (updateTaskDto.status === TaskStatus.COMPLETED && !existingTask.completedAt) 
        updateData.completedAt = new Date();
      else if (updateTaskDto.status !== TaskStatus.COMPLETED && updateTaskDto.completedAt) 
        updateData.completedAt = new Date(updateTaskDto.completedAt);
      

      const updatedTask = await this.taskRepository.update(taskId, updateData as Partial<Task>);

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
      if (!existingTask) throw new NotFoundException('Task not found');
    
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

      const updateData: TaskUpdateData = {
        ...updateTaskDto,
        dueDate: updateTaskDto.dueDate ? new Date(updateTaskDto.dueDate) : undefined,
        completedAt: updateTaskDto.completedAt ? new Date(updateTaskDto.completedAt) : undefined,
      };

      // handle the completion date
      if (updateTaskDto.status === TaskStatus.COMPLETED && !existingTask.completedAt) 
        updateData.completedAt = new Date();
      else if (updateTaskDto.status !== TaskStatus.COMPLETED && updateTaskDto.completedAt) 
        updateData.completedAt = new Date(updateTaskDto.completedAt);
      

      const updatedTask = await this.taskRepository.update(taskId, updateData as Partial<Task>);
      
      // remove cache for this organizationId
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
      // Get all tasks by IDs first
      const tasks = await this.taskRepository.findAll({
        filter: {
          _id: { $in: bulkUpdateDto.taskIds.map(id => new Types.ObjectId(id)) }
        },
      });

      if (tasks.length !== bulkUpdateDto.taskIds.length) {
        throw new BadRequestException('Some tasks not found');
      }

      const updateData: TaskUpdateData = {};
      if (bulkUpdateDto.status !== undefined) updateData.status = bulkUpdateDto.status;
      if (bulkUpdateDto.priority !== undefined) updateData.priority = bulkUpdateDto.priority;
      if (bulkUpdateDto.assignedTo !== undefined) updateData.assignedTo = bulkUpdateDto.assignedTo;

      // Handle completion date for status changes
      if (bulkUpdateDto.status === TaskStatus.COMPLETED) {
        updateData.completedAt = new Date();
      }

      const updatedTasks = await this.taskRepository.bulkUpdate(bulkUpdateDto.taskIds, updateData as Partial<Task>);
      
      // Invalidate cache for this organizationId
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

  async bulkUpdateTasksWithRBAC(
    bulkUpdateDto: BulkUpdateTaskDto, 
    userId: string, 
    userRoles: string[], 
    userOrganizationId: string
  ): Promise<TaskDocument[]> {
    try {
      // Get all tasks by IDs first
      const tasks = await this.taskRepository.findAll({
        filter: {
          _id: { $in: bulkUpdateDto.taskIds.map(id => new Types.ObjectId(id)) }
        },
      });
      //Edge case
      if (tasks.length !== bulkUpdateDto.taskIds.length) throw new BadRequestException('Some tasks not found');
      
      const userRole = this.getUserRole(userRoles);
      const accessibleTaskIds: string[] = [];

      // Check RBAC for each task
      for (const task of tasks) {
        const accessCheck = this.canAccessTask(userRole, userId, userOrganizationId, task, 'write');
        if (accessCheck.allowed) {
          accessibleTaskIds.push(task._id.toString());
        } else {
          this.logger.warn(`Access denied for bulk update task ${task._id}`, {
            userId,
            userRole,
            taskId: task._id,
            reason: accessCheck.reason
          });
        }
      }

      if (accessibleTaskIds.length === 0) {
        throw new BadRequestException('No accessible tasks found for bulk update');
      }

      const updateData: TaskUpdateData = {};
      if (bulkUpdateDto.status !== undefined) updateData.status = bulkUpdateDto.status;
      if (bulkUpdateDto.priority !== undefined) updateData.priority = bulkUpdateDto.priority;
      if (bulkUpdateDto.assignedTo !== undefined) updateData.assignedTo = bulkUpdateDto.assignedTo;

      // Handle completion date for status changes
      if (bulkUpdateDto.status === TaskStatus.COMPLETED) updateData.completedAt = new Date();
      
      const updatedTasks = await this.taskRepository.bulkUpdate(accessibleTaskIds, updateData as Partial<Task>);
      
      // Invalidate cache for this organizationId
      await this.cacheService.deletePattern(
        this.cacheService.generateTaskInvalidationPattern(userOrganizationId)
      );
      
      this.logger.log(`Bulk update completed for ${updatedTasks.length} accessible tasks`, {
        requestedTaskIds: bulkUpdateDto.taskIds,
        accessibleTaskIds,
        userId,
        userRole,
        userOrganizationId,
      });
      return updatedTasks;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error('Error in bulk update with RBAC', error);
      throw new BadRequestException('Failed to bulk update tasks');
    }
  }

  async getTaskById(taskId: string, organizationId: string): Promise<TaskDocument> {
    try {
      const task = await this.taskRepository.findById(taskId);
      if (!task) {
        throw new NotFoundException('Task not found');
      }

      // Check if task belongs to organizationId OR was created by the user
      if (task.organizationId !== organizationId && task.createdBy !== organizationId) {
        throw new BadRequestException('Task does not belong to this organizationId');
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

      // Check if task belongs to organizationId OR was created by the user
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
        throw new BadRequestException('Task does not belong to this organizationId');
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
      if (!task) throw new NotFoundException('Task not found');
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
      
      // Invalidate cache for this organizationId
      await this.cacheService.deletePattern(
        this.cacheService.generateTaskInvalidationPattern(userOrganizationId)
      );
      
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
}
