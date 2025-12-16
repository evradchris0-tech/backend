import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule } from '@nestjs-modules/ioredis';
import { HttpModule } from '@nestjs/axios';

import { DatabaseModule } from './infrastructure/database/database.module';
import { RabbitMQConsumerService } from './infrastructure/rabbitmq/rabbitmq-consumer.service';
import { EventHandlerRegistry } from './application/services/event-handler-registry.service';
import { ServiceAdapterRegistry } from './application/services/service-adapter-registry.service';
import { IdempotenceService } from './application/services/idempotence.service';
import { OperationHistoryService } from './application/services/operation-history.service';
import { AuthServiceAdapter } from './infrastructure/adapters/auth-service.adapter';

import { UserCreatedHandler } from './application/handlers/user-created.handler';
import { UserUpdatedHandler } from './application/handlers/user-updated.handler';
import { UserDeletedHandler } from './application/handlers/user-deleted.handler';
import { UsersImportedEventHandler } from './application/handlers/users-imported.handler';
import { PasswordsGeneratedEventHandler } from './application/handlers/passwords-generated.handler';

import { HistoryController } from './infrastructure/http/controllers/history.controller';

function shouldLoadPostgresModule(): boolean {
    return process.env.POSTGRES_HISTORY_ENABLED === 'true';
}

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),

        RedisModule.forRoot({
            type: 'single',
            url: process.env.REDIS_URL,
            options: {
                maxRetriesPerRequest: null,
                enableReadyCheck: false,
                enableOfflineQueue: true,
                retryStrategy: (times: number) => Math.min(times * 50, 2000),
                connectTimeout: 10000,
                lazyConnect: false,
            },
        }),

        HttpModule.register({
            timeout: 5000,
            maxRedirects: 3,
        }),

        // Chargement conditionnel
        ...(shouldLoadPostgresModule() ? [DatabaseModule] : []),
    ],

    controllers: [HistoryController],

    providers: [
        RabbitMQConsumerService,
        EventHandlerRegistry,
        ServiceAdapterRegistry,
        IdempotenceService,
        OperationHistoryService,
        AuthServiceAdapter,

        UserCreatedHandler,
        UserUpdatedHandler,
        UserDeletedHandler,
        UsersImportedEventHandler,
        PasswordsGeneratedEventHandler,
    ],

    exports: [
        OperationHistoryService,
        EventHandlerRegistry,
        RabbitMQConsumerService,
    ],
})
export class AppModule implements OnModuleInit {
    private readonly logger = new Logger(AppModule.name);

    constructor(
        private readonly configService: ConfigService,
        private readonly adapterRegistry: ServiceAdapterRegistry,
        private readonly authAdapter: AuthServiceAdapter,
        private readonly handlerRegistry: EventHandlerRegistry,
        private readonly userCreatedHandler: UserCreatedHandler,
        private readonly userUpdatedHandler: UserUpdatedHandler,
        private readonly userDeletedHandler: UserDeletedHandler,
        private readonly usersImportedEventHandler: UsersImportedEventHandler,
        private readonly passwordsGeneratedEventHandler: PasswordsGeneratedEventHandler,
    ) {}

    onModuleInit(): void {
        this.validateEnvironment();
        this.registerAdapters();
        this.registerEventHandlers();
        this.logger.log('AppModule initialized successfully');
    }

    private validateEnvironment(): void {
        const requiredVars = ['REDIS_URL', 'RABBITMQ_URL'];

        if (process.env.POSTGRES_HISTORY_ENABLED === 'true') {
            requiredVars.push('DB_HOST', 'DB_USERNAME', 'DB_DATABASE');
        }

        const missing = requiredVars.filter((key) => !process.env[key]);

        if (missing.length > 0) {
            throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
        }

        this.logger.log('Environment validation passed');
    }

    private registerAdapters(): void {
        this.adapterRegistry.registerAdapter(this.authAdapter);
        this.logger.log('Service adapters registered');
    }

    private registerEventHandlers(): void {
        this.handlerRegistry.registerHandler('user.created', this.userCreatedHandler.handle.bind(this.userCreatedHandler));
        this.handlerRegistry.registerHandler('user.updated', this.userUpdatedHandler.handle.bind(this.userUpdatedHandler));
        this.handlerRegistry.registerHandler('user.deleted', this.userDeletedHandler.handle.bind(this.userDeletedHandler));
        this.handlerRegistry.registerHandler('users.imported', this.usersImportedEventHandler.handle.bind(this.usersImportedEventHandler));
        this.handlerRegistry.registerHandler('passwords.generated', this.passwordsGeneratedEventHandler.handle.bind(this.passwordsGeneratedEventHandler));

        this.logger.log('Event handlers registered');
    }
}
