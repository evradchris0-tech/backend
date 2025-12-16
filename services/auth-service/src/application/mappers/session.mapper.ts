// src/application/mappers/session.mapper.ts

import { SessionEntity } from '../../domain/entities/session.entity';
import { SessionSchema } from '../../infrastructure/persistence/schemas/session.schema';

export class SessionMapper {
    static toDomain(schema: SessionSchema): SessionEntity {
        return new SessionEntity(
            schema.id,
            schema.userId,
            schema.ipAddress,
            schema.userAgent,
            schema.expiresAt,
            schema.isActive,
            schema.isRevoked, // ✅ AJOUTER
            schema.accessToken,
            schema.refreshToken,
            schema.lastActivityAt, // ✅ AJOUTER
        );
    }

    static toSchema(entity: SessionEntity): SessionSchema {
        const schema = new SessionSchema();
        schema.id = entity.id;
        schema.userId = entity.userId;
        schema.ipAddress = entity.ipAddress;
        schema.userAgent = entity.userAgent;
        schema.expiresAt = entity.expiresAt;
        schema.isActive = entity.isActive;
        schema.isRevoked = entity.isRevoked;
        schema.accessToken = entity.accessToken;
        schema.refreshToken = entity.refreshToken;
        schema.lastActivityAt = entity.lastActivityAt;
        schema.createdAt = entity.createdAt;
        schema.updatedAt = entity.updatedAt;
        return schema;
    }
}