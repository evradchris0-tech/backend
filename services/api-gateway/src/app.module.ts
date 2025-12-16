// src/app.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

import { gatewayConfig, servicesConfig } from './config';

import { ProxyModule } from './modules/proxy/proxy.module';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';

import { JwtAuthGuard, RolesGuard, CustomThrottlerGuard } from './common/guards';
import { AllExceptionsFilter, HttpExceptionFilter } from './common/filters';
import { LoggingInterceptor, TimeoutInterceptor } from './common/interceptors';
import { JwtStrategy } from './common/strategies';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [gatewayConfig, servicesConfig],
            envFilePath: ['.env.local', '.env'],
        }),

        ThrottlerModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ([{
                ttl: config.get<number>('gateway.throttle.ttl') || 60,
                limit: config.get<number>('gateway.throttle.limit') || 100,
            }]),
        }),

        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                secret: config.get<string>('gateway.jwt.secret'),
                signOptions: {
                    expiresIn: config.get<string>('gateway.jwt.expiresIn') || '1h',
                },
            }),
        }),

        ProxyModule,
        HealthModule,
        AuthModule,
        UsersModule,
    ],
    providers: [
        JwtStrategy,
        { provide: APP_GUARD, useClass: CustomThrottlerGuard },
        { provide: APP_GUARD, useClass: JwtAuthGuard },
        { provide: APP_GUARD, useClass: RolesGuard },
        { provide: APP_FILTER, useClass: AllExceptionsFilter },
        { provide: APP_FILTER, useClass: HttpExceptionFilter },
        { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
        { provide: APP_INTERCEPTOR, useClass: TimeoutInterceptor },
    ],
})
export class AppModule {}
