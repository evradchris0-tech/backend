// ============================================
// services/api-gateway/src/proxy/proxy.service.ts
// ============================================
import { Injectable, HttpException, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ProxyService {
    private readonly logger = new Logger(ProxyService.name);
    private readonly authServiceUrl: string;
    private readonly userServiceUrl: string;
    private readonly syncServiceUrl: string;

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {
        this.authServiceUrl = this.configService.get<string>('AUTH_SERVICE_URL') || 'http://127.0.0.1:4001';
        this.userServiceUrl = this.configService.get<string>('USER_SERVICE_URL') || 'http://127.0.0.1:4002';
        this.syncServiceUrl = this.configService.get<string>('SYNC_SERVICE_URL') || 'http://127.0.0.1:4003';

        this.logger.log(`✅ Auth Service: ${this.authServiceUrl}`);
        this.logger.log(`✅ User Service: ${this.userServiceUrl}`);
        this.logger.log(`✅ Sync Service: ${this.syncServiceUrl}`);
    }

    /**
     * Proxy une requête vers un service backend
     */
    async proxyRequest(
        service: 'auth' | 'user' | 'sync',
        method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
        path: string,
        body?: any,
        headers?: any,
    ): Promise<any> {
        const serviceUrl = this.getServiceUrl(service);
        const url = `${serviceUrl}${path}`;

        this.logger.debug(`🔀 Gateway → ${service.toUpperCase()}: ${method} ${path}`);

        try {
            const response = await firstValueFrom(
                this.httpService.request({
                    method,
                    url,
                    data: body,
                    headers: {
                        ...headers,
                        'Content-Type': 'application/json',
                    },
                    validateStatus: () => true, // Ne pas throw sur status >= 400
                }),
            );

            this.logger.debug(`✅ ${service.toUpperCase()} responded: ${response.status}`);

            // Si le service retourne une erreur (4xx, 5xx), on la propage
            if (response.status >= 400) {
                throw new HttpException(
                    response.data || { message: 'Service error' },
                    response.status,
                );
            }

            return response.data;
        } catch (error) {
            // Si c'est déjà une HttpException (du block ci-dessus), on la relance
            if (error instanceof HttpException) {
                throw error;
            }

            // Sinon, on gère les erreurs réseau/timeout
            this.handleProxyError(error, service, path);
        }
    }

    /**
     * Récupère l'URL du service selon le nom
     */
    private getServiceUrl(service: 'auth' | 'user' | 'sync'): string {
        switch (service) {
            case 'auth':
                return this.authServiceUrl;
            case 'user':
                return this.userServiceUrl;
            case 'sync':
                return this.syncServiceUrl;
            default:
                throw new Error(`Unknown service: ${service}`);
        }
    }

    /**
     * Gestion des erreurs de proxy
     */
    private handleProxyError(error: any, service: string, path: string): never {
        if (error.response) {
            // Le service a répondu avec une erreur
            const status = error.response.status;
            const data = error.response.data;

            this.logger.error(
                `❌ Proxy error to ${service}-service: ${JSON.stringify(data)}`,
            );

            // Retourner l'erreur exacte du service backend
            throw new HttpException(
                data || { message: 'Service error' },
                status,
            );
        } else if (error.request) {
            // La requête a été envoyée mais pas de réponse
            this.logger.error(
                `❌ No response from ${service}-service: ${path}`,
            );
            throw new HttpException(
                {
                    message: `${service} service is unavailable`,
                    error: 'Service Unavailable',
                },
                503,
            );
        } else {
            // Erreur lors de la configuration de la requête
            this.logger.error(`❌ Request setup error: ${error.message}`);
            throw new HttpException(
                {
                    message: 'Internal gateway error',
                    error: error.message,
                },
                500,
            );
        }
    }
}