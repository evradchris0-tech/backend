// src/presentation/filters/http-exception.filter.ts

import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Interface pour la reponse d'erreur standardisee
 */
interface ErrorResponse {
    success: false;
    statusCode: number;
    message: string;
    error: string;
    timestamp: string;
    path: string;
    details?: unknown;
}

/**
 * Filtre global pour la gestion des exceptions HTTP
 * Standardise le format des reponses d'erreur
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let status: number;
        let message: string;
        let error: string;
        let details: unknown = undefined;

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();

            if (typeof exceptionResponse === 'string') {
                message = exceptionResponse;
                error = HttpStatus[status] || 'Error';
            } else if (typeof exceptionResponse === 'object') {
                const responseObj = exceptionResponse as Record<string, unknown>;
                message = (responseObj.message as string) || exception.message;
                error = (responseObj.error as string) || HttpStatus[status] || 'Error';
                
                // Si message est un tableau (validation errors)
                if (Array.isArray(responseObj.message)) {
                    details = responseObj.message;
                    message = 'Erreurs de validation';
                }
            } else {
                message = exception.message;
                error = HttpStatus[status] || 'Error';
            }
        } else if (exception instanceof Error) {
            status = HttpStatus.INTERNAL_SERVER_ERROR;
            message = 'Une erreur interne est survenue';
            error = 'Internal Server Error';

            // En mode developpement, inclure plus de details
            if (process.env.NODE_ENV === 'development') {
                details = {
                    name: exception.name,
                    message: exception.message,
                    stack: exception.stack?.split('\n').slice(0, 5),
                };
            }

            this.logger.error(
                `Unhandled exception: ${exception.message}`,
                exception.stack,
            );
        } else {
            status = HttpStatus.INTERNAL_SERVER_ERROR;
            message = 'Une erreur inconnue est survenue';
            error = 'Internal Server Error';

            this.logger.error('Unknown exception type', exception);
        }

        const errorResponse: ErrorResponse = {
            success: false,
            statusCode: status,
            message,
            error,
            timestamp: new Date().toISOString(),
            path: request.url,
        };

        if (details) {
            errorResponse.details = details;
        }

        // Log de l'erreur
        this.logger.warn(
            `${request.method} ${request.url} - ${status} - ${message}`,
        );

        response.status(status).json(errorResponse);
    }
}