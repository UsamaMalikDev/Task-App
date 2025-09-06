import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { ProfileModule } from '../profile/profile.module';
import { TaskModule } from '../task/task.module';

@Module({
  imports: [ProfileModule, TaskModule],
  controllers: [SeedController],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
