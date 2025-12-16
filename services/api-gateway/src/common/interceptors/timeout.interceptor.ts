// src/common/interceptors/timeout.interceptor.ts

import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    RequestTimeoutException,
} from '@nestjs/common';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
    private readonly timeoutMs: number;

    constructor(private readonly configService: ConfigService) {
        this.timeoutMs = this.configService.get<number>('gateway.timeout') || 30000;
    }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            timeout(this.timeoutMs),
            catchError((err) => {
                if (err instanceof TimeoutError) {
                    return throwError(() => new RequestTimeoutException(
                        `La requete a depasse le delai maximum de ${this.timeoutMs / 1000} secondes`,
                    ));
                }
                return throwError(() => err);
            }),
        );
    }
}
