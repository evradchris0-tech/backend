import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';
import { CacheService } from './cache.service';

@Injectable()
export class CacheInvalidationListener implements OnModuleInit, OnModuleDestroy {
    private connection: any;
    private channel: any;
    private readonly exchangeName = 'immo360.events';
    private readonly queueName = 'api-gateway.cache-invalidation';

    constructor(
        private readonly cacheService: CacheService,
        private readonly configService: ConfigService,
    ) { }

    async onModuleInit(): Promise<void> {
        const url = this.configService.get<string>('rabbitmq.url');
        this.connection = await amqp.connect(url);
        this.channel = await this.connection.createChannel();

        await this.channel.assertExchange(this.exchangeName, 'topic', { durable: true });
        await this.channel.assertQueue(this.queueName, { durable: true });
        await this.channel.bindQueue(this.queueName, this.exchangeName, 'user.*');

        await this.channel.consume(this.queueName, this.handleEvent.bind(this), { noAck: false });

        console.log('✅ Cache Invalidation Listener ready');
    }

    async onModuleDestroy(): Promise<void> {
        if (this.channel) await this.channel.close();
        if (this.connection) await this.connection.close();
    }

    private async handleEvent(msg: amqp.ConsumeMessage | null): Promise<void> {
        if (!msg) return;

        try {
            const event = JSON.parse(msg.content.toString());
            const { eventType, data } = event;

            switch (eventType) {
                case 'user.created':
                case 'user.updated':
                case 'user.deleted':
                    await this.cacheService.invalidateUser(data.id);
                    console.log(`🔄 Cache invalidated for user ${data.id}`);
                    break;
            }

            this.channel.ack(msg);
        } catch (error) {
            console.error('Cache invalidation error:', error);
            this.channel.nack(msg, false, true);
        }
    }
}