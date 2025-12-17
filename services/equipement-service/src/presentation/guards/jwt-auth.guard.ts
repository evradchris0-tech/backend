import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

/**
 * Guard JWT - À implémenter avec la stratégie d'authentification
 * Pour l'instant, version simplifiée
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Vérifier si la route est publique
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Token d\'authentification manquant');
    }

    // TODO: Implémenter validation JWT
    // const token = authHeader.replace('Bearer ', '');
    // Valider le token et extraire l'utilisateur

    // Pour l'instant, on simule un utilisateur
    request.user = {
      id: 'user-id',
      email: 'user@example.com',
    };

    return true;
  }
}
