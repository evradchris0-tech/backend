import { Module } from '@nestjs/common';
import { RedisModule } from '@nestjs-modules/ioredis';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheService } from './cache.service';
import { CacheInvalidationListener } from './cache-invalidation.listener';

@Module({
    imports: [
        RedisModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: 'single',
                url: `redis://${configService.get('redis.host')}:${configService.get('redis.port')}`,
            }),
        }),
    ],
    providers: [CacheService, CacheInvalidationListener],
    exports: [CacheService],
})
export class CacheModule { }