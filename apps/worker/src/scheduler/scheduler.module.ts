import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { OverdueTaskScheduler } from './overdue-task.scheduler';
import { TaskModule } from '../task/task.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TaskModule,
  ],
  providers: [OverdueTaskScheduler],
  exports: [OverdueTaskScheduler],
})
export class SchedulerModule {}
