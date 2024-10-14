import redisConnection from '@brightpath/redis';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
  LoggerService,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';

type Entity = 'otp' | 'user' | 'tempEmail' | 'refreshToken';

@Injectable()
export class CacheService implements OnModuleDestroy, OnModuleInit {
  private readonly logger: LoggerService;
  constructor() {
    this.logger = new Logger(CacheService.name);
  }
  onModuleInit() {
    redisConnection.on('error', () => {
      this.logger.error('Error while connecting to redis ');
      throw new InternalServerErrorException("Couldn't connect to redis");
    });
  }
  async setCache(
    entity: Entity,
    key: string,
    value: Record<string, any> | string,
    ttl?: number,
  ) {
    const cacheKey = `${entity}:${key}`;
    if (ttl) {
      await redisConnection.setex(cacheKey, ttl, JSON.stringify(value));
    } else {
      await redisConnection.set(cacheKey, JSON.stringify(value));
    }
  }

  async getCachedValue(entity: Entity, key: string) {
    const cacheKey = `${entity}:${key}`;
    const value = await redisConnection.get(cacheKey);
    return JSON.parse(value);
  }

  async getExpiry(entity: Entity, key: string) {
    const cacheKey = `${entity}:${key}`;
    return await redisConnection.ttl(cacheKey);
  }

  async deleteCachedValue(entity: Entity, key: string) {
    await redisConnection.del(`${entity}:${key}`);
  }

  async deleteAllCachedValues(entity: Entity) {
    const keys = await redisConnection.keys(`${entity}:*`);

    if (keys.length > 0) {
      await redisConnection.del(keys);
    }
  }

  async onModuleDestroy() {
    await redisConnection.quit();
  }
}
