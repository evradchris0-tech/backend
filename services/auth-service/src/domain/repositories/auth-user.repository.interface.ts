// src/domain/repositories/auth-user.repository.interface.ts

import { AuthUserEntity } from '../entities/auth-user.entity';

export interface IAuthUserRepository {
    findById(id: string): Promise<AuthUserEntity | null>;
    findByEmail(email: string): Promise<AuthUserEntity | null>;
    findByGoogleId(googleId: string): Promise<AuthUserEntity | null>;
    save(authUser: AuthUserEntity): Promise<AuthUserEntity>;
    update(authUser: AuthUserEntity): Promise<void>;
    delete(id: string): Promise<void>;
}