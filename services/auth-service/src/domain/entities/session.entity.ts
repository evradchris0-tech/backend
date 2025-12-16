// src/domain/entities/session.entity.ts

import { BaseEntity } from '../base-entity';

export class SessionEntity extends BaseEntity {
    private _userId: string;
    private _accessToken: string;
    private _refreshToken: string;
    private _expiresAt: Date;
    private _ipAddress: string;
    private _userAgent: string;
    private _isRevoked: boolean;
    private _lastActivityAt: Date;

    constructor(
        id: string,
        userId: string,
        accessToken: string,
        refreshToken: string,
        expiresAt: Date,
        ipAddress: string,
        userAgent: string,
        isRevoked: boolean = false,
    ) {
        super(id);
        this._userId = userId;
        this._accessToken = accessToken;
        this._refreshToken = refreshToken;
        this._expiresAt = expiresAt;
        this._ipAddress = ipAddress;
        this._userAgent = userAgent;
        this._isRevoked = isRevoked;
        this._lastActivityAt = new Date();
    }

    // Getters
    get userId(): string { return this._userId; }
    get accessToken(): string { return this._accessToken; }
    get refreshToken(): string { return this._refreshToken; }
    get expiresAt(): Date { return this._expiresAt; }
    get ipAddress(): string { return this._ipAddress; }
    get userAgent(): string { return this._userAgent; }
    get isRevoked(): boolean { return this._isRevoked; }
    get lastActivityAt(): Date { return this._lastActivityAt; }

    // Business methods
    isExpired(): boolean {
        return new Date() > this._expiresAt;
    }

    updateTokens(
        newAccessToken: string,
        newRefreshToken: string,
        newExpiresAt: Date,
    ): void {
        this._accessToken = newAccessToken;
        this._refreshToken = newRefreshToken;
        this._expiresAt = newExpiresAt;
        this._lastActivityAt = new Date();
        this.touch();
    }

    revoke(): void {
        this._isRevoked = true;
        this.touch();
    }

    terminate(): void {
        this._isRevoked = true;
        this.touch();
    }

    updateActivity(): void {
        this._lastActivityAt = new Date();
        this.touch();
    }
}