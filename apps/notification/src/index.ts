import { BullMQClient } from '@brightpath/bullmq';
import {
  KafkaClient,
  transactionNotificationMessageSchema,
} from '@brightpath/kafka';

const kafkaClient = new KafkaClient('notification', ['localhost:9092']);

const eventTypes = transactionNotificationMessageSchema.options.map(
  (option) => option.shape.eventType.value,
);

type Event = (typeof eventTypes)[number];

const priorities: Record<Event, number> = {
  email_verification: 0,
  account_creation: 1,
};

kafkaClient.startConsumer(['transaction-notification'], async ({ value }) => {
  if (!value) {
    return;
  }
  const message = transactionNotificationMessageSchema.parse(
    JSON.parse(value.toString()),
  );
  console.log('Message received', JSON.parse(value.toString()));

  const queue = new BullMQClient('Mail Queue');

  await queue.addJob(message, priorities[message.eventType]);
});
