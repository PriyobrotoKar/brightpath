import { config } from 'dotenv';
import ioredis, { RedisOptions } from 'ioredis';

config({
  path: `../../.env${process.env.NODE_ENV ? '.' + process.env.NODE_ENV : ''}`,
});

const port = process.env.REDIS_PORT ?? 6379;
const host = process.env.REDIS_HOST ?? 'localhost';

const redisConfig: RedisOptions = {
  port: Number(port),
  host,
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  ...(!!process.env.REDIS_HOST && { tls: {} }),
};

const redisConnection = new ioredis(redisConfig);

redisConnection.on('error', (e) => {
  console.log(e);
  console.log('Error in Redis Connection');
});

export default redisConnection;
