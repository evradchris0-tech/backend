import { Injectable, Inject, NotFoundException, Logger } from '@nestjs/common';
import { IAuthUserRepository } from '../../domain/repositories/auth-user.repository.interface';
import { VerificationCodeService } from '../services/verification-code.service';
import { EmailService } from '../services/email.service';

@Injectable()
export class ForgotPasswordUseCase {
  private readonly logger = new Logger(ForgotPasswordUseCase.name);

  constructor(
    @Inject('IAuthUserRepository') private readonly authUserRepository: IAuthUserRepository,
    private readonly verificationCodeService: VerificationCodeService,
    private readonly emailService: EmailService,
  ) {}

  async execute(email: string): Promise<void> {
    // 1. Vérifier que l'utilisateur existe
    const user = await this.authUserRepository.findByEmail(email);
    if (!user) {
      // Pour éviter le fingerprinting, on ne révèle pas si l'email existe
      this.logger.warn(`Forgot password requested for unknown email: ${email}`);
      return;
    }

    // 2. Générer un code de réinitialisation
    const code = this.verificationCodeService.generateCode();
    this.verificationCodeService.storeVerificationCode(email, code);

    // 3. Envoyer l'email avec le code (template dédié)
    await this.emailService.sendPasswordResetCode(email, user.email, code);

    this.logger.log(`Password reset code generated and emailed for ${email}`);
  }
}
