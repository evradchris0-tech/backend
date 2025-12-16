// src/application/use-cases/users/assign-room.use-case.ts

import {
    Injectable,
    Inject,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { UserRole } from '../../../domain/entities/user.entity';
import { AssignRoomDto } from '../../dtos/users/assign-room.dto';
import { UserResponseDto } from '../../dtos/users/user-response.dto';

@Injectable()
export class AssignRoomUseCase {
    constructor(
        @Inject('IUserRepository')
        private readonly userRepository: IUserRepository,
    ) { }

    async execute(userId: string, assignRoomDto: AssignRoomDto): Promise<UserResponseDto> {
        // 1. Récupérer l'utilisateur
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        // 2. Vérifier que c'est bien un OCCUPANT
        if (user.role !== UserRole.OCCUPANT) {
            throw new BadRequestException('Only OCCUPANT users can be assigned to rooms');
        }

        // 3. Assigner à la chambre (génère automatiquement le username)
        user.assignToRoom(
            assignRoomDto.roomId,
            assignRoomDto.roomNumber,
            assignRoomDto.academicSessionId,
        );

        // 4. Sauvegarder
        await this.userRepository.update(user);

        // 5. Retourner le DTO
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