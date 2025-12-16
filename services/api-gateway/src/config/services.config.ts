// src/config/services.config.ts

import { registerAs } from '@nestjs/config';

export default registerAs('services', () => ({
    auth: {
        url: process.env.AUTH_SERVICE_URL || 'http://localhost:4001',
        timeout: parseInt(process.env.AUTH_SERVICE_TIMEOUT || '10000', 10),
        name: 'auth-service',
    },
    user: {
        url: process.env.USER_SERVICE_URL || 'http://localhost:4002',
        timeout: parseInt(process.env.USER_SERVICE_TIMEOUT || '10000', 10),
        name: 'user-service',
    },
    infrastructure: {
        url: process.env.INFRASTRUCTURE_SERVICE_URL || 'http://localhost:4003',
        timeout: parseInt(process.env.INFRASTRUCTURE_SERVICE_TIMEOUT || '10000', 10),
        name: 'infrastructure-service',
    },
    incident: {
        url: process.env.INCIDENT_SERVICE_URL || 'http://localhost:4004',
        timeout: parseInt(process.env.INCIDENT_SERVICE_TIMEOUT || '10000', 10),
        name: 'incident-service',
    },
    notification: {
        url: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:4005',
        timeout: parseInt(process.env.NOTIFICATION_SERVICE_TIMEOUT || '10000', 10),
        name: 'notification-service',
    },
}));
