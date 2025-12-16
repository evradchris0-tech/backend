// src/application/services/user-client.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface UserProfile {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    status: string;
}

@Injectable()
export class UserClientService {
    private readonly logger = new Logger(UserClientService.name);
    private readonly userServiceUrl: string;

    constructor(private readonly configService: ConfigService) {
        this.userServiceUrl = this.configService.get<string>('USER_SERVICE_URL', 'http://localhost:3002');
    }

    async getUserProfile(userId: string): Promise<UserProfile | null> {
        try {
            const response = await fetch(`${this.userServiceUrl}/users/${userId}`, {
                headers: {
                    'X-Internal-Service': 'auth-service',
                },
            });

            if (!response.ok) {
                return null;
            }

            const data = await response.json();
            return data;
        } catch (error) {
            this.logger.error(`Failed to fetch user profile: ${error.message}`);
            return null;
        }
    }
}