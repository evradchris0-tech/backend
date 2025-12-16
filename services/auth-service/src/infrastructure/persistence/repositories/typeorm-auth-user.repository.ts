// src/infrastructure/persistence/repositories/typeorm-auth-user.repository.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IAuthUserRepository } from '../../../domain/repositories/auth-user.repository.interface';
import { AuthUserEntity, AuthUserStatus } from '../../../domain/entities/auth-user.entity';
import { AuthUserSchema } from '../schemas/auth-user.schema';

@Injectable()
export class TypeOrmAuthUserRepository implements IAuthUserRepository {
    constructor(
        @InjectRepository(AuthUserSchema)
        private readonly authUserRepository: Repository<AuthUserSchema>,
    ) {}

    async findById(id: string): Promise<AuthUserEntity | null> {
        const schema = await this.authUserRepository.findOne({ where: { id } });
        return schema ? this.toDomain(schema) : null;
    }

    async findByEmail(email: string): Promise<AuthUserEntity | null> {
        const schema = await this.authUserRepository.findOne({ where: { email } });
        return schema ? this.toDomain(schema) : null;
    }

    async findByGoogleId(googleId: string): Promise<AuthUserEntity | null> {
        const schema = await this.authUserRepository.findOne({ where: { googleId } });
        return schema ? this.toDomain(schema) : null;
    }
    async save(authUser: AuthUserEntity): Promise<AuthUserEntity> {
        const schema = this.toSchema(authUser);
        const savedSchema = await this.authUserRepository.save(schema);
        return this.toDomain(savedSchema);
    }

    async update(authUser: AuthUserEntity): Promise<void> {
        const schema = this.toSchema(authUser);
        await this.authUserRepository.save(schema);
    }

    async delete(id: string): Promise<void> {
        await this.authUserRepository.delete(id);
    }

    private toDomain(schema: AuthUserSchema): AuthUserEntity {
        return new AuthUserEntity(
            schema.id,
            schema.email,
            schema.passwordEncrypted,
            schema.status as AuthUserStatus,
            schema.emailVerified,
            schema.failedLoginAttempts,
            schema.lastLoginAt,
            schema.lockedUntil,
            schema.googleId,
            schema.role, // ✅ INCLURE LE RÔLE
        );
    }

    private toSchema(entity: AuthUserEntity): AuthUserSchema {
        const schema = new AuthUserSchema();
        schema.id = entity.id;
        schema.email = entity.email;
        schema.passwordEncrypted = entity.passwordEncrypted;
        schema.status = entity.status;
        schema.emailVerified = entity.emailVerified;
        schema.failedLoginAttempts = entity.failedLoginAttempts;
        schema.lastLoginAt = entity.lastLoginAt;
        schema.lockedUntil = entity.lockedUntil;
        schema.googleId = entity.googleId;
        schema.role = entity.role;
        schema.createdAt = entity.createdAt;
        schema.updatedAt = entity.updatedAt;
        return schema;
    }
}