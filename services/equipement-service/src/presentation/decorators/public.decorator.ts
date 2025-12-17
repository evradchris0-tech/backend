import { SetMetadata } from '@nestjs/common';

/**
 * Decorator pour marquer une route comme publique (sans authentification)
 * Usage: @Public()
 */
export const Public = () => SetMetadata('isPublic', true);
