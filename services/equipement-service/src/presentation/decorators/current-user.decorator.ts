import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorator pour récupérer l'utilisateur courant depuis la requête
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);
