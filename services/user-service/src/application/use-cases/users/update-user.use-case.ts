// src/application/use-cases/users/update-user.use-case.ts

import {
    Injectable,
    Inject,
    NotFoundException,
    ForbiddenException,
    ConflictException,
    BadRequestException,
} from '@nestjs/common';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { UserRole } from '../../../domain/entities/user.entity';
import { RoleHierarchy } from '../../../domain/value-objects/role-hierarchy.vo';
import { UpdateUserDto } from '../../dtos/users/update-user.dto';
import { UserResponseDto } from '../../dtos/users/user-response.dto';

@Injectable()
export class UpdateUserUseCase {
    constructor(
        @Inject('IUserRepository')
        private readonly userRepository: IUserRepository,
    ) { }

    async execute(
        userId: string,
        updateUserDto: UpdateUserDto,
        updaterUserId: string,
    ): Promise<UserResponseDto> {
        // 1. Récupérer l'utilisateur à modifier
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        // 2. Récupérer l'utilisateur qui fait la modification
        const updater = await this.userRepository.findById(updaterUserId);
        if (!updater) {
            throw new ForbiddenException('Updater user not found');
        }

        // 3. Empêcher un utilisateur de modifier son propre rôle
        if (userId === updaterUserId && updateUserDto.role) {
            throw new ForbiddenException('You cannot modify your own role');
        }

        // 4. Vérifier les permissions pour modifier le rôle
        if (updateUserDto.role) {
            if (!RoleHierarchy.canModify(updater.role, user.role)) {
                throw new ForbiddenException(
                    `You do not have permission to modify this user's role`,
                );
            }

            if (!RoleHierarchy.canCreate(updater.role, updateUserDto.role)) {
                throw new ForbiddenException(
                    `You do not have permission to assign role ${updateUserDto.role}`,
                );
            }

            user.changeRole(updateUserDto.role);
        }

        // 5. Vérifier l'unicité de l'email si changement
        if (updateUserDto.email && updateUserDto.email !== user.email) {
            const existingUser = await this.userRepository.findByEmail(updateUserDto.email);
            if (existingUser) {
                throw new ConflictException('Email already exists');
            }
            // Note: Changement d'email nécessiterait une nouvelle vérification
            // Pour l'instant, on le permet uniquement si l'admin le fait explicitement
        }

        // 6. Mettre à jour les informations personnelles
        if (updateUserDto.firstName || updateUserDto.lastName) {
            user.updateProfile(
                updateUserDto.firstName || user.firstName,
                updateUserDto.lastName || user.lastName,
            );
        }

        // 7. Mettre à jour le statut si fourni
        if (updateUserDto.status) {
            if (updateUserDto.status === 'ACTIVE') {
                user.activate();
            } else if (updateUserDto.status === 'INACTIVE') {
                user.deactivate();
            }
        }

        // 8. Gérer le changement de chambre pour OCCUPANT
        if (user.role === UserRole.OCCUPANT) {
            if (updateUserDto.roomId && updateUserDto.roomNumber && updateUserDto.academicSessionId) {
                user.assignToRoom(
                    updateUserDto.roomId,
                    updateUserDto.roomNumber,
                    updateUserDto.academicSessionId,
                );
            }
        } else {
            // Si ce n'est pas un OCCUPANT, interdire l'assignation de chambre
            if (updateUserDto.roomId || updateUserDto.roomNumber) {
                throw new BadRequestException('Only OCCUPANT users can be assigned to rooms');
            }
        }

        // 9. Sauvegarder les modifications
        await this.userRepository.update(user);

        // 10. Retourner le DTO mis à jour
        return new UserResponseDto({
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            fullName: user.fullName,
            role: user.role,
            status: user.status,
            emailVerified: user.emailVerified,
            googleId: user.googleId,
            profilePicture: user.profilePicture,
            username: user.username,
            currentRoomId: user.currentRoomId,
            currentAcademicSessionId: user.currentAcademicSessionId,
            lastLoginAt: user.lastLoginAt,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        });
    }
}