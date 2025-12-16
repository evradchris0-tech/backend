export default () => ({
    port: parseInt(process.env.PORT, 10) || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',

    jwt: {
        secret: process.env.JWT_SECRET,
    },

    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    },

    rabbitmq: {
        url: process.env.RABBITMQ_URL || 'amqp://immo360:immo360@localhost:5672',
    },

    services: {
        auth: {
            url: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
        },
        user: {
            url: process.env.USER_SERVICE_URL || 'http://localhost:3002',
        },
    },

    cache: {
        ttl: {
            userById: 300,      // 5 minutes
            usersList: 60,      // 1 minute
            authMe: 600,        // 10 minutes
            default: 180,       // 3 minutes
        },
    },
});