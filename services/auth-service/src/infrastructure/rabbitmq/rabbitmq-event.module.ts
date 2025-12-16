// src/infrastructure/rabbitmq/rabbitmq-event.module.ts

import { Module, Logger } from '@nestjs/common';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersImportedEventHandler } from '../../application/handlers/users-imported.handler';
import { UserCreatedHandler } from '../../application/handlers/user-created.handler';
import { AuthCredentialService } from '../../application/services/auth-credential.service';
import { EmailService } from '../../application/services/email.service';

@Module({
    imports: [
        ConfigModule,

        RabbitMQModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => {
                const logger = new Logger('RabbitMQModule');
                const uri = configService.get<string>('RABBITMQ_URL');

                if (!uri) {
                    logger.warn('RABBITMQ_URL not configured - RabbitMQ will not be available');
                }

                return {
                    exchanges: [
                        {
                            name: 'user-domain-events',
                            type: 'topic',
                            options: { durable: true },
                        },
                        {
                            name: 'auth-domain-events',
                            type: 'topic',
                            options: { durable: true },
                        },
                    ],

                    uri: uri || 'amqp://localhost:5672',

                    connectionInitOptions: {
                        wait: false,
                        timeout: 10000,
                    },

                    channels: {
                        'auth-service-channel': {
                            prefetchCount: 10,
                            default: true,
                        },
                    },
                };
            },

            inject: [ConfigService],
        }),
    ],

    providers: [
        UsersImportedEventHandler,
        UserCreatedHandler,
        AuthCredentialService,
        EmailService,
    ],

    exports: [
        RabbitMQModule,
        AuthCredentialService,
        EmailService,
    ],
})
export class RabbitMQEventModule {}
