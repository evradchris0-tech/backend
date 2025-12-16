// src/application/mappers/refresh-token.mapper.ts

import { RefreshTokenEntity } from '../../domain/entities/refresh-token.entity';
import { RefreshTokenSchema } from '../../infrastructure/persistence/schemas/refresh-token.schema';

export class RefreshTokenMapper {
    static toDomain(schema: RefreshTokenSchema): RefreshTokenEntity {
        return new RefreshTokenEntity(
            schema.id,
            schema.userId,
            schema.token,
            schema.expiresAt,
            schema.isRevoked,
            schema.revokedAt,
        );
    }

    static toSchema(entity: RefreshTokenEntity): RefreshTokenSchema {
        const schema = new RefreshTokenSchema();
        schema.id = entity.id;
        schema.userId = entity.userId;
        schema.token = entity.token;
        schema.expiresAt = entity.expiresAt;
        schema.isRevoked = entity.isRevoked;
        schema.revokedAt = entity.revokedAt;
        schema.createdAt = entity.createdAt;
        return schema;
    }
}