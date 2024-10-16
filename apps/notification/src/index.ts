import { BullMQClient } from '@brightpath/bullmq';
import {
  KafkaClient,
  TransactionalMessage,
  transactionNotificationMessageSchema,
} from '@brightpath/kafka';

const kafkaClient = new KafkaClient('notification', ['localhost:9092']);

const priorities: Record<TransactionalMessage['eventType'], number> = {
  email_verification: 0,
  account_creation: 1,
};

console.log('Notification server started');
kafkaClient.startConsumer(['transaction-notification'], async ({ value }) => {
  if (!value) {
    return;
  }
  console.log('Event received', value);
  const message = transactionNotificationMessageSchema.parse(
    JSON.parse(value.toString()),
  );
  console.log('Message received', JSON.parse(value.toString()));

  const queue = new BullMQClient('Mail Queue');

  await queue.addJob(message, priorities[message.eventType]);
});
