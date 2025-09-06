import { Controller, Post, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SeedService } from './seed.service';

@Controller('seed')
@ApiTags('Seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Seed the database with sample data' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Database seeded successfully'
  })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error' })
  async forceSeedDatabase() {
    await this.seedService.forceSeedDatabase();
    return { message: 'Database seeded successfully' };
  }
}
