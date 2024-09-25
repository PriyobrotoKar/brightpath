jest.mock('@brightpath/kafka', () => {
  return {
    KafkaClient: jest.fn().mockImplementation(() => ({
      sendMessage: jest.fn(),
    })),
  };
});
