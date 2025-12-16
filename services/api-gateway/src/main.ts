// src/main.ts

import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
    const logger = new Logger('Bootstrap');

    const app = await NestFactory.create(AppModule, {
        logger: ['error', 'warn', 'log', 'debug'],
    });

    const configService = app.get(ConfigService);
    const nodeEnv = configService.get<string>('gateway.nodeEnv') || 'development';

    app.use(helmet({
        contentSecurityPolicy: nodeEnv === 'production',
        crossOriginEmbedderPolicy: false,
    }));

    const corsOrigins = configService.get<string[]>('gateway.cors.origins') || [];
    app.enableCors({
        origin: corsOrigins,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
        exposedHeaders: ['Content-Disposition'],
        maxAge: 86400,
    });
    logger.log(`CORS enabled for: ${corsOrigins.join(', ')}`);

    const globalPrefix = configService.get<string>('gateway.globalPrefix') || 'api';
    const apiVersion = configService.get<string>('gateway.apiVersion') || 'v1';
    app.setGlobalPrefix(`${globalPrefix}/${apiVersion}`);

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            transformOptions: { enableImplicitConversion: true },
        }),
    );

    const port = configService.get<number>('gateway.port') || 4000;
    await app.listen(port);

    logger.log(`================================================`);
    logger.log(`Environment: ${nodeEnv}`);
    logger.log(`API Gateway: http://localhost:${port}/${globalPrefix}/${apiVersion}`);
    logger.log(`Health: http://localhost:${port}/${globalPrefix}/${apiVersion}/health`);
    logger.log(`================================================`);
}

bootstrap();
