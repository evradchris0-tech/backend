import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';
import { v4 as uuidv4 } from 'uuid';

export interface UserEvent {
  eventId: string;
  eventType: string;
  timestamp: string;
  version: string;
  data: any;
}

@Injectable()
export class RabbitMQPublisherService implements OnModuleInit, OnModuleDestroy {
  private connection: any;
  private channel: any;
  private readonly exchangeName = 'user-domain-events';
  
  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    const url = this.configService.get<string>('RABBITMQ_URL', 'amqp://immo360:immo360@localhost:5672');
    try {
      this.connection = await amqp.connect(url);
      this.channel = await this.connection.createChannel();
      
      await this.channel.assertExchange(this.exchangeName, 'topic', { durable: true });
      
      console.log('✅ RabbitMQ Publisher connected');
    } catch (error) {
      const err = error as Error;
      console.error('❌ RabbitMQ connection failed:', err.message);
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.channel) await this.channel.close();
    if (this.connection) await this.connection.close();
  }

  async publishUserCreated(data: {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    temporaryPassword: string;
    passwordEncrypted: string;
    status: string;
    emailVerified: boolean;
  }): Promise<void> {
    const event: UserEvent = {
      eventId: uuidv4(),
      eventType: 'user.created',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      data: {
        userId: data.userId,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        temporaryPassword: data.temporaryPassword,
        passwordEncrypted: data.passwordEncrypted,
        status: data.status,
        emailVerified: data.emailVerified,
      }
    };

    await this.publish('user.created', event);
  }

  async publishUserUpdated(data: {
    id: string;
    updatedFields: Record<string, any>;
    updatedAt: Date;
  }): Promise<void> {
    const event: UserEvent = {
      eventId: uuidv4(),
      eventType: 'user.updated',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      data
    };
    
    await this.publish('user.updated', event);
  }

  async publishUserDeleted(data: {
    id: string;
    email: string;
    deletedAt: Date;
  }): Promise<void> {
    const event: UserEvent = {
      eventId: uuidv4(),
      eventType: 'user.deleted',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      data
    };
    
    await this.publish('user.deleted', event);
  }

  private async publish(routingKey: string, event: UserEvent): Promise<void> {
    if (!this.channel) {
      console.error('❌ RabbitMQ channel not initialized');
      return;
    }

    const message = Buffer.from(JSON.stringify(event));
    
    this.channel.publish(
      this.exchangeName,
      routingKey,
      message,
      {
        persistent: true,
        contentType: 'application/json',
        messageId: event.eventId,
        timestamp: Date.now(),
      }
    );
    
    console.log(`📤 Published ${routingKey}:`, event.eventId);
  }
}