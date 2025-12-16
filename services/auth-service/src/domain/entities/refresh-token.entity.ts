// src/domain/entities/refresh-token.entity.ts

import { BaseEntity } from '../base-entity';

export class RefreshTokenEntity extends BaseEntity {
    private _userId: string;
    private _token: string;
    private _expiresAt: Date;
    private _isRevoked: boolean;
    private _revokedAt: Date | null;

    constructor(
        id: string,
        userId: string,
        token: string,
        expiresAt: Date,
        isRevoked: boolean = false,
        revokedAt: Date | null = null,
    ) {
        super(id);
        this._userId = userId;
        this._token = token;
        this._expiresAt = expiresAt;
        this._isRevoked = isRevoked;
        this._revokedAt = revokedAt;
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

    // ✅ VÉRIFIER QUE CE GETTER EXISTE
    get revokedAt(): Date | null {
        return this._revokedAt;
    }

    // Business methods
    isExpired(): boolean {
        return new Date() > this._expiresAt;
    }

    revoke(): void {
        this._isRevoked = true;
        this._revokedAt = new Date();
        this.touch();
    }
}