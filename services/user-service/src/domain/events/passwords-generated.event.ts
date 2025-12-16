/**
 * Domain Event: PasswordsGeneratedEvent
 *
 * Cet événement signifie: "Des passwords temporaires ont été générés et envoyés par email"
 * C'est la confirmation que l'étape AUTH-SERVICE est complétée
 *
 * Publié par: AuthService (après envoi des emails)
 * Écouté par: SyncService (pour enregistrer dans l'historique)
 */
export class PasswordsGeneratedEvent {
  /**
   * Identifiant unique de l'événement
   */
  readonly eventId: string;

  /**
   * Timestamp de l'événement
   */
  readonly occurredAt: Date;

  /**
   * IDs des utilisateurs ayant reçu un password
   */
  readonly userIds: string[];

  /**
   * Détails des emails envoyés
   */
  readonly emailsSent: {
    userId: string;
    email: string;
    sentAt: Date;
    status: 'success' | 'failed';
    error?: string;
  }[];

  /**
   * Nombre total d'emails envoyés avec succès
   */
  readonly successCount: number;

  /**
   * Nombre total d'emails échoués
   */
  readonly failureCount: number;

  constructor(
    userIds: string[],
    emailsSent: {
      userId: string;
      email: string;
      sentAt: Date;
      status: 'success' | 'failed';
      error?: string;
    }[],
    successCount: number,
    failureCount: number,
  ) {
    this.eventId = this.generateEventId();
    this.occurredAt = new Date();
    this.userIds = userIds;
    this.emailsSent = emailsSent;
    this.successCount = successCount;
    this.failureCount = failureCount;
  }

  private generateEventId(): string {
    return `passwords-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
