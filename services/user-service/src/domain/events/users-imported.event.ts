/**
 * Détails d'un utilisateur importé
 */
export interface ImportedUserDetails {
  /**
   * ID unique de l'utilisateur créé
   */
  userId: string;

  /**
   * Email de l'utilisateur (où envoyer le password)
   */
  email: string;

  /**
   * Nom complet de l'utilisateur
   */
  fullName: string;

  /**
   * Adresse (optionnel)
   */
  address?: string;

  /**
   * Numéro de chambre (optionnel)
   */
  roomNumber?: string;

  /**
   * Rôle assigné (toujours OCCUPANT pour les imports Excel)
   */
  role: string; // 'OCCUPANT'
}

/**
 * Domain Event: UsersImportedEvent
 *
 * Cet événement signifie: "Des utilisateurs ont été importés via Excel"
 * C'est un FAIT qui s'est produit dans le système
 *
 * Publié par: ExcelImportService (après création en BD)
 * Écouté par: AuthService (pour générer passwords et envoyer emails)
 * Enregistré par: SyncService (pour traçabilité complète)
 */
export class UsersImportedEvent {
  /**
   * Identifiant unique de l'événement
   */
  readonly eventId: string;

  /**
   * Timestamp de l'événement
   */
  readonly occurredAt: Date;

  /**
   * IDs des utilisateurs créés
   */
  readonly importedUserIds: string[];

  /**
   * Détails de chaque utilisateur importé
   */
  readonly importDetails: ImportedUserDetails[];

  /**
   * Timestamp d'import
   */
  readonly importedAt: Date;

  /**
   * ID de l'administrateur/utilisateur qui a déclenché l'import
   */
  readonly importedBy: string;

  /**
   * Nombre total d'utilisateurs importés
   */
  readonly totalImported: number;

  /**
   * Métadonnées optionnelles
   */
  readonly metadata: {
    fileName?: string;
    batchSize?: number;
    processingTimeMs?: number;
  };

  constructor(
    importedUserIds: string[],
    importDetails: ImportedUserDetails[],
    importedAt: Date,
    importedBy: string,
    totalImported: number,
    metadata: {
      fileName?: string;
      batchSize?: number;
      processingTimeMs?: number;
    } = {},
  ) {
    this.eventId = this.generateEventId();
    this.occurredAt = new Date();
    this.importedUserIds = importedUserIds;
    this.importDetails = importDetails;
    this.importedAt = importedAt;
    this.importedBy = importedBy;
    this.totalImported = totalImported;
    this.metadata = metadata;
  }

  private generateEventId(): string {
    return `import-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
