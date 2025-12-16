// src/domain/entities/user.entity.ts

import { BaseEntity } from '../base-entity';

export enum UserRole {
    SUPERADMIN = 'SUPERADMIN',
    ADMINISTRATOR = 'ADMINISTRATOR',
    SUPERVISOR = 'SUPERVISOR',
    AGENT_TERRAIN = 'AGENT_TERRAIN',
    OCCUPANT = 'OCCUPANT',
}

export enum UserStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    LOCKED = 'LOCKED',
    PENDING_EMAIL_VERIFICATION = 'PENDING_EMAIL_VERIFICATION',
}

export class UserEntity extends BaseEntity {
    private _email: string;
    private _firstName: string;
    private _lastName: string;
    private _passwordEncrypted: string | null;
    private _role: UserRole;
    private _status: UserStatus;
    private _username: string | null;
    private _googleId: string | null;
    private _profilePicture: string | null;
    private _emailVerified: boolean;
    private _emailVerificationCode: string | null;
    private _emailVerificationCodeExpiresAt: Date | null;
    private _failedLoginAttempts: number;
    private _lastLoginAt: Date | null;
    private _lockedUntil: Date | null;
    private _currentRoomId: string | null;
    private _currentAcademicSessionId: string | null;

    constructor(
        id: string,
        email: string,
        firstName: string,
        lastName: string,
        passwordEncrypted: string | null,
        role: UserRole,
        status: UserStatus,
        username: string | null = null,
        googleId: string | null = null,
        profilePicture: string | null = null,
        emailVerified: boolean = false,
        emailVerificationCode: string | null = null,
        emailVerificationCodeExpiresAt: Date | null = null,
        failedLoginAttempts: number = 0,
        lastLoginAt: Date | null = null,
        lockedUntil: Date | null = null,
        currentRoomId: string | null = null,
        currentAcademicSessionId: string | null = null,
    ) {
        super(id);
        this._email = email;
        this._firstName = firstName;
        this._lastName = lastName;
        this._passwordEncrypted = passwordEncrypted;
        this._role = role;
        this._status = status;
        this._username = username;
        this._googleId = googleId;
        this._profilePicture = profilePicture;
        this._emailVerified = emailVerified;
        this._emailVerificationCode = emailVerificationCode;
        this._emailVerificationCodeExpiresAt = emailVerificationCodeExpiresAt;
        this._failedLoginAttempts = failedLoginAttempts;
        this._lastLoginAt = lastLoginAt;
        this._lockedUntil = lockedUntil;
        this._currentRoomId = currentRoomId;
        this._currentAcademicSessionId = currentAcademicSessionId;
    }

    // Getters
    get email(): string { return this._email; }
    get firstName(): string { return this._firstName; }
    get lastName(): string { return this._lastName; }
    get passwordEncrypted(): string | null { return this._passwordEncrypted; }
    get role(): UserRole { return this._role; }
    get status(): UserStatus { return this._status; }
    get username(): string | null { return this._username; }
    get googleId(): string | null { return this._googleId; }
    get profilePicture(): string | null { return this._profilePicture; }
    get emailVerified(): boolean { return this._emailVerified; }
    get emailVerificationCode(): string | null { return this._emailVerificationCode; }
    get emailVerificationCodeExpiresAt(): Date | null { return this._emailVerificationCodeExpiresAt; }
    get failedLoginAttempts(): number { return this._failedLoginAttempts; }
    get lastLoginAt(): Date | null { return this._lastLoginAt; }
    get lockedUntil(): Date | null { return this._lockedUntil; }
    get currentRoomId(): string | null { return this._currentRoomId; }
    get currentAcademicSessionId(): string | null { return this._currentAcademicSessionId; }
    get fullName(): string {
        return `${this._firstName} ${this._lastName}`;
    }
    generateEmailVerificationCode(): string {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        this._emailVerificationCode = code;
        this._emailVerificationCodeExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
        this.touch();
        return code;
    }
    assignToRoom(roomId: string, roomNumber: string, academicSessionId: string): void {
        this._currentRoomId = roomId;
        this._currentAcademicSessionId = academicSessionId;
        this.touch();
    }
    changeRole(newRole: UserRole): void {
        this._role = newRole;
        this.touch();
    }
    // Business methods
    isActive(): boolean {
        return this._status === UserStatus.ACTIVE && this._emailVerified;
    }

    activate(): void {
        this._status = UserStatus.ACTIVE;
        this.touch();
    }

    deactivate(): void {
        this._status = UserStatus.INACTIVE;
        this.touch();
    }

    verifyEmail(): void {
        this._emailVerified = true;
        this._emailVerificationCode = null;
        this._emailVerificationCodeExpiresAt = null;
        if (this._status === UserStatus.PENDING_EMAIL_VERIFICATION) {
            this._status = UserStatus.ACTIVE;
        }
        this.touch();
    }

    updatePassword(newPasswordEncrypted: string): void {
        this._passwordEncrypted = newPasswordEncrypted;
        this.touch();
    }

    updateProfile(firstName?: string, lastName?: string, username?: string): void {
        if (firstName) this._firstName = firstName;
        if (lastName) this._lastName = lastName;
        if (username) this._username = username;
        this.touch();
    }

    assignRoom(roomId: string, academicSessionId: string): void {
        this._currentRoomId = roomId;
        this._currentAcademicSessionId = academicSessionId;
        this.touch();
    }

    unassignRoom(): void {
        this._currentRoomId = null;
        this._currentAcademicSessionId = null;
        this.touch();
    }
}