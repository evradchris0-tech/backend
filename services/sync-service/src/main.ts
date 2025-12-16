import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import * as dotenv from 'dotenv';

// Charger les variables d'environnement AVANT tout import de module
dotenv.config();

import { AppModule } from './app.module';

async function bootstrap() {
    const logger = new Logger('Bootstrap');
    
    const app = await NestFactory.create(AppModule, {
        logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });

    // Activer les hooks de shutdown pour graceful shutdown
    app.enableShutdownHooks();

    const port = process.env.PORT || 4003;
    await app.listen(process.env.PORT || 4003, '127.0.0.1');
    
    logger.log(`Sync Service running on http://0.0.0.0:${port}`);
    logger.log(`PostgreSQL History: ${process.env.POSTGRES_HISTORY_ENABLED === 'true' ? 'ENABLED' : 'DISABLED'}`);
}

bootstrap();