// src/application/dtos/users/user-response.dto.ts

export class UserResponseDto {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    fullName: string;
    role: string;
    status: string;
    username: string | null;
    googleId: string | null;
    profilePicture: string | null;
    emailVerified: boolean;
    currentRoomId: string | null;
    currentAcademicSessionId: string | null;
    lastLoginAt: Date | null;
    createdAt: Date;
    updatedAt: Date;

    constructor(data: Partial<UserResponseDto>) {
        Object.assign(this, data);
    }
}