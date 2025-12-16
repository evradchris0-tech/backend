import { Controller, All, Req, UseGuards, Headers, Query, Body } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { ProxyService } from './proxy.service';
import { CacheService } from '../cache/cache.service';
import { ConfigService } from '@nestjs/config';

@Controller()
export class ProxyController {
    constructor(
        private readonly proxyService: ProxyService,
        private readonly cacheService: CacheService,
        private readonly configService: ConfigService,
    ) { }

    @Public()
    @All('auth/*')
    async proxyAuth(
        @Req() req: Request,
        @Body() body: any,
        @Headers() headers: any,
    ) {
        const path = req.path;

        console.log(`🔀 Gateway → Auth: ${req.method} ${path}`);

        const result = await this.proxyService.forward(
            'auth-service',
            path,
            req.method,
            body,
            headers,
        );

        console.log(`✅ Gateway ← Auth: Success`);

        return result;
    }

    @All('users*')
    @UseGuards(JwtAuthGuard)
    async proxyUsers(
        @Req() req: Request,
        @Body() body: any,
        @Headers() headers: any,
        @Query() query: any,
    ) {
        const path = req.path;
        const cacheKey = this.cacheService.generateKey(req.method, path, query);

        // Cache GET uniquement
        if (req.method === 'GET') {
            const cached = await this.cacheService.get(cacheKey);
            if (cached) {
                console.log(`✅ Cache HIT: ${cacheKey}`);
                return cached;
            }
            console.log(`❌ Cache MISS: ${cacheKey}`);
        }

        console.log(`🔀 Gateway → User: ${req.method} ${path}`);

        const result = await this.proxyService.forward(
            'user-service',
            path,
            req.method,
            body,
            headers,
        );

        console.log(`✅ Gateway ← User: Success`);

        // Mettre en cache si GET
        if (req.method === 'GET') {
            const ttl = this.getTtlForPath(path);
            await this.cacheService.set(cacheKey, result, ttl);
            console.log(`📝 Cache SET: ${cacheKey} (TTL: ${ttl}s)`);
        }

        return result;
    }

    private getTtlForPath(path: string): number {
        if (path.match(/^\/users\/[a-f0-9-]+$/)) {
            return this.configService.get<number>('cache.ttl.userById');
        }
        if (path.startsWith('/users')) {
            return this.configService.get<number>('cache.ttl.usersList');
        }
        return this.configService.get<number>('cache.ttl.default');
    }
}