// /**
//  * Domain Event: UsersImportedEvent
//  * 
//  * ⚠️  SHARED ACROSS MICROSERVICES
//  * 
//  * Cette interface doit être identique dans tous les microservices
//  * qui reçoivent cet événement via RabbitMQ.
//  * 
//  * Pas d'implémentation! Juste l'interface (contrat).
//  * Chaque service peut avoir sa propre classe interne.
//  * 
//  * Le seul lien: Le JSON sérialisé sur RabbitMQ.
//  */

// export interface ImportedUserDetails {
//     userId: string;
//     email: string;
//     fullName: string;
//     address?: string;
//     roomNumber?: string;
//     role: string;
// }


// export interface UsersImportedEventPayload {
//     eventId: string;
//     eventType: 'USERS_IMPORTED';
//     occurredAt: string; // ISO 8601 timestamp
//     importedUserIds: string[];
//     importDetails: ImportedUserDetails[];
//     totalImported: number;
//     importedAt: string; // ISO 8601 timestamp
//     importedBy: string; // Email of user who triggered import
//     metadata?: {
//         fileName?: string;
//         batchSize?: number;
//         processingTimeMs?: number;
//     };
// }
/**
 * Interface pour l'événement UsersImportedEvent
 * 
 * Cet événement est émis quand des utilisateurs sont importés depuis un CSV
 * 
 * @shared - Utilisé par: user-service (émetteur), sync-service (consommateur)
 */
export interface UsersImportedEvent {
    /**
     * ID unique de l'événement
     */
    readonly eventId: string;

    /**
     * Nombre d'utilisateurs importés avec succès
     */
    readonly importedCount: number;

    /**
     * Nombre d'utilisateurs qui ont échoué à l'import
     */
    readonly failedCount: number;

    /**
     * Liste des IDs des utilisateurs importés
     */
    readonly userIds: string[];

    /**
     * Nom du fichier CSV source
     */
    readonly filename: string;

    /**
     * Nombre total de lignes dans le fichier CSV
     */
    readonly totalRows: number;

    /**
     * Date de l'import
     */
    readonly importedAt: Date;

    /**
     * Date à laquelle l'événement est survenu
     */
    readonly occurredAt: string | Date;

    /**
     * Détails des erreurs (optionnel)
     */
    readonly errors?: Array<{
        row: number;
        email: string;
        reason: string;
    }>;

    /**
     * Métadonnées supplémentaires (optionnel)
     */
    readonly metadata?: Record<string, any>;
}

/**
 * Classe pour créer un événement UsersImportedEvent
 */
export class UsersImportedEventPayload implements UsersImportedEvent {
    constructor(
        public readonly eventId: string,
        public readonly importedCount: number,
        public readonly failedCount: number,
        public readonly userIds: string[],
        public readonly filename: string,
        public readonly totalRows: number,
        public readonly importedAt: Date,
        public readonly occurredAt: string | Date,
        public readonly errors?: Array<{
            row: number;
            email: string;
            reason: string;
        }>,
        public readonly metadata?: Record<string, any>,
    ) {}

    /**
     * Factory method pour créer un événement
     */
    static create(params: {
        importedCount: number;
        failedCount: number;
        userIds: string[];
        filename: string;
        totalRows: number;
        errors?: Array<{
            row: number;
            email: string;
            reason: string;
        }>;
        metadata?: Record<string, any>;
    }): UsersImportedEventPayload {
        const now = new Date();
        return new UsersImportedEventPayload(
            `users-imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            params.importedCount,
            params.failedCount,
            params.userIds,
            params.filename,
            params.totalRows,
            now,
            now.toISOString(),
            params.errors,
            params.metadata,
        );
    }
}