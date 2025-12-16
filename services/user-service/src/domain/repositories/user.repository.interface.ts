// src/domain/repositories/user.repository.interface.ts

import { promises } from 'dns';
import { UserEntity } from '../entities/user.entity';

export interface IUserRepository {
    findById(id: string): Promise<UserEntity | null>;
    findByEmail(email: string): Promise<UserEntity | null>;
    save(user: UserEntity): Promise<UserEntity>;
    update(user: UserEntity): Promise<UserEntity>;
    delete(id: string): Promise<void>;
    findAllPaginated(
        filters: {
            role?: string;
            status?: string;
            search?: string;
        },
        pagination: {
            skip: number;
            take: number;
        },
    ): Promise<{ users: UserEntity[]; total: number }>;
}