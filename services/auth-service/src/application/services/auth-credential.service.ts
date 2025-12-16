import { Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateAuthCredentialDto } from '../dtos/auth-credential.dto';

/**
 * Service de gestion des credentials d'authentification
 * 
 * Responsabilité:
 * - Créer/mettre à jour les credentials (password hash)
 * - Vérifier les passwords
 * - Générer les passwords temporaires
 * - Gérer les flags (needsPasswordChange, etc)
 */
@Injectable()
export class AuthCredentialService {
  private readonly logger = new Logger(AuthCredentialService.name);

  /**
   * Hash rounds pour bcrypt (plus de rounds = plus sécurisé mais plus lent)
   */
  private readonly BCRYPT_ROUNDS = 10;

  /**
   * Créer une nouvelle credential pour un utilisateur
   * 
   * @param dto Les données de credential à créer
   * @returns La credential créée (sans le hash)
   */
  async createCredential(dto: CreateAuthCredentialDto): Promise<any> {
    try {
      this.logger.log(`Creating credential for user: ${dto.userId}`);

      // Note: Dans une implémentation réelle, sauvegarder en base de données
      // await this.credentialRepo.save({
      //   userId: dto.userId,
      //   email: dto.email,
      //   passwordHash: dto.passwordHash,
      //   needsPasswordChange: dto.needsPasswordChange,
      //   metadata: dto.metadata,
      // });

      return {
        userId: dto.userId,
        email: dto.email,
        needsPasswordChange: dto.needsPasswordChange,
      };
    } catch (error) {
      this.logger.error(
        `Failed to create credential for user ${dto.userId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Générer un password temporaire aléatoire
   * 
   * Format: 12 caractères avec majuscules, minuscules, chiffres et symboles
   * Exemple: "TempPass123!@"
   * 
   * @returns Un password temporaire sécurisé
   */
  generateTemporaryPassword(): string {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%&*';

    const allChars = uppercase + lowercase + numbers + symbols;
    let password = '';

    // Garantir au moins 1 de chaque type
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];

    // Remplir le reste (jusqu'à 12 caractères)
    for (let i = password.length; i < 12; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Mélanger les caractères
    password = password
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('');

    return password;
  }

  /**
   * Hasher un password
   * 
   * @param password Le password en clair
   * @returns Le hash bcrypt
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.BCRYPT_ROUNDS);
  }

  /**
   * Vérifier un password contre son hash
   * 
   * @param password Le password en clair à vérifier
   * @param hash Le hash stocké en base de données
   * @returns true si le password match, false sinon
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
