// src/common/filters/http-exception.filter.ts

import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);

    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const status = exception.getStatus();
        const exceptionResponse = exception.getResponse();

        let message: string;
        let error: string | undefined;

        if (typeof exceptionResponse === 'string') {
            message = exceptionResponse;
        } else {
            const resp = exceptionResponse as any;
            message = resp.message || 'Une erreur est survenue';
            error = resp.error;
        }

        const errorResponse = {
            success: false,
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
            message: Array.isArray(message) ? message.join(', ') : message,
            error,
        };

        this.logger.error(`${request.method} ${request.url} ${status} - ${errorResponse.message}`);
        response.status(status).json(errorResponse);
    }
}