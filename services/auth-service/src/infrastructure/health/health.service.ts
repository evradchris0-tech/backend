// src/infrastructure/health/health.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export interface HealthStatus {
    status: 'ok' | 'degraded' | 'down';
    service: string;
    timestamp: string;
    version: string;
    checks: {
        database: {
            status: 'ok' | 'down';
            latencyMs?: number;
            error?: string;
        };
    };
}

@Injectable()
export class HealthService {
    private readonly logger = new Logger(HealthService.name);

    constructor(
        @InjectDataSource()
        private readonly dataSource: DataSource,
    ) {}

    async checkHealth(): Promise<HealthStatus> {
        const timestamp = new Date().toISOString();
        const dbCheck = await this.checkDatabase();

        const overallStatus = dbCheck.status === 'ok' ? 'ok' : 'down';

        return {
            status: overallStatus,
            service: 'auth-service',
            timestamp,
            version: process.env.npm_package_version || '1.0.0',
            checks: {
                database: dbCheck,
            },
        };
    }

    private async checkDatabase(): Promise<{
        status: 'ok' | 'down';
        latencyMs?: number;
        error?: string;
    }> {
        const startTime = Date.now();

        try {
            if (!this.dataSource.isInitialized) {
                return {
                    status: 'down',
                    error: 'Database connection not initialized',
                };
            }

            await this.dataSource.query('SELECT 1');

            const latencyMs = Date.now() - startTime;

            return {
                status: 'ok',
                latencyMs,
            };
        } catch (error) {
            this.logger.error('Database health check failed', error.message);

            return {
                status: 'down',
                latencyMs: Date.now() - startTime,
                error: error.message,
            };
        }
    }
}