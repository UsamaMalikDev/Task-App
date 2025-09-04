import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';

@Controller()
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get('health')
  async healthCheck() {
    return this.healthService.getHealthStatus();
  }

  @Get('healthz')
  async healthCheckK8s() {
    return this.healthService.getHealthStatus();
  }

  @Get('readinessz')
  async readinessCheck() {
    return this.healthService.getReadinessStatus();
  }
}
