import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.enableCors({
        origin: true,
        credentials: true,
    });
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );
    const configService = app.get(ConfigService);
    const port = configService.get<number>('port') || process.env.PORT || 4000;
    const host = process.env.HOST || '0.0.0.0';

    await app.listen(port, host);
    console.log(`🚀 API Gateway running on http://${host}:${port}`);
}

bootstrap();
