import { Injectable, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosRequestConfig, AxiosError } from 'axios';

@Injectable()
export class ProxyService {
    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) { }

    async forward(
        serviceName: string,
        path: string,
        method: string,
        data?: any,
        headers?: any,
    ): Promise<any> {
        const serviceUrl = this.getServiceUrl(serviceName);
        const url = `${serviceUrl}${path}`;

        // Nettoyer les headers (enlever host, content-length, etc.)
        const cleanHeaders = this.cleanHeaders(headers);

        const config: AxiosRequestConfig = {
            method: method as any,
            url,
            headers: {
                ...cleanHeaders,
                'x-forwarded-by': 'api-gateway',
            },
            data: method !== 'GET' && method !== 'HEAD' ? data : undefined,
            validateStatus: () => true, // Accepter tous les status codes
        };

        try {
            const response = await firstValueFrom(this.httpService.request(config));

            // Si erreur HTTP (4xx, 5xx), lancer une exception
            if (response.status >= 400) {
                throw new HttpException(
                    response.data?.message || response.data || 'Service error',
                    response.status,
                );
            }

            return response.data;
        } catch (error) {
            const err = error as AxiosError;
            console.error(`❌ Proxy error to ${serviceName}:`, err.message);

            if (err.response) {
                throw new HttpException(
                    err.response.data || 'Service error',
                    err.response.status,
                );
            }

            throw new HttpException(
                `Service ${serviceName} unavailable`,
                503,
            );
        }
    }

    private cleanHeaders(headers: any): any {
        const cleaned = { ...headers };

        // Supprimer les headers problématiques
        delete cleaned['host'];
        delete cleaned['content-length'];
        delete cleaned['connection'];
        delete cleaned['accept-encoding'];

        return cleaned;
    }

    private getServiceUrl(serviceName: string): string {
        const urls: Record<string, string> = {
            'auth-service': this.configService.get<string>('services.auth.url'),
            'user-service': this.configService.get<string>('services.user.url'),
        };

        return urls[serviceName];
    }
}