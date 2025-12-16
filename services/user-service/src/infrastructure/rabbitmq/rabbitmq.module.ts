import { Module } from '@nestjs/common';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RabbitMQPublisherService } from './rabbitmq-publisher.service';

@Module({
    imports: [
        // Correction ici : On passe RabbitMQModule en 1er argument
        RabbitMQModule.forRootAsync(RabbitMQModule, {
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                exchanges: [
                    {
                        name: 'user-domain-events',
                        type: 'topic',
                        options: {
                            durable: true,
                        },
                    },
                ],
                // Utilisation d'une valeur par défaut si la VAR d'env est manquante
                uri: configService.get<string>('RABBITMQ_URL', 'amqp://guest:guest@localhost:5672'),
                connectionInitOptions: { wait: true, timeout: 10000 },
                channels: {
                    'publish-channel': {
                        prefetchCount: 10,
                        default: true,
                    },
                },
            }),
        }),
    ],
    providers: [RabbitMQPublisherService],
    exports: [RabbitMQPublisherService],
})
export class RabbitMQInfraModule {}