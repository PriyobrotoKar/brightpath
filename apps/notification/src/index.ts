import { BullMQClient } from '@brightpath/bullmq';
import {
  KafkaClient,
  transactionNotificationMessageSchema,
} from '@brightpath/kafka';

const kafkaClient = new KafkaClient('notification', ['localhost:9092']);

kafkaClient.startConsumer(['transaction-notification'], async ({ value }) => {
  if (!value) {
    return;
  }
  const message = transactionNotificationMessageSchema.parse(
    JSON.parse(value.toString()),
  );
  console.log('Message received', JSON.parse(value.toString()));

  const queue = new BullMQClient('Mail Queue');

  await queue.addJob(message);
});
