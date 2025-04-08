import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor() {}

  canActivate(context: ExecutionContext): boolean {
    const { headers }: Request = context.switchToHttp().getRequest();
    const apiKey = headers['x-api-key'] as string;

    // Check if the API key is present and valid
    if (!apiKey) {
      throw new ForbiddenException('API key is missing');
    }

    if (apiKey !== process.env.API_KEY) {
      throw new ForbiddenException('Invalid API key');
    }

    return true;
  }
}
