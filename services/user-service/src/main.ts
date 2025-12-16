// src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    const configService = app.get(ConfigService);
    const port = configService.get<number>('PORT', 4002);
    const host = configService.get<string>('HOST', 'localhost');
    // Global validation pipe
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    // Enable CORS
    app.enableCors({
        origin: configService.get<string>('FRONTEND_URL', 'http://localhost:4000'),
        credentials: true,
    });

    await app.listen(port, host);
    console.log(`🚀 User Service running on http://${host}:${port}`);
}

bootstrap();