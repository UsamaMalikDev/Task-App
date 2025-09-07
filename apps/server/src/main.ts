import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app/app.module';
import { SeedService } from './seed/seed.service';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Set global prefix for all routes
  app.setGlobalPrefix('api');
  
  // Enable CORS for frontend communication
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  
  // Enable cookie parser middleware
  app.use(cookieParser());
  
  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  
  // Set request size limit
  app.use((req, res, next) => {
    if (req.headers['content-length'] && parseInt(req.headers['content-length']) > 10 * 1024 * 1024) {
      return res.status(413).json({ message: 'Request entity too large' });
    }
    next();
  });
  
  // Seed database on startup
  try {
    const seedService = app.get(SeedService);
    await seedService.seedDatabase();
  } catch (error) {
    console.error('Seed service error:', error);
    // Continue startup even if seeding fails
  }
  
  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  
  console.log(`🚀 Server is running on port ${port}`);
  console.log(`📡 API endpoints available at: http://localhost:${port}/api`);
}
bootstrap();
