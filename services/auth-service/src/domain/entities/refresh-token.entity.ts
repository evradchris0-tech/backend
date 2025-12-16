// src/domain/entities/refresh-token.entity.ts

import { BaseEntity } from '../base-entity';

export class RefreshTokenEntity extends BaseEntity {
    private _userId: string;
    private _token: string;
    private _expiresAt: Date;
    private _isRevoked: boolean;
    private _sessionId: string;

    constructor(
        id: string,
        userId: string,
        token: string,
        expiresAt: Date,
        sessionId: string,
        isRevoked: boolean = false,
    ) {
        super(id);
        this._userId = userId;
        this._token = token;
        this._expiresAt = expiresAt;
        this._sessionId = sessionId;
        this._isRevoked = isRevoked;
    }

    // Getters
    get userId(): string {
        return this._userId;
    }

    get token(): string {
        return this._token;
    }

    get expiresAt(): Date {
        return this._expiresAt;
    }

    get isRevoked(): boolean {
        return this._isRevoked;
    }

    get sessionId(): string {
        return this._sessionId;
    }

    // Business logic methods
    isExpired(): boolean {
        return new Date() > this._expiresAt;
    }

    isValid(): boolean {
        return !this._isRevoked && !this.isExpired();
    }

    revoke(): void {
        this._isRevoked = true;
        this.touch();
    }
}