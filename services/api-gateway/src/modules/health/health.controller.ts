// src/modules/health/health.controller.ts

import { Controller, Get } from '@nestjs/common';
import { Public } from '../../common/decorators';
import { ProxyService, ServiceHealth } from '../proxy/proxy.service';

interface GatewayHealth {
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: string;
    uptime: number;
    version: string;
    services: ServiceHealth[];
}

@Controller('health')
export class HealthController {
    private readonly startTime = Date.now();
    private readonly version = process.env.npm_package_version || '1.0.0';

    constructor(private readonly proxyService: ProxyService) {}

    @Public()
    @Get()
    async check(): Promise<{ status: string; timestamp: string }> {
        return { status: 'ok', timestamp: new Date().toISOString() };
    }

    @Public()
    @Get('detailed')
    async checkDetailed(): Promise<GatewayHealth> {
        const healthChecks = await this.proxyService.checkAllServicesHealth();
        const healthyCount = healthChecks.filter(h => h.status === 'healthy').length;
        const totalCount = healthChecks.length;

        let status: 'healthy' | 'degraded' | 'unhealthy';
        if (healthyCount === totalCount) {
            status = 'healthy';
        } else if (healthyCount === 0) {
            status = 'unhealthy';
        } else {
            status = 'degraded';
        }

        return {
            status,
            timestamp: new Date().toISOString(),
            uptime: Math.floor((Date.now() - this.startTime) / 1000),
            version: this.version,
            services: healthChecks,
        };
    }

    @Public()
    @Get('ready')
    async ready(): Promise<{ ready: boolean; timestamp: string }> {
        const authHealth = await this.proxyService.checkServiceHealth('auth');
        return { ready: authHealth.status === 'healthy', timestamp: new Date().toISOString() };
    }

    @Public()
    @Get('live')
    live(): { alive: boolean; timestamp: string } {
        return { alive: true, timestamp: new Date().toISOString() };
    }
}
