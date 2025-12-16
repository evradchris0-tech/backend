// src/modules/proxy/proxy.service.ts

import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { AxiosRequestConfig, AxiosResponse, Method } from 'axios';
import { firstValueFrom, timeout, catchError } from 'rxjs';

export type ServiceType = 'auth' | 'user' | 'infrastructure' | 'incident' | 'notification';

export interface ProxyRequestOptions {
    service: ServiceType;
    path: string;
    method: Method;
    data?: any;
    headers?: Record<string, string>;
    params?: Record<string, any>;
}

export interface ServiceHealth {
    service: string;
    status: 'healthy' | 'unhealthy';
    responseTime?: number;
    error?: string;
}

@Injectable()
export class ProxyService {
    private readonly logger = new Logger(ProxyService.name);

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {}

    async forward<T = any>(options: ProxyRequestOptions): Promise<T> {
        const { service, path, method, data, headers, params } = options;

        const serviceConfig = this.configService.get(`services.${service}`);
        if (!serviceConfig) {
            this.logger.error(`Service "${service}" non configure`);
            throw new HttpException(
                { statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: `Service "${service}" non configure` },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }

        const url = `${serviceConfig.url}${path}`;
        const requestConfig: AxiosRequestConfig = {
            method,
            url,
            data,
            headers: { 'Content-Type': 'application/json', ...headers },
            params,
            timeout: serviceConfig.timeout,
        };

        this.logger.debug(`Proxy ${method} ${url}`);

        try {
            const response = await firstValueFrom(
                this.httpService.request<T>(requestConfig).pipe(
                    timeout(serviceConfig.timeout),
                    catchError((error) => {
                        throw this.handleProxyError(error, service, path);
                    }),
                ),
            );

            return (response as AxiosResponse<T>).data;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw this.handleProxyError(error, service, path);
        }
    }

    async checkServiceHealth(service: ServiceType): Promise<ServiceHealth> {
        const startTime = Date.now();

        try {
            const serviceConfig = this.configService.get(`services.${service}`);
            if (!serviceConfig) {
                return { service, status: 'unhealthy', error: 'Service non configure' };
            }

            await firstValueFrom(
                this.httpService.get(`${serviceConfig.url}/health`).pipe(timeout(5000)),
            );

            return { service, status: 'healthy', responseTime: Date.now() - startTime };
        } catch (error) {
            return {
                service,
                status: 'unhealthy',
                responseTime: Date.now() - startTime,
                error: (error as Error).message,
            };
        }
    }

    async checkAllServicesHealth(): Promise<ServiceHealth[]> {
        const services: ServiceType[] = ['auth', 'user'];
        return Promise.all(services.map(service => this.checkServiceHealth(service)));
    }

    private handleProxyError(error: any, service: string, path: string): HttpException {
        this.logger.error(`Proxy error [${service}] ${path}: ${error.message}`);

        if (error.response) {
            const status = error.response.status;
            const responseData = error.response.data;
            return new HttpException(
                {
                    statusCode: status,
                    message: responseData?.message || error.response.statusText,
                    error: responseData?.error,
                    service,
                    path,
                },
                status,
            );
        }

        if (error.code === 'ECONNREFUSED') {
            return new HttpException(
                { statusCode: HttpStatus.SERVICE_UNAVAILABLE, message: `Service "${service}" indisponible`, service, path },
                HttpStatus.SERVICE_UNAVAILABLE,
            );
        }

        if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED' || error.name === 'TimeoutError') {
            return new HttpException(
                { statusCode: HttpStatus.GATEWAY_TIMEOUT, message: `Timeout service "${service}"`, service, path },
                HttpStatus.GATEWAY_TIMEOUT,
            );
        }

        return new HttpException(
            { statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: `Erreur service "${service}"`, service, path },
            HttpStatus.INTERNAL_SERVER_ERROR,
        );
    }
}
