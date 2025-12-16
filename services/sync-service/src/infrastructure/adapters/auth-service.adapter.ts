import { Injectable, HttpException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ServiceAdapter } from '../../application/services/service-adapter-registry.service';
import { AxiosError } from 'axios';

@Injectable()
export class AuthServiceAdapter implements ServiceAdapter {
    readonly serviceName = 'auth-service';
    private readonly baseUrl: string;

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {
        this.baseUrl = this.configService.get<string>('AUTH_SERVICE_URL', 'http://localhost:3001');
    }

    async syncUserCreated(data: any): Promise<void> {
        try {
            await firstValueFrom(
                this.httpService.post(`${this.baseUrl}/internal/users/sync`, {
                    id: data.id,
                    email: data.email,
                    passwordEncrypted: data.passwordEncrypted,
                    status: data.status,
                }, {
                    headers: {
                        'x-internal-service': 'user-service',  // ✅ HEADER AJOUTÉ
                        'Content-Type': 'application/json',
                    }
                })
            );
            console.log(`✅ Synced user ${data.id} to auth-service`);
        } catch (error) {
            const err = error as AxiosError;
            console.error(`❌ Failed to sync user to auth-service:`, err.message);
            throw new HttpException(err.message, err.response?.status || 500);
        }
    }

    async syncUserUpdated(data: any): Promise<void> {
        try {
            await firstValueFrom(
                this.httpService.patch(`${this.baseUrl}/internal/users/sync`, {
                    id: data.id,
                    updatedFields: data.updatedFields,
                }, {
                    headers: {
                        'x-internal-service': 'user-service',  // ✅ HEADER AJOUTÉ
                        'Content-Type': 'application/json',
                    }
                })
            );
            console.log(`✅ Updated user ${data.id} in auth-service`);
        } catch (error) {
            const err = error as AxiosError;
            console.error(`❌ Failed to update user in auth-service:`, err.message);
            throw new HttpException(err.message, err.response?.status || 500);
        }
    }

    async syncUserDeleted(data: any): Promise<void> {
        try {
            await firstValueFrom(
                this.httpService.delete(`${this.baseUrl}/internal/users/${data.id}`, {
                    headers: {
                        'x-internal-service': 'user-service',  // ✅ HEADER AJOUTÉ
                    }
                })
            );
            console.log(`✅ Deleted user ${data.id} from auth-service`);
        } catch (error) {
            const err = error as AxiosError;
            console.error(`❌ Failed to delete user from auth-service:`, err.message);
            throw new HttpException(err.message, err.response?.status || 500);
        }
    }
}