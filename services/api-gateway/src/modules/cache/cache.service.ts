import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CacheService {
    constructor(
        @InjectRedis() private readonly redis: Redis,
        private readonly configService: ConfigService,
    ) { }

    async get<T>(key: string): Promise<T | null> {
        const value = await this.redis.get(key);
        return value ? JSON.parse(value) : null;
    }

    async set(key: string, value: any, ttl?: number): Promise<void> {
        const defaultTtl = this.configService.get<number>('cache.ttl.default');
        const finalTtl = ttl || defaultTtl;
        await this.redis.setex(key, finalTtl, JSON.stringify(value));
    }

    async del(pattern: string): Promise<void> {
        const keys = await this.redis.keys(pattern);
        if (keys.length > 0) {
            await this.redis.del(...keys);
        }
    }

    async invalidateUser(userId: string): Promise<void> {
        await this.del(`user:${userId}*`);
        await this.del(`users:*`);
    }

    generateKey(method: string, path: string, query?: any): string {
        const queryString = query ? JSON.stringify(query) : '';
        return `${method}:${path}:${queryString}`;
    }
}