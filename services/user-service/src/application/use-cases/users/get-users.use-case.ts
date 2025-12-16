// src/application/use-cases/users/get-users.use-case.ts

import { Injectable, Inject } from '@nestjs/common';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { PaginatedUsersQueryDto, PaginatedUsersResponseDto } from '../../dtos/users/paginated-users.dto';
import { UserResponseDto } from '../../dtos/users/user-response.dto';

@Injectable()
export class GetUsersUseCase {
    constructor(
        @Inject('IUserRepository')
        private readonly userRepository: IUserRepository,
    ) { }

    async execute(queryDto: PaginatedUsersQueryDto): Promise<PaginatedUsersResponseDto> {
        const page = queryDto.page || 1;
        const limit = queryDto.limit || 10;
        const skip = (page - 1) * limit;

        const filters = {
            role: queryDto.role,
            status: queryDto.status,
            search: queryDto.search,
        };

        // Récupérer les utilisateurs paginés avec filtres
        const { users, total } = await this.userRepository.findAllPaginated(
            filters,
            { skip, take: limit },
        );

        // Mapper en DTOs
        const userDtos = users.map(
            (user) =>
                new UserResponseDto({
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
                }),
        );

        return new PaginatedUsersResponseDto(userDtos, total, page, limit);
    }
}