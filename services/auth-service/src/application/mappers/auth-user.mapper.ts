// src/application/mappers/auth-user.mapper.ts

import { AuthUserEntity, AuthUserStatus } from '../../domain/entities/auth-user.entity';
import { AuthUserSchema } from '../../infrastructure/persistence/schemas/auth-user.schema';

export class AuthUserMapper {
    static toDomain(schema: AuthUserSchema): AuthUserEntity {
        return new AuthUserEntity(
            schema.id,
            schema.email,
            schema.passwordEncrypted,
            schema.status as AuthUserStatus,
            schema.emailVerified,
            schema.failedLoginAttempts,
            schema.lastLoginAt,
            schema.lockedUntil,
        );
    }

    static toSchema(entity: AuthUserEntity): AuthUserSchema {
        const schema = new AuthUserSchema();
        schema.id = entity.id;
        schema.email = entity.email;
        schema.passwordEncrypted = entity.passwordEncrypted;
        schema.status = entity.status;
        schema.emailVerified = entity.emailVerified;
        schema.failedLoginAttempts = entity.failedLoginAttempts;
        schema.lastLoginAt = entity.lastLoginAt;
        schema.lockedUntil = entity.lockedUntil;
        return schema;
    }
}