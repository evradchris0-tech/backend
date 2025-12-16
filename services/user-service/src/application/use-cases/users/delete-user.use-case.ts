// src/application/use-cases/users/delete-user.use-case.ts

import {
    Injectable,
    Inject,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
} from '@nestjs/common';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { UserRole } from '../../../domain/entities/user.entity';
import { RoleHierarchy } from '../../../domain/value-objects/role-hierarchy.vo';

@Injectable()
export class DeleteUserUseCase {
    constructor(
        @Inject('IUserRepository')
        private readonly userRepository: IUserRepository,
    ) { }

    async execute(userId: string, deleterUserId: string): Promise<void> {
        // 1. Vérifier que l'utilisateur à supprimer existe
        const userToDelete = await this.userRepository.findById(userId);
        if (!userToDelete) {
            throw new NotFoundException('User not found');
        }

        // 2. Vérifier que l'utilisateur ne tente pas de se supprimer lui-même
        if (userId === deleterUserId) {
            throw new BadRequestException('You cannot delete your own account');
        }

        // 3. Récupérer l'utilisateur qui effectue la suppression
        const deleter = await this.userRepository.findById(deleterUserId);
        if (!deleter) {
            throw new NotFoundException('Deleter user not found');
        }

        // 4. Vérifier les permissions hiérarchiques
        if (!RoleHierarchy.canManage(deleter.role, userToDelete.role)) {
            throw new ForbiddenException(
                `You do not have permission to delete users with role ${userToDelete.role}`,
            );
        }

        // 5. Marquer comme INACTIF au lieu de supprimer physiquement (soft delete)
        userToDelete.deactivate();

        // 6. Sauvegarder les modifications
        await this.userRepository.update(userToDelete);

        // Note: Les sessions seront nettoyées par le auth-service lors de la prochaine tentative de connexion
    }
}