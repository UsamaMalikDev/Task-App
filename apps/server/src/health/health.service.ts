import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(
    @InjectConnection() private readonly connection: Connection,
  ) {}

  async getHealthStatus() {
    try {
      const dbStatus = await this.checkDatabaseConnection();
      const memoryUsage = process.memoryUsage();
      const uptime = process.uptime();

      const healthStatus = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: `${Math.floor(uptime)}s`,
        database: dbStatus,
        memory: {
          rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
          heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
          heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
          external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`,
        },
        version: process.env.npm_package_version || '1.0.0',
      };

      this.logger.log('Health check passed', healthStatus);
      return healthStatus;
    } catch (error) {
      this.logger.error('Health check failed', error);
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message,
      };
    }
  }

  async getReadinessStatus() {
    try {
      const dbStatus = await this.checkDatabaseConnection();
      
      if (dbStatus.status !== 'connected') {
        return {
          status: 'not ready',
          timestamp: new Date().toISOString(),
          reason: 'Database not connected',
          database: dbStatus,
        };
      }

      const readinessStatus = {
        status: 'ready',
        timestamp: new Date().toISOString(),
        database: dbStatus,
        services: {
          api: 'ready',
          database: 'ready',
        },
      };

      this.logger.log('Readiness check passed', readinessStatus);
      return readinessStatus;
    } catch (error) {
      this.logger.error('Readiness check failed', error);
      return {
        status: 'not ready',
        timestamp: new Date().toISOString(),
        error: error.message,
      };
    }
  }

  private async checkDatabaseConnection() {
    try {
      const state = this.connection.readyState;
      const states = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting',
      };

      return {
        status: states[state] || 'unknown',
        readyState: state,
        host: this.connection.host,
        port: this.connection.port,
        name: this.connection.name,
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
      };
    }
  }
}
