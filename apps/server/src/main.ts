import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { SeedService } from './seed/seed.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Seed database on startup
  const seedService = app.get(SeedService);
  await seedService.seedDatabase();
  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
