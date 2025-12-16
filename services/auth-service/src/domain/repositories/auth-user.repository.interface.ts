// src/domain/repositories/auth-user.repository.interface.ts

import { AuthUserEntity } from '../entities/auth-user.entity';

export interface IAuthUserRepository {
    findById(id: string): Promise<AuthUserEntity | null>;
    findByEmail(email: string): Promise<AuthUserEntity | null>;
    findByGoogleId(googleId: string): Promise<AuthUserEntity | null>;
    save(user: AuthUserEntity): Promise<void>;
    update(user: AuthUserEntity): Promise<void>;
}