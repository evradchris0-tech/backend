// src/config/gateway.config.ts

import { registerAs } from '@nestjs/config';

export default registerAs('gateway', () => ({
    port: parseInt(process.env.PORT || '4000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    globalPrefix: process.env.API_PREFIX || 'api',
    apiVersion: process.env.API_VERSION || 'v1',

    jwt: {
        secret: process.env.JWT_SECRET || 'immo360-secret-key-change-in-production',
        expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    },

    throttle: {
        ttl: parseInt(process.env.THROTTLE_TTL || '60', 10),
        limit: parseInt(process.env.THROTTLE_LIMIT || '100', 10),
    },

    timeout: parseInt(process.env.REQUEST_TIMEOUT || '30000', 10),

    cors: {
        enabled: process.env.CORS_ENABLED !== 'false',
        origins: process.env.CORS_ORIGINS?.split(',') || [
            'http://localhost:3000',
            'http://localhost:5173',
            'https://harmonious-nasturtium-d517dd.netlify.app',
        ],
    },

    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
    },
}));
