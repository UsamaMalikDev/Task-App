// config.module.ts
import { Module } from '@nestjs/common';
import { ConfigService } from './config.service';

@Module({
  providers: [
    {
      provide: ConfigService,
      useFactory: () => new ConfigService('.env'), // ✅ ensure filePath is passed
    },
  ],
  exports: [ConfigService],
})
export class ConfigModule {}
