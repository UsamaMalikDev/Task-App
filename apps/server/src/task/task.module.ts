import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { TaskRepository } from './task.repository';
import { Task, TaskModel } from './task.model';
import { CacheModule } from 'src/common/cache/cache.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Task.name, schema: TaskModel }]),
    CacheModule,
  ],
  controllers: [TaskController],
  providers: [TaskService, TaskRepository],
  exports: [TaskService, TaskRepository],
})
export class TaskModule {}
