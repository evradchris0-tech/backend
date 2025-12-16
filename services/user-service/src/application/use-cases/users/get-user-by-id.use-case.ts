// src/application/use-cases/users/get-user-by-id.use-case.ts

import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { UserResponseDto } from '../../dtos/users/user-response.dto';

@Injectable()
export class GetUserByIdUseCase {
    constructor(
        @Inject('IUserRepository')
        private readonly userRepository: IUserRepository,
    ) { }

    async execute(userId: string): Promise<UserResponseDto> {
        const user = await this.userRepository.findById(userId);

        if (!user) {
            throw new NotFoundException('User not found');
        }

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