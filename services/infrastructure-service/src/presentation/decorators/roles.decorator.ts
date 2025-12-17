// src/presentation/decorators/roles.decorator.ts

import { SetMetadata } from '@nestjs/common';

/**
 * Cle de metadata pour les roles
 */
export const ROLES_KEY = 'roles';

/**
 * Decorateur pour definir les roles requis pour acceder a une route
 * @param roles Liste des roles autorises
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);