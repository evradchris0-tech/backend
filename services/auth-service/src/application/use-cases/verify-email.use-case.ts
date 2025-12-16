// src/application/use-cases/verify-email.use-case.ts

import {
    Injectable,
    Inject,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { IAuthUserRepository } from '../../domain/repositories/auth-user.repository.interface';
import { VerifyEmailDto } from '../dtos/verify-email.dto';

@Injectable()
export class VerifyEmailUseCase {
    constructor(
        @Inject('IAuthUserRepository')
        private readonly authUserRepository: IAuthUserRepository,
    ) { }

    async execute(verifyEmailDto: VerifyEmailDto): Promise<void> {
        // 1. Trouver l'utilisateur par email
        const user = await this.authUserRepository.findByEmail(verifyEmailDto.email);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        // 2. Vérifier que l'email n'est pas déjà vérifié
        if (user.emailVerified) {
            throw new BadRequestException('Email is already verified');
        }
    
        // 3. Marquer l'email comme vérifié
        user.verifyEmail();
        await this.authUserRepository.update(user);
    }
}