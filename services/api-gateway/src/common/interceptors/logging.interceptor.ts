// src/common/interceptors/logging.interceptor.ts

import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger('HTTP');

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const ctx = context.switchToHttp();
        const request = ctx.getRequest<Request>();
        const response = ctx.getResponse<Response>();

        const { method, originalUrl, ip } = request;
        const userId = (request as any).user?.userId || 'anonymous';
        const startTime = Date.now();

        return next.handle().pipe(
            tap({
                next: () => {
                    const duration = Date.now() - startTime;
                    this.logger.log(
                        `${method} ${originalUrl} ${response.statusCode} ${duration}ms - user:${userId} - ${ip}`,
                    );
                },
                error: (error) => {
                    const duration = Date.now() - startTime;
                    const statusCode = error.status || 500;
                    this.logger.error(
                        `${method} ${originalUrl} ${statusCode} ${duration}ms - user:${userId} - ${ip} - ${error.message}`,
                    );
                },
            }),
        );
    }
}
