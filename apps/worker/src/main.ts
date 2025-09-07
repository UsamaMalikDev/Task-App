import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3003;
  const nodeEnv = configService.get<string>('NODE_ENV') || 'development';
  
  await app.listen(port);
  
  console.log(`Worker service is running on port ${port} in ${nodeEnv} mode`);
}
bootstrap();
