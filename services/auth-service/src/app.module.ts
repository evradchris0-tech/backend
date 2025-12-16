// src/app.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './infrastructure/auth.module';
import { RabbitMQInfraModule } from './infrastructure/rabbitmq/rabbitmq.module';
import { TypeOrmConfigService } from './infrastructure/persistence/config/typeorm-config.service';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        TypeOrmModule.forRootAsync({
            useClass: TypeOrmConfigService,
        }),
        AuthModule,
        RabbitMQInfraModule,
    ],
})
export class AppModule {}