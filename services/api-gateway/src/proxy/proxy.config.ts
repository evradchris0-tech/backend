export const proxyConfig = {
    '/auth': {
        target: 'http://127.0.0.1:4001',
        pathRewrite: { '^/auth': '/auth' },
    },
    '/users': {
        target: 'http://127.0.0.1:4002',
        pathRewrite: { '^/users': '/users' },
    },
    '/sync': {
        target: 'http://127.0.0.1:4003',
        pathRewrite: { '^/sync': '/history' },
    },
};
