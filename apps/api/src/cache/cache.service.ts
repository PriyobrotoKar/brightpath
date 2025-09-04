import redisConnection from '@brightpath/redis';
import {
  Injectable,
  InternalServerErrorException,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';

type Entity =
  | 'otp'
  | 'user'
  | 'tempEmail'
  | 'refreshToken'
  | 'merchant'
  | 'slug';

@Injectable()
export class CacheService implements OnModuleDestroy, OnModuleInit {
  onModuleInit() {
    redisConnection.on('error', () => {
      throw new InternalServerErrorException("Couldn't connect to redis");
    });
  }
  async setCache(
    entity: Entity,
    key: string,
    value: any[] | Record<string, any> | string,
    ttl?: number,
  ) {
    const cacheKey = `${entity}:${key}`;
    if (ttl) {
      await redisConnection.setex(cacheKey, ttl, JSON.stringify(value));
    } else {
      await redisConnection.set(cacheKey, JSON.stringify(value));
    }
  }

  async getCachedValue<T>(entity: Entity, key: string): Promise<T | null> {
    const cacheKey = `${entity}:${key}`;
    const value = await redisConnection.get(cacheKey);

    if (value === null) return null;

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
