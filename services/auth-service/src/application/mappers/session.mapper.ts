// src/application/mappers/session.mapper.ts

import { SessionEntity } from '../../domain/entities/session.entity';
import { SessionSchema } from '../../infrastructure/persistence/schemas/session.schema';

export class SessionMapper {
    static toDomain(schema: SessionSchema): SessionEntity {
        const entity = new SessionEntity(
            schema.id,
            schema.userId,
            schema.accessToken,
            schema.refreshToken,
            schema.expiresAt,
            schema.ipAddress,
            schema.userAgent,
            schema.isRevoked,
        );
        // Restaurer les timestamps
        (entity as any)._createdAt = schema.createdAt;
        (entity as any)._updatedAt = schema.updatedAt;
        (entity as any)._lastActivityAt = schema.lastActivityAt;
        return entity;
    }

    static toSchema(entity: SessionEntity): SessionSchema {
        const schema = new SessionSchema();
        schema.id = entity.id;
        schema.userId = entity.userId;
        schema.accessToken = entity.accessToken;
        schema.refreshToken = entity.refreshToken;
        schema.expiresAt = entity.expiresAt;
        schema.ipAddress = entity.ipAddress;
        schema.userAgent = entity.userAgent;
        schema.isRevoked = entity.isRevoked;
        schema.lastActivityAt = entity.lastActivityAt;
        schema.createdAt = entity.createdAt;
        schema.updatedAt = entity.updatedAt;
        return schema;
    }
}