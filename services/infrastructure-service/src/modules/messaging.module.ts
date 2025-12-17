// src/modules/messaging.module.ts

import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
    RabbitMQPublisherService,
    RabbitMQConsumerService,
} from '../infrastructure/messaging';

/**
 * Module de messaging RabbitMQ
 * Gere la communication asynchrone avec les autres microservices
 */
@Global()
@Module({
    imports: [ConfigModule],
    providers: [
        RabbitMQPublisherService,
        RabbitMQConsumerService,
    ],
    exports: [
        RabbitMQPublisherService,
        RabbitMQConsumerService,
    ],
})
export class MessagingModule {}