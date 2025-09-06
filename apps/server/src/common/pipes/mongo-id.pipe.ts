import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class MongoIdPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (!value || typeof value !== 'string') {
      throw new BadRequestException('Invalid ID format');
    }

    // Check if it's a valid MongoDB ObjectId (24 hex characters)
    if (!/^[0-9a-fA-F]{24}$/.test(value)) {
      throw new BadRequestException('Invalid MongoDB ObjectId format');
    }

    return value;
  }
}
