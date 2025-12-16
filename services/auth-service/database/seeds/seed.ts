// database/seeds/seed.ts

import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { createSuperAdmin } from './create-admin.seed';
import { AuthUserSchema } from '../../src/infrastructure/persistence/schemas/auth-user.schema';
import { RefreshTokenSchema } from '../../src/infrastructure/persistence/schemas/refresh-token.schema';
import { SessionSchema } from '../../src/infrastructure/persistence/schemas/session.schema';
import { VerificationCodeSchema } from '../../src/infrastructure/persistence/schemas/verification-code.schema';

// Charger les variables d'environnement
config();

const configService = new ConfigService();

const AppDataSource = new DataSource({
    type: 'postgres',
    host: configService.get<string>('DB_HOST'),
    port: configService.get<number>('DB_PORT'),
    username: configService.get<string>('DB_USERNAME'),
    password: configService.get<string>('DB_PASSWORD'),
    database: configService.get<string>('DB_DATABASE'),
    entities: [AuthUserSchema, RefreshTokenSchema, SessionSchema, VerificationCodeSchema],
    synchronize: false,
});

async function runSeeds() {
    try {
        console.log('🌱 Starting database seeding...');

        await AppDataSource.initialize();
        console.log('✅ Database connection established');

        await createSuperAdmin(AppDataSource);

        await AppDataSource.destroy();
        console.log('✅ Seeding completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

runSeeds();