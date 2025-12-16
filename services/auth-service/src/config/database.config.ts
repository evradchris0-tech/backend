// src/config/database.config.ts

import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { AuthUserSchema } from '../infrastructure/persistence/schemas/auth-user.schema';
import { SessionSchema } from '../infrastructure/persistence/schemas/session.schema';
import { RefreshTokenSchema } from '../infrastructure/persistence/schemas/refresh-token.schema';
import { VerificationCodeSchema } from '../infrastructure/persistence/schemas/verification-code.schema';

const configService = new ConfigService();

const databaseConfig: TypeOrmModuleOptions = {
    type: 'postgres',
    host: configService.get<string>('DB_HOST', 'localhost'),
    port: configService.get<number>('DB_PORT', 5432),
    username: configService.get<string>('DB_USERNAME', 'immo360_user'),
    password: configService.get<string>('DB_PASSWORD', 'immo360MSAuth'),
    database: configService.get<string>('DB_DATABASE', 'immo360_auth'),
    entities: [AuthUserSchema, SessionSchema, RefreshTokenSchema, VerificationCodeSchema],
    synchronize: configService.get<string>('DB_SYNCHRONIZE', 'false') === 'true',
    logging: configService.get<string>('NODE_ENV') === 'development',
};

export default databaseConfig;