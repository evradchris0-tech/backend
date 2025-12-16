import { Injectable, Inject, BadRequestException, Logger } from '@nestjs/common';
import { IAuthUserRepository } from '../../domain/repositories/auth-user.repository.interface';
import { VerificationCodeService } from '../services/verification-code.service';
import { PasswordService } from '../services/password.service';

@Injectable()
export class ResetPasswordUseCase {
  private readonly logger = new Logger(ResetPasswordUseCase.name);

  constructor(
    @Inject('IAuthUserRepository') private readonly authUserRepository: IAuthUserRepository,
    private readonly verificationCodeService: VerificationCodeService,
    private readonly passwordService: PasswordService,
  ) {}

  async execute(code: string, newPassword: string): Promise<void> {
    // 1. Récupérer l'email associé au code
    const email = await this.verificationCodeService.getEmailByCode(code);
    if (!email) {
      throw new BadRequestException('Invalid or expired reset code');
    }

    // 2. Récupérer l'utilisateur
    const user = await this.authUserRepository.findByEmail(email);
    if (!user) {
      throw new BadRequestException('No account found for this email');
    }

    // 3. Valider la force du nouveau mot de passe
    const { valid, errors } = this.passwordService.validatePasswordStrength(newPassword);
    if (!valid) {
      throw new BadRequestException(errors.join(', '));
    }

    // 4. Hasher le mot de passe
    const hashed = await this.passwordService.hash(newPassword);

    // 5. Mettre à jour l'utilisateur
    user.updatePassword(hashed);
    await this.authUserRepository.update(user);

    // 6. Consommer le code
    await this.verificationCodeService.validateAndConsumeCode(code, email);

    this.logger.log(`Password reset for ${email}`);
  }
}