// ============================================
// services/api-gateway/src/proxy/proxy.controller.ts
// ============================================
import {
    Controller,
    All,
    Req,
    Res,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ProxyService } from './proxy.service';

@Controller()
export class ProxyController {
    private readonly logger = new Logger(ProxyController.name);

    constructor(private readonly proxyService: ProxyService) { }

    /**
 * Proxy toutes les requêtes /auth/* vers auth-service
 */
    @All('auth/*')
    async proxyAuth(@Req() req: Request, @Res() res: Response) {
        try {
            const path = req.url;
            const method = req.method as 'GET' | 'POST' | 'PATCH' | 'DELETE';
            const body = req.body;
            const headers = req.headers;

            this.logger.debug(`🔀 Gateway → Auth: ${method} ${path}`);

            const result = await this.proxyService.proxyRequest(
                'auth',
                method,
                path,
                body,
                headers,
            );

            // Retourner directement le résultat avec status 200
            // (les erreurs sont gérées dans le catch)
            return res.status(HttpStatus.OK).json(result);
        } catch (error) {
            this.logger.error(`❌ Proxy error to auth-service: ${error.message}`);

            // Retourner le status code de l'erreur
            const statusCode = error.getStatus ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
            const errorResponse = error.getResponse ? error.getResponse() : {
                message: error.message || 'Gateway error',
                error: 'Proxy Error',
                statusCode
            };

            return res.status(statusCode).json(errorResponse);
        }
    }

    /**
     * Proxy toutes les requêtes /users/* vers user-service
     */
    @All('users/*')
    async proxyUsers(@Req() req: Request, @Res() res: Response) {
        try {
            const path = req.url;
            const method = req.method as 'GET' | 'POST' | 'PATCH' | 'DELETE';
            const body = req.body;
            const headers = req.headers;

            this.logger.debug(`🔀 Gateway → User: ${method} ${path}`);

            const result = await this.proxyService.proxyRequest(
                'user',
                method,
                path,
                body,
                headers,
            );

            // Retourner directement le résultat avec status 200
            return res.status(HttpStatus.OK).json(result);
        } catch (error) {
            this.logger.error(`❌ Proxy error to user-service: ${error.message}`);

            // Retourner le status code de l'erreur
            const statusCode = error.getStatus ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
            const errorResponse = error.getResponse ? error.getResponse() : {
                message: error.message || 'Gateway error',
                error: 'Proxy Error',
                statusCode
            };

            return res.status(statusCode).json(errorResponse);
        }
    }

    /**
     * Proxy toutes les requêtes /sync/* ou /history/* vers sync-service
     */
    @All('sync/*')
    async proxySync(@Req() req: Request, @Res() res: Response) {
        try {
            const path = req.url;
            const method = req.method as 'GET' | 'POST' | 'PATCH' | 'DELETE';
            const body = req.body;
            const headers = req.headers;

            this.logger.debug(`Proxying ${method} ${path} to sync-service`);

            const result = await this.proxyService.proxyRequest(
                'sync',
                method,
                path,
                body,
                headers,
            );

            const statusCode = result?.statusCode || HttpStatus.OK;
            return res.status(statusCode).json(result);
        } catch (error) {
            this.logger.error(`❌ Proxy error to sync-service: ${error.message}`);

            const statusCode = error.status || error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR;
            const errorResponse = error.response || {
                message: error.message || 'Gateway error',
                error: 'Proxy Error',
                statusCode
            };

            return res.status(statusCode).json(errorResponse);
        }
    }
}