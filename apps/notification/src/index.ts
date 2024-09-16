import { KafkaClient } from '@brightpath/kafka';

const kafkaClient = new KafkaClient('notification', ['localhost:9092']);

kafkaClient.startConsumer(['transaction-notification'], ({ value }) => {
  if (!value) {
    return;
  }
  console.log('Message received', JSON.parse(value.toString()));
});
