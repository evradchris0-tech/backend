import { Transport, RmqOptions } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

export const getRabbitMQConfig = (
  configService: ConfigService,
): RmqOptions => ({
  transport: Transport.RMQ,
  options: {
    urls: [
      configService.get<string>(
        'RABBITMQ_URL',
        'amqp://guest:guest@localhost:5672',
      ),
    ],
    queue: configService.get<string>('RABBITMQ_QUEUE', 'equipement_queue'),
    queueOptions: {
      durable: true,
    },
    prefetchCount: 1,
    noAck: false,
  },
});
