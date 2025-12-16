// src/common/decorators/public.decorator.ts

import { SetMetadata } from '@nestjs/common';

/**
 * Decorateur @Public() pour marquer une route comme publique
 * (pas besoin d'authentification JWT)
 */
export const Public = () => SetMetadata('isPublic', true);