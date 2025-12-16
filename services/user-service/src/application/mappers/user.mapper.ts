// src/application/mappers/user.mapper.ts

import { UserEntity, UserRole, UserStatus } from '../../domain/entities/user.entity';
import { UserSchema } from '../../infrastructure/persistence/schemas/user.schema';

export class UserMapper {
    static toDomain(schema: UserSchema): UserEntity {
        return new UserEntity(
            schema.id,
            schema.email,
            schema.firstName || '',
            schema.lastName || '',
            schema.passwordEncrypted,

            // Role et status à leur bonne position
            schema.role as UserRole,
            schema.status as UserStatus,

            // Username vient AVANT googleId
            schema.username || null,
            schema.googleId || null,
            schema.profilePicture || null,

            // Ensuite emailVerified
            !!schema.emailVerified,

            schema.emailVerificationCode || null,
            schema.emailVerificationCodeExpiresAt || null,
            schema.failedLoginAttempts || 0,
            schema.lastLoginAt || null,
            schema.lockedUntil || null,
            schema.currentRoomId || null,
            schema.currentAcademicSessionId || null,
        );
    }

    static toSchema(entity: UserEntity): UserSchema {
        const schema = new UserSchema();

        schema.id = entity.id;
        schema.email = entity.email;
        schema.firstName = entity.firstName;
        schema.lastName = entity.lastName;
        schema.passwordEncrypted = entity.passwordEncrypted;

        schema.role = entity.role;
        schema.status = entity.status;
        schema.username = entity.username;

        schema.googleId = entity.googleId;
        schema.profilePicture = entity.profilePicture;

        schema.emailVerified = entity.emailVerified;
        schema.emailVerificationCode = entity.emailVerificationCode;
        schema.emailVerificationCodeExpiresAt = entity.emailVerificationCodeExpiresAt;

        schema.failedLoginAttempts = entity.failedLoginAttempts;
        schema.lastLoginAt = entity.lastLoginAt;
        schema.lockedUntil = entity.lockedUntil;

        schema.currentRoomId = entity.currentRoomId;
        schema.currentAcademicSessionId = entity.currentAcademicSessionId;

        schema.createdAt = entity.createdAt;
        schema.updatedAt = entity.updatedAt;

        return schema;
    }
}
