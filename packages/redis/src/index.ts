import ioredis, { RedisOptions } from 'ioredis';

const redisConfig: RedisOptions = {
  port: 6379,
  host: 'localhost',
  maxRetriesPerRequest: null,
};

const redisConnection = new ioredis(redisConfig);

export default redisConnection;
