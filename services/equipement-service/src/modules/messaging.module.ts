import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import {
  RabbitMQPublisherService,
  RabbitMQConsumerService,
  InfrastructureRpcClientService,
} from '../infrastructure/messaging';

/**
 * Module de messagerie - Gère RabbitMQ et la communication inter-services
 */
@Module({
  imports: [EventEmitterModule.forRoot()],
  providers: [
    RabbitMQPublisherService,
    RabbitMQConsumerService,
    InfrastructureRpcClientService,
  ],
  exports: [
    RabbitMQPublisherService,
    InfrastructureRpcClientService,
  ],
})
export class MessagingModule {}
