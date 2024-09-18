import redisConnection from '@brightpath/redis';
import { TransactionalMessage } from '@brightpath/kafka';
import { Job, Queue, Worker, WorkerOptions } from 'bullmq';

const queues = ['Mail Queue', 'Some queue'] as const;

type Name = (typeof queues)[number];

export class BullMQClient {
  private mailQueue;
  constructor(private name: Name) {
    this.mailQueue = new Queue(name, { connection: redisConnection });
  }

  async addJob(data: TransactionalMessage) {
    this.mailQueue.add('mail', data);
  }

  async consumeJob(
    callback: (job: Job) => void,
    options?: Omit<WorkerOptions, 'connection'>,
  ) {
    const worker = new Worker(
      this.name,
      async (job) => {
        callback(job);
      },
      { connection: redisConnection, ...options },
    );
    worker.on('failed', (job, err) => {
      console.log(`Job failed with error ${err.message}`);
    });
  }
}
