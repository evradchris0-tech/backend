// src/common/guards/roles.guard.ts

import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, UserRole } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
    private readonly logger = new Logger(RolesGuard.name);

    constructor(private readonly reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user) {
            throw new ForbiddenException({
                statusCode: 403,
                message: 'Authentification requise',
                error: 'NO_USER',
            });
        }

        if (!user.role) {
            throw new ForbiddenException({
                statusCode: 403,
                message: 'Role utilisateur non defini',
                error: 'NO_ROLE',
            });
        }

        const hasRole = requiredRoles.some((role) => user.role === role);

        if (!hasRole) {
            this.logger.warn(
                `User ${user.userId} with role ${user.role} denied. Required: ${requiredRoles.join(', ')}`,
            );
            throw new ForbiddenException({
                statusCode: 403,
                message: `Acces refuse. Roles autorises: ${requiredRoles.join(', ')}`,
                error: 'INSUFFICIENT_PERMISSIONS',
            });
        }

        return true;
    }
}
