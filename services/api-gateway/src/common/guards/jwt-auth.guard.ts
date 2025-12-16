// src/common/guards/jwt-auth.guard.ts

import {
    Injectable,
    ExecutionContext,
    UnauthorizedException,
    Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    private readonly logger = new Logger(JwtAuthGuard.name);

    constructor(private readonly reflector: Reflector) {
        super();
    }

    canActivate(context: ExecutionContext) {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isPublic) {
            return true;
        }

        return super.canActivate(context);
    }

    handleRequest<TUser = any>(
        err: any,
        user: TUser,
        info: any,
        context: ExecutionContext,
    ): TUser {
        const request = context.switchToHttp().getRequest();

        if (err) {
            this.logger.warn(`Auth error: ${err.message}`);
            throw err;
        }

        if (info?.name === 'TokenExpiredError') {
            throw new UnauthorizedException({
                statusCode: 401,
                message: 'Token expire',
                error: 'TOKEN_EXPIRED',
            });
        }

        if (info?.name === 'JsonWebTokenError') {
            throw new UnauthorizedException({
                statusCode: 401,
                message: 'Token invalide',
                error: 'INVALID_TOKEN',
            });
        }

        if (!user) {
            const message = info?.message || 'Authentification requise';
            throw new UnauthorizedException({
                statusCode: 401,
                message,
                error: 'UNAUTHORIZED',
            });
        }

        return user;
    }
}
