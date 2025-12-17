// src/app.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { getTypeOrmConfig } from './infrastructure/config/typeorm.config';
import { InfrastructureModule } from './modules/infrastructure.module';
import { PersistenceModule } from './modules/persistence.module';
import { MessagingModule } from './modules/messaging.module';

/**
 * Module racine de l'application infrastructure-service
 */
@Module({
    imports: [
        // Configuration globale
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ['.env.local', '.env'],
        }),

        // Base de donnees TypeORM
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) =>
                getTypeOrmConfig(configService),
        }),

        // Event Emitter pour les evenements internes
        EventEmitterModule.forRoot({
            wildcard: true,
            delimiter: '.',
            newListener: false,
            removeListener: false,
            maxListeners: 20,
            verboseMemoryLeak: true,
            ignoreErrors: false,
        }),

        // Modules applicatifs
        PersistenceModule,
        MessagingModule,
        InfrastructureModule,
    ],
})
export class AppModule {}