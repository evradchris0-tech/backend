// src/domain/entities/auth-user.entity.ts

import { BaseEntity } from '../base-entity';

export enum AuthUserStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    LOCKED = 'LOCKED',
    PENDING_EMAIL_VERIFICATION = 'PENDING_EMAIL_VERIFICATION',
}

export class AuthUserEntity extends BaseEntity {
    private _email: string;
    private _passwordEncrypted: string | null;
    private _status: AuthUserStatus;
    private _emailVerified: boolean;
    private _failedLoginAttempts: number;
    private _lastLoginAt: Date | null;
    private _lockedUntil: Date | null;
    private _googleId: string | null;

    constructor(
        id: string,
        email: string,
        passwordEncrypted: string | null,
        status: AuthUserStatus,
        emailVerified: boolean = false,
        failedLoginAttempts: number = 0,
        lastLoginAt: Date | null = null,
        lockedUntil: Date | null = null,
        googleId: string | null = null,
    ) {
        super(id);
        this._email = email;
        this._passwordEncrypted = passwordEncrypted;
        this._status = status;
        this._emailVerified = emailVerified;
        this._failedLoginAttempts = failedLoginAttempts;
        this._lastLoginAt = lastLoginAt;
        this._lockedUntil = lockedUntil;
        this._googleId = googleId;
    }

    // Getters
    get email(): string {
        return this._email;
    }

    get passwordEncrypted(): string | null {
        return this._passwordEncrypted;
    }

    get status(): AuthUserStatus {
        return this._status;
    }

    get emailVerified(): boolean {
        return this._emailVerified;
    }

    get failedLoginAttempts(): number {
        return this._failedLoginAttempts;
    }

    get lastLoginAt(): Date | null {
        return this._lastLoginAt;
    }

    get lockedUntil(): Date | null {
        return this._lockedUntil;
    }

    get googleId(): string | null {
        return this._googleId;
    }

    // Business methods
    isActive(): boolean {
        return this._status === AuthUserStatus.ACTIVE && this._emailVerified;
    }

    isLocked(): boolean {
        if (this._status === AuthUserStatus.LOCKED) {
            return true;
        }
        if (this._lockedUntil && this._lockedUntil > new Date()) {
            return true;
        }
        return false;
    }

    recordLoginSuccess(): void {
        this._lastLoginAt = new Date();
        this._failedLoginAttempts = 0;
        this._lockedUntil = null;
        this.touch();
    }

    recordLoginFailure(): void {
        this._failedLoginAttempts += 1;
        if (this._failedLoginAttempts >= 5) {
            this.lock(5); // Lock for 5 minutes
        }
        this.touch();
    }

    lock(durationMinutes: number): void {
        const now = new Date();
        this._lockedUntil = new Date(now.getTime() + durationMinutes * 60000);
        this._status = AuthUserStatus.LOCKED;
        this.touch();
    }

    unlock(): void {
        this._lockedUntil = null;
        this._failedLoginAttempts = 0;
        this._status = AuthUserStatus.ACTIVE;
        this.touch();
    }

    verifyEmail(): void {
        this._emailVerified = true;
        if (this._status === AuthUserStatus.PENDING_EMAIL_VERIFICATION) {
            this._status = AuthUserStatus.ACTIVE;
        }
        this.touch();
    }

    updatePassword(newPasswordEncrypted: string): void {
        this._passwordEncrypted = newPasswordEncrypted;
        this.touch();
    }

    linkGoogleAccount(googleId: string): void {
        this._googleId = googleId;
        this.touch();
    }
}