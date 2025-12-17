// src/presentation/decorators/current-user.decorator.ts

import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Interface pour les informations utilisateur extraites du token
 */
export interface CurrentUserPayload {
    userId: string;
    email: string;
    role: string;
}

/**
 * Decorateur pour extraire les informations de l'utilisateur courant
 * depuis la requete (injectees par le JwtAuthGuard)
 */
export const CurrentUser = createParamDecorator(
    (data: keyof CurrentUserPayload | undefined, ctx: ExecutionContext): CurrentUserPayload | string | undefined => {
        const request = ctx.switchToHttp().getRequest();
        const user = request.user as CurrentUserPayload | undefined;

        if (!user) {
            return undefined;
        }

        // Si une propriete specifique est demandee, la retourner
        if (data) {
            return user[data];
        }

        // Sinon retourner l'objet complet
        return user;
    },
);