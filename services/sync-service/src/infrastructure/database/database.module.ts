import { Module, Global, Logger } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OperationLogEntity } from './entities/operation-log.entity';
import { PostgresHistoryService } from '../../application/services/postgres-history.service';

@Global()
@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: process.env.DATABASE_HOST || 'localhost',
            port: parseInt(process.env.DATABASE_PORT || '5432', 10),
            username: process.env.DATABASE_USER || 'postgres',
            password: process.env.DATABASE_PASSWORD || 'postgres',
            database: process.env.DATABASE_NAME || 'immosync',
            entities: [OperationLogEntity],
            synchronize: process.env.NODE_ENV !== 'production',
            logging: process.env.LOG_LEVEL === 'debug',
            logger: 'advanced-console',
            poolSize: parseInt(process.env.DATABASE_POOL_SIZE || '10', 10),
            retryAttempts: 3,
            retryDelay: 3000,
            autoLoadEntities: true,
            ssl: process.env.DATABASE_SSL === 'true'
                ? { rejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== 'false' }
                : false,
        }),
        TypeOrmModule.forFeature([OperationLogEntity]),
    ],
    providers: [PostgresHistoryService],
    exports: [PostgresHistoryService, TypeOrmModule],
})
export class DatabaseModule {
    private readonly logger = new Logger(DatabaseModule.name);

    constructor() {
        this.logger.log(`Database configuration loaded:`);
        this.logger.log(`  Host: ${process.env.DATABASE_HOST}`);
        this.logger.log(`  Port: ${process.env.DATABASE_PORT}`);
        this.logger.log(`  User: ${process.env.DATABASE_USER}`);
        this.logger.log(`  Database: ${process.env.DATABASE_NAME}`);
    }
}