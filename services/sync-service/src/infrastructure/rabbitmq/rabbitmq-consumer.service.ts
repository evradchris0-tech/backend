import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';
import { EventHandlerRegistry } from '../../application/services/event-handler-registry.service';
import { IdempotenceService } from '../../application/services/idempotence.service';

@Injectable()
export class RabbitMQConsumerService implements OnModuleInit, OnModuleDestroy {
  private connection: any;
  private channel: any;
  private readonly exchangeName = 'immo360.events';
  private readonly queueName = 'sync-service.queue';
  private readonly dlqName = 'sync-service.dlq';
  private readonly retryQueueName = 'sync-service.retry';

  constructor(
    private readonly configService: ConfigService,
    private readonly handlerRegistry: EventHandlerRegistry,
    private readonly idempotenceService: IdempotenceService,
  ) {}

  async onModuleInit(): Promise<void> {
    const url = this.configService.get<string>('RABBITMQ_URL', 'amqp://immo360:immo360@localhost:5672');
    this.connection = await amqp.connect(url);
    this.channel = await this.connection.createChannel();

    await this.channel.assertExchange(this.exchangeName, 'topic', { durable: true });
    
    // DLQ - Dead Letter Queue
    await this.channel.assertQueue(this.dlqName, { durable: true });
    
    // Retry Queue avec TTL et redirection vers la queue principale
    await this.channel.assertQueue(this.retryQueueName, {
      durable: true,
      arguments: {
        'x-message-ttl': 5000, // 5 secondes de délai
        'x-dead-letter-exchange': '',
        'x-dead-letter-routing-key': this.queueName,
      },
    });
    
    // Queue principale avec DLQ
    await this.channel.assertQueue(this.queueName, {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': '',
        'x-dead-letter-routing-key': this.dlqName,
      },
    });

    await this.channel.bindQueue(this.queueName, this.exchangeName, 'user.*');
    await this.channel.prefetch(10);
    await this.channel.consume(this.queueName, this.handleMessage.bind(this), { noAck: false });

    console.log('✅ RabbitMQ Consumer ready');
  }

  async onModuleDestroy(): Promise<void> {
    if (this.channel) await this.channel.close();
    if (this.connection) await this.connection.close();
  }

  private async handleMessage(msg: amqp.ConsumeMessage | null): Promise<void> {
    if (!msg) return;

    const startTime = Date.now();

    try {
      const event = JSON.parse(msg.content.toString());
      const { eventId, eventType, data } = event;

      console.log(`📥 Received ${eventType}:`, eventId);

      const isDuplicate = await this.idempotenceService.isDuplicate(eventId);
      if (isDuplicate) {
        console.log(`⚠️  Duplicate event ignored: ${eventId}`);
        this.channel.ack(msg);
        return;
      }

      const handler = this.handlerRegistry.getHandler(eventType);
      if (!handler) {
        console.warn(`⚠️  No handler for ${eventType}`);
        this.channel.ack(msg);
        return;
      }

      await handler(data);
      await this.idempotenceService.markProcessed(eventId, eventType, data);
      this.channel.ack(msg);

      const duration = Date.now() - startTime;
      console.log(`✅ Processed ${eventType} in ${duration}ms`);

    } catch (error) {
      console.error(`❌ Error processing message:`, error);

      // Récupérer le compteur de retry depuis les headers
      const retryCount = (msg.properties.headers?.['x-retry-count'] || 0);
      const maxRetries = 3;

      if (retryCount < maxRetries) {
        console.log(`🔄 Retry ${retryCount + 1}/${maxRetries} - sending to retry queue`);

        // Publier dans la retry queue avec le compteur incrémenté
        this.channel.sendToQueue(
          this.retryQueueName,
          msg.content,
          {
            headers: {
              ...msg.properties.headers,
              'x-retry-count': retryCount + 1,
            },
            persistent: true,
          }
        );

        // Acquitter le message original
        this.channel.ack(msg);
      } else {
        console.error(`💀 Max retries exceeded, sending to DLQ`);
        // Rejeter définitivement vers la DLQ
        this.channel.nack(msg, false, false);
      }
    }
  }
}