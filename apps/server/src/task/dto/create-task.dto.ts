import { IsString, IsOptional, IsEnum, IsDateString, IsArray, IsBoolean, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskStatus, TaskPriority } from '../task.model';

export class CreateTaskDto {
  @ApiProperty({ description: 'Task title', minLength: 1, maxLength: 200 })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({ description: 'Task description', maxLength: 1000 })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ 
    description: 'Task status', 
    enum: TaskStatus, 
    default: TaskStatus.PENDING 
  })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiPropertyOptional({ 
    description: 'Task priority', 
    enum: TaskPriority, 
    default: TaskPriority.MEDIUM 
  })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @ApiProperty({ description: 'Task due date' })
  @IsDateString()
  dueDate: string;

  @ApiPropertyOptional({ description: 'User ID to assign the task to' })
  @IsOptional()
  @IsString()
  assignedTo?: string;

  @ApiPropertyOptional({ description: 'Task tags', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'User ID who created the task' })
  @IsOptional()
  @IsString()
  createdBy?: string;
}
