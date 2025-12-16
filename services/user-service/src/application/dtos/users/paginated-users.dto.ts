// src/application/dtos/users/paginated-users.dto.ts

import { IsOptional, IsEnum, IsInt, Min, Max, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { UserRole, UserStatus } from '../../../domain/entities/user.entity';

export class PaginatedUsersQueryDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'Page must be an integer' })
    @Min(1, { message: 'Page must be at least 1' })
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'Limit must be an integer' })
    @Min(1, { message: 'Limit must be at least 1' })
    @Max(100, { message: 'Limit cannot exceed 100' })
    limit?: number = 10;

    @IsOptional()
    @IsEnum(UserRole, { message: 'Invalid role filter' })
    role?: UserRole;

    @IsOptional()
    @IsEnum(UserStatus, { message: 'Invalid status filter' })
    status?: UserStatus;

    @IsOptional()
    @IsString({ message: 'Search must be a string' })
    search?: string; // Recherche sur email, firstName, lastName, username
}

export class PaginatedUsersResponseDto {
    data: any[]; // UserResponseDto[]
    total: number;
    page: number;
    limit: number;
    totalPages: number;

    constructor(data: any[], total: number, page: number, limit: number) {
        this.data = data;
        this.total = total;
        this.page = page;
        this.limit = limit;
        this.totalPages = Math.ceil(total / limit);
    }
}