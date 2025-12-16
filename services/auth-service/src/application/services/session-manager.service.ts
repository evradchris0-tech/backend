// src/application/services/session-manager.service.ts

import { Injectable, Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ISessionRepository } from '../../domain/repositories/session.repository.interface';
import { SessionEntity } from '../../domain/entities/session.entity';

@Injectable()
export class SessionManagerService {
    private readonly logger = new Logger(SessionManagerService.name);
    private readonly sessionMaxDurationHours: number;
    private readonly sessionIdleTimeoutMinutes: number;

    constructor(
        @Inject('ISessionRepository')
        private readonly sessionRepository: ISessionRepository,
        private readonly configService: ConfigService,
    ) {
        this.sessionMaxDurationHours = this.configService.get<number>(
            'SESSION_MAX_DURATION_HOURS',
            8,
        );
        this.sessionIdleTimeoutMinutes = this.configService.get<number>(
            'SESSION_IDLE_TIMEOUT_MINUTES',
            30,
        );
    }

    /**
     * Crée une nouvelle session
     * ✅ CORRECTION: Signature correcte
     */
    async createSession(
        userId: string,
        ipAddress: string,
        userAgent: string,
    ): Promise<SessionEntity> {
        const now = new Date();
        const expiresAt = new Date(
            now.getTime() + this.sessionMaxDurationHours * 60 * 60 * 1000,
        );

        const session = new SessionEntity(
            undefined, // ID généré automatiquement
            userId,
            ipAddress,
            userAgent,
            expiresAt,
            true, // isActive
            false, // isRevoked
            null, // accessToken (sera mis à jour après génération JWT)
            null, // refreshToken (sera mis à jour après génération)
            now, // lastActivityAt
        );

        const savedSession = await this.sessionRepository.save(session);
        this.logger.log(`✅ Session created for user ${userId}: ${savedSession.id}`);

        return savedSession;
    }

    /**
     * Vérifie si une session est inactive depuis trop longtemps
     */
    async checkSessionIdleTimeout(session: SessionEntity): Promise<boolean> {
        const now = new Date();
        const lastActivity = session.lastActivityAt.getTime();
        const idleTimeMs = this.sessionIdleTimeoutMinutes * 60 * 1000;

        if (now.getTime() - lastActivity > idleTimeMs) {
            this.logger.warn(`Session ${session.id} exceeded idle timeout`);
            session.deactivate();
            await this.sessionRepository.update(session);
            return true; // Session inactive
        }

        return false; // Session active
    }

    /**
     * Met à jour l'activité d'une session
     */
    async updateSessionActivity(sessionId: string): Promise<void> {
        const session = await this.sessionRepository.findById(sessionId);
        if (session && session.isActive) {
            session.updateActivity();
            await this.sessionRepository.update(session);
        }
    }

    /**
     * Termine toutes les sessions d'un utilisateur
     */
    async terminateUserSessions(userId: string): Promise<void> {
        const sessions = await this.sessionRepository.findByUserId(userId);
        
        for (const session of sessions) {
            if (session.isActive) {
                session.terminate();
                await this.sessionRepository.update(session);
            }
        }

        this.logger.log(`✅ Terminated all sessions for user ${userId}`);
    }
}