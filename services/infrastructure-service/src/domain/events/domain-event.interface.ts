// src/domain/events/domain-event.interface.ts

/**
 * Interface de base pour tous les evenements du domaine
 * Implemente le pattern Observer pour le decouplage
 */
export interface DomainEvent {
    /** Identifiant unique de l'evenement */
    readonly eventId: string;

    /** Timestamp de l'evenement */
    readonly occurredOn: Date;

    /** Type de l'evenement (nom de la classe) */
    readonly eventType: string;

    /** Identifiant de l'agregat concerné */
    readonly aggregateId: string;

    /** Type de l'agregat (Batiment, Espace, Equipement, etc.) */
    readonly aggregateType: string;
}

/**
 * Classe abstraite de base pour les evenements du domaine
 */
export abstract class BaseDomainEvent implements DomainEvent {
    public readonly eventId: string;
    public readonly occurredOn: Date;
    public abstract readonly eventType: string;
    public abstract readonly aggregateId: string;
    public abstract readonly aggregateType: string;

    constructor() {
        this.eventId = this.generateEventId();
        this.occurredOn = new Date();
    }

    private generateEventId(): string {
        return `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }

    /**
     * Convertit l'evenement en format JSON pour publication
     */
    public abstract toPayload(): Record<string, unknown>;
}