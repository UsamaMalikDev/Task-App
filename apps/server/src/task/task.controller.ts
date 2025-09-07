import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { BulkUpdateTaskDto } from './dto/bulk-update-task.dto';
import { TaskQueryDto } from './dto/task-query.dto';
import { JwtAuthGuard } from 'src/auth/decorators/jwt-auth.guard';
import { User } from 'src/auth/decorators/user.decorator';
import { BaseController } from 'src/common/controllers/base.controller';
import { AuthenticatedUser } from 'src/common/types/user.types';
import { MongoIdPipe } from 'src/common/pipes/mongo-id.pipe';

@Controller('tasks')
@ApiTags('Tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class TaskController extends BaseController {
  constructor(private readonly taskService: TaskService) {
    super();
  }

  @Get()
  @ApiOperation({ summary: 'Get tasks with cursor pagination, filtering, and search' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Tasks retrieved successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiQuery({ name: 'cursor', required: false, description: 'Cursor for pagination' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of items per page' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status' })
  @ApiQuery({ name: 'priority', required: false, description: 'Filter by priority' })
  @ApiQuery({ name: 'assignedTo', required: false, description: 'Filter by assigned user' })
  @ApiQuery({ name: 'createdBy', required: false, description: 'Filter by creator' })
  @ApiQuery({ name: 'isOverdue', required: false, description: 'Filter by overdue status' })
  @ApiQuery({ name: 'search', required: false, description: 'Search in title and description' })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Sort field' })
  @ApiQuery({ name: 'sortOrder', required: false, description: 'Sort order' })
  async getTasks(
    @Query() query: TaskQueryDto,
    @User() user: AuthenticatedUser,
  ) {
    const { userId, userRoles, organizationId } = this.extractUserContext(user);
    
    return this.taskService.getTasksWithRBAC(organizationId, query, userId, userRoles);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Task created successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  async createTask(
    @Body() createTaskDto: CreateTaskDto,
    @User() user: AuthenticatedUser,
  ) {
    const { userId, organizationId } = this.extractUserContext(user);
    return this.taskService.createTask(createTaskDto, organizationId, userId);
  }

  @Patch('bulk')
  @ApiOperation({ summary: 'Perform bulk updates on multiple tasks' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Tasks updated successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  async bulkUpdateTasks(
    @Body() bulkUpdateDto: BulkUpdateTaskDto,
    @User() user: AuthenticatedUser,
  ) {
    const { userId, userRoles, organizationId } = this.extractUserContext(user);
    return this.taskService.bulkUpdateTasksWithRBAC(bulkUpdateDto, userId, userRoles, organizationId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a specific task by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Task updated successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Task not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden - insufficient permissions' })
  async updateTask(
    @Param('id', MongoIdPipe) id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @User() user: AuthenticatedUser,
  ) {
    const { userId, userRoles, organizationId } = this.extractUserContext(user);
    
    return this.taskService.updateTaskWithRBAC(id, updateTaskDto, userId, userRoles, organizationId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a specific task by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Task deleted successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Task not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden - insufficient permissions' })
  async deleteTask(
    @Param('id', MongoIdPipe) id: string,
    @User() user: AuthenticatedUser,
  ) {
    const { userId, userRoles, organizationId } = this.extractUserContext(user);
    
    return this.taskService.deleteTaskWithRBAC(id, userId, userRoles, organizationId);
  }
}
