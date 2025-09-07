import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SchedulerModule } from '../scheduler/scheduler.module';
import { HealthModule } from '../health/health.module';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.DB_URL || 'mongodb://localhost:27017/task-worker'),
    SchedulerModule,
    HealthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
