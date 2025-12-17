// src/main.ts

import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './presentation/filters/http-exception.filter';

/**
 * Point d'entree de l'application infrastructure-service
 */
async function bootstrap(): Promise<void> {
    const logger = new Logger('Bootstrap');

    // Creation de l'application NestJS
    const app = await NestFactory.create(AppModule, {
        logger: ['error', 'warn', 'log', 'debug'],
    });

    const configService = app.get(ConfigService);

    // Configuration globale du prefix API
    app.setGlobalPrefix('api/v1');

    // Activation du CORS
    app.enableCors({
        origin: configService.get<string>('CORS_ORIGIN', '*'),
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
    });

    // Configuration du ValidationPipe global
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            transformOptions: {
                enableImplicitConversion: true,
            },
        }),
    );

    // Configuration du filtre d'exception global
    app.useGlobalFilters(new HttpExceptionFilter());

    // Configuration Swagger/OpenAPI
    const swaggerConfig = new DocumentBuilder()
        .setTitle('Infrastructure Service API')
        .setDescription(
            'API de gestion des infrastructures IUSJC - Batiments, Etages, Espaces et Equipements',
        )
        .setVersion('1.0.0')
        .addBearerAuth()
        .addTag('Batiments', 'Gestion des batiments')
        .addTag('Etages', 'Gestion des etages')
        .addTag('Espaces', 'Gestion des espaces (chambres, salles, bureaux)')
        .addTag('Equipements', 'Gestion des equipements')
        .addTag('Import', 'Import de donnees via Excel')
        .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document, {
        swaggerOptions: {
            persistAuthorization: true,
            tagsSorter: 'alpha',
            operationsSorter: 'alpha',
        },
    });

    // Configuration du microservice RabbitMQ
    const rabbitmqHost = configService.get<string>('RABBITMQ_HOST', 'localhost');
    const rabbitmqPort = configService.get<number>('RABBITMQ_PORT', 5672);
    const rabbitmqUser = configService.get<string>('RABBITMQ_USERNAME', 'guest');
    const rabbitmqPass = configService.get<string>('RABBITMQ_PASSWORD', 'guest');
    const rabbitmqQueue = configService.get<string>('RABBITMQ_QUEUE', 'infrastructure_queue');

    app.connectMicroservice<MicroserviceOptions>({
        transport: Transport.RMQ,
        options: {
            urls: [`amqp://${rabbitmqUser}:${rabbitmqPass}@${rabbitmqHost}:${rabbitmqPort}`],
            queue: rabbitmqQueue,
            queueOptions: {
                durable: true,
            },
            prefetchCount: 1,
            noAck: false,
        },
    });

    // Demarrage des microservices
    await app.startAllMicroservices();
    logger.log('Microservices RabbitMQ connected');

    // Demarrage du serveur HTTP
    const port = configService.get<number>('PORT', 4003);
    await app.listen(port);

    logger.log(`Infrastructure Service running on port ${port}`);
    logger.log(`Swagger documentation available at http://localhost:${port}/api/docs`);
    logger.log(`Health check at http://localhost:${port}/api/v1/health`);
}

bootstrap().catch((error) => {
    const logger = new Logger('Bootstrap');
    logger.error('Failed to start application', error);
    process.exit(1);
});