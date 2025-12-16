/**
 * DTO pour créer une credential d'authentification
 * 
 * Utilisé quand on crée un nouveau user ou on change son password
 */
export class CreateAuthCredentialDto {
  /**
   * ID de l'utilisateur (référence à users table)
   */
  userId: string;

  /**
   * Email de l'utilisateur
   */
  email: string;

  /**
   * Hash du password (bcrypt hash)
   */
  passwordHash: string;

  /**
   * Si true, l'utilisateur DOIT changer son password au premier login
   */
  needsPasswordChange: boolean;

  /**
   * Type de credential (pour future extensibilité)
   */
  credentialType?: string; // 'password', 'oauth', etc.

  /**
   * Metadata optionnelle
   */
  metadata?: {
    temporaryPassword?: string; // Pour logs/audit uniquement
    generatedAt?: Date;
  };
}

/**
 * DTO pour la réponse d'un credential
 */
export class AuthCredentialResponseDto {
  userId: string;
  email: string;
  needsPasswordChange: boolean;
  createdAt: Date;
  updatedAt: Date;
}
