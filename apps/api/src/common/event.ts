import { KafkaClient } from '@brightpath/kafka';
import { Logger } from '@nestjs/common';

export const createEvent = async ({ message }: { message: string }) => {
  const logger = new Logger();
  const kafkaClient = new KafkaClient('notification', ['localhost:9092']);

  await kafkaClient.sendMessage('transaction-notification', { value: message });

  logger.log(`Event created ${message} in topic transaction-notification`);
};
