/**
 * app.module.ts - Configuration complète pour architecture hybride
 * 
 * Ce fichier montre comment configurer le module avec Redis + PostgreSQL + RabbitMQ
 * et inclut la validation des variables d'environnement.
 */

import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from '@nestjs-modules/ioredis';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';

// Services
import { OperationHistoryService } from './application/services/operation-history.service';
import { PostgresHistoryService } from './application/services/postgres-history.service';


// Controllers
import { HistoryController } from './infrastructure/http/controllers/history.controller';

// Entities
import { OperationLogEntity } from './infrastructure/database/entities/operation-log.entity';

@Module({
  imports: [
    // ========================================
    // Configuration globale
    // ========================================
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // ========================================
    // REDIS - Cache et monitoring
    // ========================================
    RedisModule.forRoot({
      type: 'single',
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      options: {
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
        enableOfflineQueue: true,
        retryStrategy: (times) => Math.min(times * 50, 2000),
        connectTimeout: 10000,
        lazyConnect: false,
        showFriendlyErrorStack: true,
        commandTimeout: 5000,
      },
    }),

    // ========================================
    // POSTGRESQL - Persistance durable
    // ========================================
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5432', 10),
      username: process.env.DATABASE_USER || 'postgres',
      password: process.env.DATABASE_PASSWORD || 'postgres',
      database: process.env.DATABASE_NAME || 'immo360_sync',

      entities: [OperationLogEntity],
      migrations: ['database/migrations/*.ts'],
      subscribers: [],

      synchronize: false,
      migrationsRun: process.env.NODE_ENV === 'production',
      logging: process.env.LOG_LEVEL === 'debug',
      logger: 'advanced-console',

      poolSize: 10,
      ssl: process.env.DATABASE_SSL === 'true'
        ? { rejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== 'false' }
        : false,

      // ⚠️ Tout ce qui est spécifique au driver PostgreSQL
      extra: {
        connectTimeoutMS: 10000,   // timeout pour la connexion
        statement_timeout: 30000,  // timeout pour les requêtes
        keepAlive: true,            // activer keep-alive
      },
    }),


    TypeOrmModule.forFeature([OperationLogEntity]),

    // ========================================
    // RABBITMQ - Événements
    // ========================================
    RabbitMQModule.forRoot(RabbitMQModule, {
      uri: process.env.RABBITMQ_URL || 'amqp://immo360:immo360@localhost:5672',
      connectionInitOptions: { wait: true },
      prefetchCount: parseInt(process.env.RABBITMQ_PREFETCH || '10', 10),
      exchanges: [
        {
          name: process.env.RABBITMQ_EXCHANGE_NAME || 'immo360_events',
          type: 'topic',
        },
      ],
    }),
  ],

  // ========================================
  // Providers
  // ========================================
  providers: [
    OperationHistoryService,
    PostgresHistoryService,
  ],

  // ========================================
  // Controllers
  // ========================================
  controllers: [
    HistoryController,
  ],

  // ========================================
  // Exports
  // ========================================
  exports: [
    OperationHistoryService,
    PostgresHistoryService,
  ],
})
export class AppModule implements OnModuleInit {
  onModuleInit() {
    this.validateEnv();
  }

  private validateEnv() {
    const requiredEnvs = [
      'REDIS_URL',
      'DATABASE_HOST',
      'DATABASE_USER',
      'DATABASE_NAME',
      'RABBITMQ_URL',
    ];

    const missing = requiredEnvs.filter(env => !process.env[env]);
    if (missing.length > 0) {
      throw new Error(`Missing environment variables: ${missing.join(', ')}`);
    }
  }
}

/**
 * Exemple de fichiers .env :
 *
 * // Développement local
 * REDIS_URL=redis://localhost:6379
 * DATABASE_HOST=localhost
 * DATABASE_PORT=5432
 * DATABASE_USER=postgres
 * DATABASE_PASSWORD=postgres
 * DATABASE_NAME=immo360_sync
 * RABBITMQ_URL=amqp://immo360:immo360@localhost:5672
 * NODE_ENV=development
 * LOG_LEVEL=debug
 *
 * // Staging
 * REDIS_URL=redis://redis-staging:6379
 * DATABASE_HOST=db-staging.internal
 * DATABASE_PORT=5432
 * DATABASE_USER=postgres
 * DATABASE_PASSWORD=${POSTGRES_PASSWORD}
 * DATABASE_NAME=immo360_sync
 * DATABASE_SSL=true
 * RABBITMQ_URL=amqp://amq-staging:5672
 * NODE_ENV=staging
 * LOG_LEVEL=info
 *
 * // Production
 * REDIS_URL=redis://redis-prod-01.internal:6379
 * DATABASE_HOST=db-prod.internal
 * DATABASE_PORT=5432
 * DATABASE_USER=postgres
 * DATABASE_PASSWORD=${POSTGRES_PASSWORD}
 * DATABASE_NAME=immo360_sync
 * DATABASE_SSL=true
 * DATABASE_SSL_REJECT_UNAUTHORIZED=true
 * RABBITMQ_URL=amqp://rabbitmq-prod:5672
 * NODE_ENV=production
 * LOG_LEVEL=warn
 * POSTGRES_HISTORY_ENABLED=true
 * HISTORY_BATCH_SIZE=500
 * HISTORY_FLUSH_INTERVAL=10000
 */
