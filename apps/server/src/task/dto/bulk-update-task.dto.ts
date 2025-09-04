import { IsArray, IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskStatus, TaskPriority } from '../task.model';

export class BulkUpdateTaskDto {
  @ApiProperty({ description: 'Array of task IDs to update', type: [String] })
  @IsArray()
  @IsString({ each: true })
  taskIds: string[];

  @ApiPropertyOptional({ 
    description: 'New status for all tasks', 
    enum: TaskStatus 
  })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiPropertyOptional({ 
    description: 'New priority for all tasks', 
    enum: TaskPriority 
  })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @ApiPropertyOptional({ description: 'New assigned user for all tasks' })
  @IsOptional()
  @IsString()
  assignedTo?: string;
}
