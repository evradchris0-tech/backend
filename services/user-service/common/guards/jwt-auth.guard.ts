// common/guards/jwt-auth.guard.ts

import {
    Injectable,
    ExecutionContext,
    UnauthorizedException,
    Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

/**
 * Guard JWT pour proteger les routes du User-Service
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    private readonly logger = new Logger(JwtAuthGuard.name);

    constructor(private readonly reflector: Reflector) {
        super();
    }

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        // Verifier si la route est marquee @Public()
        const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isPublic) {
            return true;
        }

        return super.canActivate(context);
    }

    handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
        if (err || !user) {
            const request = context.switchToHttp().getRequest();
            
            if (info?.name === 'TokenExpiredError') {
                this.logger.warn(`Token expired for request to ${request.url}`);
                throw new UnauthorizedException('Token has expired');
            }

            if (info?.name === 'JsonWebTokenError') {
                this.logger.warn('Invalid token format');
                throw new UnauthorizedException('Invalid token format');
            }

            this.logger.error(`Authentication failed: ${info?.message || err?.message}`);
            throw err || new UnauthorizedException('Authentication required');
        }

        return user;
    }
}