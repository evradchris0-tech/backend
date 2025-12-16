// src/application/services/user-service-client.service.ts

import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, timeout, catchError } from 'rxjs';
import { AxiosError } from 'axios';

/**
 * Client HTTP pour communiquer avec User-Service
 * Permet de récupérer le profil complet d'un utilisateur (incluant le rôle)
 */
@Injectable()
export class UserServiceClient {
    private readonly logger = new Logger(UserServiceClient.name);
    private readonly userServiceUrl: string;
    private readonly requestTimeout: number = 5000; // 5 secondes

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {
        this.userServiceUrl = this.configService.get<string>(
            'USER_SERVICE_URL',
            'http://localhost:4002',
        );
        this.logger.log(`✅ UserServiceClient initialized: ${this.userServiceUrl}`);
    }

    /**
     * Récupère le profil complet d'un utilisateur depuis User-Service
     * @param userId - ID de l'utilisateur
     * @returns Profil utilisateur avec rôle, status, etc.
     * @throws HttpException si l'utilisateur n'existe pas ou si le service est indisponible
     */
    async getUserProfile(userId: string): Promise<UserProfile> {
        try {
            this.logger.debug(`Fetching profile for user ${userId} from User-Service`);

            const response = await firstValueFrom(
                this.httpService
                    .get(`${this.userServiceUrl}/users/${userId}`, {
                        headers: {
                            'x-internal-service': 'auth-service',
                            'Content-Type': 'application/json',
                        },
                    })
                    .pipe(
                        timeout(this.requestTimeout),
                        catchError((error: AxiosError) => {
                            this.logger.error(
                                `Failed to fetch user profile from User-Service: ${error.message}`,
                            );

                            if (error.response?.status === 404) {
                                throw new HttpException(
                                    'User profile not found in User-Service',
                                    HttpStatus.NOT_FOUND,
                                );
                            }

                            throw new HttpException(
                                'User-Service unavailable',
                                HttpStatus.SERVICE_UNAVAILABLE,
                            );
                        }),
                    ),
            );

            const profile = response.data as UserProfile;

            // Validation des données essentielles
            if (!profile.role || !profile.status) {
                this.logger.error(
                    `Invalid user profile received from User-Service: missing role or status`,
                );
                throw new HttpException(
                    'Invalid user profile: missing required fields',
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }

            this.logger.debug(
                `✅ User profile retrieved: ${profile.email} (${profile.role})`,
            );

            return profile;
        } catch (error) {
            // Re-lancer les HttpException
            if (error instanceof HttpException) {
                throw error;
            }

            // Gérer les erreurs inattendues
            this.logger.error(`Unexpected error fetching user profile: ${error.message}`);
            throw new HttpException(
                'Failed to retrieve user profile',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    /**
     * Vérifie si User-Service est disponible (healthcheck)
     * @returns true si disponible, false sinon
     */
    async isUserServiceAvailable(): Promise<boolean> {
        try {
            await firstValueFrom(
                this.httpService
                    .get(`${this.userServiceUrl}/health`)
                    .pipe(timeout(2000)),
            );
            return true;
        } catch (error) {
            this.logger.warn('User-Service healthcheck failed');
            return false;
        }
    }
}

/**
 * Interface du profil utilisateur retourné par User-Service
 */
export interface UserProfile {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string; // SUPERADMIN | ADMINISTRATOR | SUPERVISOR | AGENT_TERRAIN | OCCUPANT
    status: string; // ACTIVE | INACTIVE | LOCKED | PENDING_EMAIL_VERIFICATION
    emailVerified: boolean;
    username?: string;
    currentRoomId?: string;
    currentAcademicSessionId?: string;
    lastLoginAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}