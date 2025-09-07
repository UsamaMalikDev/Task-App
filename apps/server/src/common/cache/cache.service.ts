import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from 'src/common/config/config.service';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private cache = new Map<string, { data: any; expires: number }>();

  constructor(private readonly configService: ConfigService) {}

  async get<T>(key: string): Promise<T | null> {
    try {
      const cached = this.cache.get(key);
      if (!cached) return null;
    

      if (Date.now() > cached.expires) {
        this.cache.delete(key);
        return null;
      }

      this.logger.debug(`Cache hit for key: ${key}`);
      return cached.data;
    } catch (error) {
      this.logger.error('Error getting from cache', error);
      return null;
    }
  }

  async set<T>(key: string, data: T, ttlSeconds: number = 300): Promise<void> {
    try {
      const expires = Date.now() + (ttlSeconds * 1000);
      this.cache.set(key, { data, expires });
      this.logger.debug(`Cache set for key: ${key}, TTL: ${ttlSeconds}s`);
    } catch (error) {
      this.logger.error('Error setting cache', error);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      this.cache.delete(key);
      this.logger.debug(`Cache deleted for key: ${key}`);
    } catch (error) {
      this.logger.error('Error deleting from cache', error);
    }
  }

  async deletePattern(pattern: string): Promise<void> {
    try {
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      const keysToDelete: string[] = [];

      for (const key of this.cache.keys()) {
        if (regex.test(key)) keysToDelete.push(key); 
      }

      keysToDelete.forEach(key => this.cache.delete(key));
      this.logger.debug(`Cache pattern deleted: ${pattern}, removed ${keysToDelete.length} keys`);
    } catch (error) {
      this.logger.error('Error deleting cache pattern', error);
    }
  }

  async clear(): Promise<void> {
    try {
      this.cache.clear();
      this.logger.debug('Cache cleared');
    } catch (error) {
      this.logger.error('Error clearing cache', error);
    }
  }

  generateTaskCacheKey(organizationId: string, query: unknown): string {
    const queryString = JSON.stringify(query);
    return `tasks:${organizationId}:${Buffer.from(queryString).toString('base64')}`;
  }

  generateTaskInvalidationPattern(organizationId: string): string {
    return `tasks:${organizationId}:*`;
  }
}
