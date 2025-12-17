import { SetMetadata } from '@nestjs/common';

/**
 * Decorator pour définir les rôles requis sur une route
 * Usage: @Roles('admin', 'gestionnaire')
 */
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
