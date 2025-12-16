// src/infrastructure/persistence/config/typeorm-config.service.ts

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmOptionsFactory, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AuthUserSchema } from '../schemas/auth-user.schema';
import { SessionSchema } from '../schemas/session.schema';
import { RefreshTokenSchema } from '../schemas/refresh-token.schema';

/**
 * Service de configuration TypeORM pour Auth-Service
 * Charge les paramètres depuis les variables d'environnement
 */
@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
    constructor(private readonly configService: ConfigService) {}

    createTypeOrmOptions(): TypeOrmModuleOptions {
        return {
            type: 'postgres',
            host: this.configService.get<string>('DB_HOST', 'localhost'),
            port: this.configService.get<number>('DB_PORT', 5432),
            username: this.configService.get<string>('DB_USERNAME', 'immo360_auth'),
            password: this.configService.get<string>('DB_PASSWORD', 'immo360MSAuth'),
            database: this.configService.get<string>('DB_DATABASE', 'immo360_auth'),
            entities: [
                AuthUserSchema,
                SessionSchema,
                RefreshTokenSchema,
            ],
            synchronize: this.configService.get<boolean>('DB_SYNCHRONIZE', false),
            logging: this.configService.get<boolean>('DB_LOGGING', false),
            migrations: [__dirname + '/../migrations/**/*{.ts,.js}'],
            migrationsRun: false,
            ssl: this.configService.get<boolean>('DB_SSL', false)
                ? { rejectUnauthorized: false }
                : false,
        };
    }
}