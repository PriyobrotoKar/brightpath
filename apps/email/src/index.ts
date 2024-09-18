import { BullMQClient } from '@brightpath/bullmq';

const queue = new BullMQClient('Mail Queue');

queue.consumeJob(
  (job) => {
    console.log('Job consumed at', new Date().toUTCString(), ':', job.data);
  },
  { limiter: { max: 1, duration: 1000 } },
);
