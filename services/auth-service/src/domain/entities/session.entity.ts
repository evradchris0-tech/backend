// src/domain/entities/session.entity.ts

import { BaseEntity } from '../base-entity';

/**
 * Entité Session
 * Conforme au cahier des charges Section II.1.10
 */
export class SessionEntity extends BaseEntity {
    private _userId: string;
    private _ipAddress: string | null;
    private _userAgent: string | null;
    private _expiresAt: Date;
    private _isActive: boolean;
    private _isRevoked: boolean; // ✅ AJOUTER
    private _accessToken: string | null;
    private _refreshToken: string | null;
    private _lastActivityAt: Date; // ✅ AJOUTER

    constructor(
        id: string,
        userId: string,
        ipAddress: string | null,
        userAgent: string | null,
        expiresAt: Date,
        isActive: boolean = true,
        isRevoked: boolean = false, // ✅ AJOUTER
        accessToken: string | null = null,
        refreshToken: string | null = null,
        lastActivityAt: Date = new Date(), // ✅ AJOUTER
    ) {
        super(id);
        this._userId = userId;
        this._ipAddress = ipAddress;
        this._userAgent = userAgent;
        this._expiresAt = expiresAt;
        this._isActive = isActive;
        this._isRevoked = isRevoked;
        this._accessToken = accessToken;
        this._refreshToken = refreshToken;
        this._lastActivityAt = lastActivityAt;
    }

    // Getters
    get userId(): string {
        return this._userId;
    }

    get ipAddress(): string | null {
        return this._ipAddress;
    }

    get userAgent(): string | null {
        return this._userAgent;
    }

    get expiresAt(): Date {
        return this._expiresAt;
    }

    get isActive(): boolean {
        return this._isActive;
    }

    get isRevoked(): boolean {
        return this._isRevoked;
    }

    get accessToken(): string | null {
        return this._accessToken;
    }

    get refreshToken(): string | null {
        return this._refreshToken;
    }

    get lastActivityAt(): Date {
        return this._lastActivityAt;
    }

    // Business methods
    isExpired(): boolean {
        return new Date() > this._expiresAt;
    }

    updateTokens(accessToken: string, refreshToken: string, expiresAt: Date): void {
        this._accessToken = accessToken;
        this._refreshToken = refreshToken;
        this._expiresAt = expiresAt;
        this._lastActivityAt = new Date();
        this.touch();
    }

    deactivate(): void {
        this._isActive = false;
        this.touch();
    }

    activate(): void {
        this._isActive = true;
        this.touch();
    }

    terminate(): void {
        this._isActive = false;
        this._isRevoked = true;
        this.touch();
    }

    updateActivity(): void {
        this._lastActivityAt = new Date();
        this.touch();
    }
}