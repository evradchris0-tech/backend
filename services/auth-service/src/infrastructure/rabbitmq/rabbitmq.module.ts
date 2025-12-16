// src/infrastructure/rabbitmq/rabbitmq.module.ts

import { Module } from '@nestjs/common';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { TypeOrmModule } from '@nestjs/typeorm'; // ✅ NOUVEAU
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserRoleSyncHandler } from './user-role-sync.handler';
import { TypeOrmAuthUserRepository } from '../persistence/repositories/typeorm-auth-user.repository';
import { AuthUserSchema } from '../persistence/schemas/auth-user.schema'; // ✅ NOUVEAU

@Module({
    imports: [
        TypeOrmModule.forFeature([AuthUserSchema]),
        
        // Configuration RabbitMQ
        RabbitMQModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                exchanges: [
                    {
                        name: 'user-domain-events',
                        type: 'topic',
                    },
                ],
                uri: configService.get<string>('RABBITMQ_URL', 'amqp://localhost:5672'),
                connectionInitOptions: { wait: false },
                enableControllerDiscovery: true,
            }),
        }),
    ],
    providers: [
        UserRoleSyncHandler,
        {
            provide: 'IAuthUserRepository',
            useClass: TypeOrmAuthUserRepository,
        },
    ],
    exports: [RabbitMQModule],
})
export class RabbitMQInfraModule {}