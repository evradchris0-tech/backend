// src/application/services/session-manager.service.ts

import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { SessionEntity } from '../../domain/entities/session.entity';
import { RefreshTokenEntity } from '../../domain/entities/refresh-token.entity';

@Injectable()
export class SessionManagerService {
    createSession(
        userId: string,
        accessToken: string,
        refreshToken: string,
        expiresAt: Date,
        ipAddress: string,
        userAgent: string,
    ): SessionEntity {
        return new SessionEntity(
            uuidv4(),
            userId,
            accessToken,
            refreshToken,
            expiresAt,
            ipAddress,
            userAgent,
            false, // isRevoked
        );
    }

    createRefreshToken(
        userId: string,
        token: string,
        expiresAt: Date,
        sessionId: string,
    ): RefreshTokenEntity {
        return new RefreshTokenEntity(
            uuidv4(),
            userId,
            token,
            expiresAt,
            sessionId,
            false, // isRevoked
        );
    }

    isSessionExpired(session: SessionEntity): boolean {
        return session.isExpired();
    }

    shouldRefreshSession(session: SessionEntity): boolean {
        const now = Date.now();
        const expiresAt = session.expiresAt.getTime();
        const timeUntilExpiry = expiresAt - now;
        const fifteenMinutes = 15 * 60 * 1000;

        return timeUntilExpiry < fifteenMinutes;
    }

    isSessionInactive(session: SessionEntity, inactivityThresholdMs: number = 30 * 60 * 1000): boolean {
        const now = Date.now();
        const lastActivity = session.lastActivityAt.getTime();
        return (now - lastActivity) > inactivityThresholdMs;
    }
}