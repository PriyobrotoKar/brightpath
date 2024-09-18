import { Consumer, Kafka, KafkaMessage, Partitioners, Producer } from 'kafkajs';
import z from 'zod';

const emailVerificationMessageSchema = z.object({
  eventType: z.literal('email_verification'),
  recipient: z.object({
    email: z.string().email(),
  }),
  otp: z.string().min(6).max(6),
});

const accountCreationMessageSchema = z.object({
  eventType: z.literal('account_creation'),
  recipient: z.object({
    email: z.string().email(),
  }),
});

export const transactionNotificationMessageSchema = z.discriminatedUnion(
  'eventType',
  [emailVerificationMessageSchema, accountCreationMessageSchema],
);

export type TransactionalMessage = z.infer<
  typeof transactionNotificationMessageSchema
>;

type TopicMessage = {
  'transaction-notification': TransactionalMessage;
};
interface IKafkaClient {
  checkStatus(): Promise<{ topics: string[] }>;
  startConsumer<T extends Array<Topic>>(
    topics: T,
    handleKafkaMessage: (message: KafkaMessage, topic: T[number]) => void,
  ): Promise<void>;
  stopConsumer(): Promise<void>;
  sendMessage<T extends Topic>(
    topic: T,
    message: TopicMessage[T],
  ): Promise<void>;
}

const groupID = {
  notification: 'notification-group',
} as const;

type ClientId = keyof typeof groupID;
type Topic = keyof TopicMessage;

export class KafkaClient implements IKafkaClient {
  private kafkaClient: Kafka;
  private producer: Producer;
  private consumer: Consumer;
  constructor(
    clientId: ClientId,
    brokers: string[],
    connectionTimeout: number = 5000,
  ) {
    this.kafkaClient = new Kafka({
      clientId: clientId,
      brokers,
      connectionTimeout: connectionTimeout,
    });
    this.producer = this.kafkaClient.producer({
      createPartitioner: Partitioners.LegacyPartitioner,
      idempotent: true,
    });
    this.consumer = this.kafkaClient.consumer({
      groupId: groupID[clientId],
    });
  }

  async startConsumer<T extends Array<Topic>>(
    topics: T,
    handleKafkaMessage: (message: KafkaMessage, topic: T[number]) => void,
  ): Promise<void> {
    await this.consumer.connect();
    await this.consumer.subscribe({ topics: topics });
    console.log(`consumer subscribed to ${topics}`);
    await this.consumer.run({
      eachMessage: async ({ message, topic }) => {
        handleKafkaMessage(message, topic as T[number]);
      },
    });
  }

  async stopConsumer(): Promise<void> {
    await this.consumer.disconnect();
  }

  async checkStatus() {
    const admin = this.kafkaClient.admin();
    await admin.connect();

    const topics = await admin.listTopics();
    return { topics };
  }

  async sendMessage<T extends Topic>(
    topic: T,
    message: TopicMessage[T],
  ): Promise<void> {
    await this.producer.connect();
    await this.producer.send({
      topic: topic,
      acks: -1,
      messages: [{ value: JSON.stringify(message) }],
    });
    await this.producer.disconnect();
  }
}
