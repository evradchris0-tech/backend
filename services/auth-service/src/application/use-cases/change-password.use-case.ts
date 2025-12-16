// src/application/use-cases/change-password.use-case.ts

import { Injectable, Inject, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { IAuthUserRepository } from '../../domain/repositories/auth-user.repository.interface';
import { PasswordService } from '../services/password.service';
import { ChangePasswordDto } from '../dtos/change-password.dto';

@Injectable()
export class ChangePasswordUseCase {
    constructor(
        @Inject('IAuthUserRepository')
        private readonly authUserRepository: IAuthUserRepository,
        private readonly passwordService: PasswordService,
    ) { }

    async execute(userId: string, changePasswordDto: ChangePasswordDto): Promise<void> {
        // 1. Récupérer l'utilisateur dans auth_users
        const user = await this.authUserRepository.findById(userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        // 2. Vérifier l'ancien mot de passe
        if (!user.passwordEncrypted) {
            throw new UnauthorizedException('Password not set for this account');
        }

        const isOldPasswordValid = await this.passwordService.compare(
            changePasswordDto.oldPassword,
            user.passwordEncrypted,
        );

        if (!isOldPasswordValid) {
            throw new UnauthorizedException('Old password is incorrect');
        }

        // 3. Hasher le nouveau mot de passe
        const newPasswordHashed = await this.passwordService.hash(changePasswordDto.newPassword);

        // 4. Mettre à jour le mot de passe dans auth_users
        user.updatePassword(newPasswordHashed);
        await this.authUserRepository.update(user);
    }
}