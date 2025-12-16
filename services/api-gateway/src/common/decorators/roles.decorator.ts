// src/common/decorators/roles.decorator.ts

import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

export type UserRole = 'ADMINISTRATEUR' | 'SUPERVISEUR' | 'AGENT_TERRAIN' | 'OCCUPANT';

export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
