import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TaskService } from '../task/task.service';

@Injectable()
export class OverdueTaskScheduler {
  private readonly logger = new Logger(OverdueTaskScheduler.name);

  constructor(private readonly taskService: TaskService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleOverdueTasks() {
    try {
      this.logger.log('Starting overdue task check...');
      
      const overdueTasks = await this.taskService.findOverdueTasks();
      
      if (overdueTasks.length === 0) {
        this.logger.log('No overdue tasks found');
        return;
      }

      const taskIds = overdueTasks.map(task => task._id.toString());
      await this.taskService.markTasksAsOverdue(taskIds);

      this.logger.log(`Successfully marked ${taskIds.length} tasks as overdue`, {
        taskIds,
        organizationIds: [...new Set(overdueTasks.map(task => task.organization))],
      });

      // Log task statistics
      const stats = await this.taskService.getTaskStats();
      this.logger.log('Task statistics', stats);

    } catch (error) {
      this.logger.error('Error in overdue task scheduler', error);
    }
  }

  // Manual trigger for testing
  async triggerOverdueTaskCheck(): Promise<void> {
    this.logger.log('Manually triggering overdue task check...');
    await this.handleOverdueTasks();
  }
}
