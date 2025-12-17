import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { getRabbitMQConfig } from './infrastructure/config';
import {
  HttpExceptionFilter,
  AllExceptionsFilter,
} from './presentation/filters';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // Créer l'application NestJS
  const app = await NestFactory.create(AppModule);

  // Configuration
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3004);
  const globalPrefix = configService.get<string>('API_PREFIX', 'api');

  // Prefix global
  app.setGlobalPrefix(globalPrefix);

  // Validation globale
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

  // Exception filters
  app.useGlobalFilters(new AllExceptionsFilter(), new HttpExceptionFilter());

  // CORS
  app.enableCors({
    origin: configService.get<string>('CORS_ORIGIN', '*'),
    credentials: true,
  });

  // Swagger Documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Immo360 - Équipement Service API')
    .setDescription(
      'API de gestion des équipements, stock matériel, et affectations',
    )
    .setVersion('1.0')
    .addTag('Équipements', 'Gestion des équipements')
    .addTag('Catégories', 'Gestion des catégories d\'équipements')
    .addTag('Stock', 'Gestion du stock')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`${globalPrefix}/docs`, app, document);

  // RabbitMQ Microservice (optionnel - pour communication inter-services)
  const rabbitMQEnabled = configService.get<boolean>(
    'RABBITMQ_ENABLED',
    true,
  );

  if (rabbitMQEnabled) {
    app.connectMicroservice<MicroserviceOptions>(
      getRabbitMQConfig(configService),
    );
    await app.startAllMicroservices();
    logger.log('✅ RabbitMQ Microservice started');
  }

  // Démarrer le serveur HTTP
  await app.listen(port);

  logger.log(`🚀 Equipement Service is running on: http://localhost:${port}/${globalPrefix}`);
  logger.log(`📚 Swagger documentation: http://localhost:${port}/${globalPrefix}/docs`);
}

bootstrap();
