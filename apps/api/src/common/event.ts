import { KafkaClient, TransactionalMessage } from '@brightpath/kafka';
import { Logger } from '@nestjs/common';

export const createEvent = async (message: TransactionalMessage) => {
  const logger = new Logger();
  const kafkaClient = new KafkaClient('notification', ['localhost:9092']);

  await kafkaClient.sendMessage('transaction-notification', message);

  logger.log(
    `Event created ${JSON.stringify(message)} in topic transaction-notification`,
  );
};
