import ioredis from 'ioredis';

const redisConfig = {
  port: 6379,
  host: 'localhost',
};

const redisConnection = new ioredis(redisConfig);

export default redisConnection;
