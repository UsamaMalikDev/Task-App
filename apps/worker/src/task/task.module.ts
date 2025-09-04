import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TaskService } from './task.service';
import { Task, TaskModel } from './task.model';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Task.name, schema: TaskModel }]),
  ],
  providers: [TaskService],
  exports: [TaskService],
})
export class TaskModule {}
