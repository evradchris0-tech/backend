// src/application/use-cases/sync-user.use-case.ts

import { Injectable, Inject, Logger } from '@nestjs/common';
import { IAuthUserRepository } from '../../domain/repositories/auth-user.repository.interface';
import { AuthUserEntity, AuthUserStatus } from '../../domain/entities/auth-user.entity';

export interface SyncUserDto {
    userId: string;
    email: string;
    passwordEncrypted?: string;
    status: string;
    emailVerified: boolean;
}

@Injectable()
export class SyncUserUseCase {
    private readonly logger = new Logger(SyncUserUseCase.name);

    constructor(
        @Inject('IAuthUserRepository')
        private readonly authUserRepository: IAuthUserRepository,
    ) { }

    async execute(dto: SyncUserDto): Promise<void> {
        try {
            // Vérifier si l'utilisateur existe déjà
            const existingUser = await this.authUserRepository.findById(dto.userId);

            if (existingUser) {
                // Mise à jour
                if (dto.email && dto.email !== existingUser.email) {
                    this.logger.warn(`Email update not supported in sync: ${dto.userId}`);
                }

                if (dto.passwordEncrypted) {
                    existingUser.updatePassword(dto.passwordEncrypted);
                }

                if (dto.emailVerified && !existingUser.emailVerified) {
                    existingUser.verifyEmail();
                }

                await this.authUserRepository.update(existingUser);
                this.logger.log(`✅ Auth user ${dto.userId} updated successfully`);
            } else {
                // Création
                const newAuthUser = new AuthUserEntity(
                    dto.userId,
                    dto.email,
                    dto.passwordEncrypted || null,
                    dto.status as AuthUserStatus,
                    dto.emailVerified,
                    0,
                    null,
                    null,
                );

                await this.authUserRepository.save(newAuthUser);
                this.logger.log(`✅ Auth user ${dto.userId} created successfully`);
            }
        } catch (error) {
            this.logger.error(`❌ Failed to sync user ${dto.userId}:`, error);
            throw error;
        }
    }
}