// src/domain/events/equipement-status-changed.event.ts

import { BaseDomainEvent } from './domain-event.interface';
import { StatutEquipement, TypeEquipement } from '../enums';

/**
 * Evenement emis lorsque le statut d'un equipement change
 * Utilise pour:
 * - Mettre a jour le flag aEquipementDefectueux de l'espace
 * - Notifier les agents de terrain
 * - Mettre a jour les statistiques
 * - Declencher les workflows de maintenance
 */
export class EquipementStatusChangedEvent extends BaseDomainEvent {
    public readonly eventType = 'EQUIPEMENT_STATUS_CHANGED';
    public readonly aggregateType = 'Equipement';

    constructor(
        public readonly aggregateId: string,
        public readonly equipementType: TypeEquipement,
        public readonly ancienStatut: StatutEquipement,
        public readonly nouveauStatut: StatutEquipement,
        public readonly espaceId: string | null,
        public readonly motif: string,
        public readonly devientDefectueux: boolean,
        public readonly devientFonctionnel: boolean,
    ) {
        super();
    }

    /**
     * Factory method pour creer l'evenement depuis un changement de statut
     */
    public static create(params: {
        equipementId: string;
        equipementType: TypeEquipement;
        ancienStatut: StatutEquipement;
        nouveauStatut: StatutEquipement;
        espaceId: string | null;
        motif: string;
        devientDefectueux: boolean;
        devientFonctionnel: boolean;
    }): EquipementStatusChangedEvent {
        return new EquipementStatusChangedEvent(
            params.equipementId,
            params.equipementType,
            params.ancienStatut,
            params.nouveauStatut,
            params.espaceId,
            params.motif,
            params.devientDefectueux,
            params.devientFonctionnel,
        );
    }

    /**
     * Verifie si le changement necessite une notification urgente
     */
    public estUrgent(): boolean {
        return (
            this.nouveauStatut === StatutEquipement.A_REMPLACER ||
            this.nouveauStatut === StatutEquipement.HORS_SERVICE
        );
    }

    /**
     * Verifie si l'equipement est de retour en bon etat
     */
    public estRepare(): boolean {
        return (
            this.ancienStatut !== StatutEquipement.BON_ETAT &&
            this.nouveauStatut === StatutEquipement.BON_ETAT
        );
    }

    public toPayload(): Record<string, unknown> {
        return {
            eventId: this.eventId,
            eventType: this.eventType,
            occurredOn: this.occurredOn.toISOString(),
            aggregateId: this.aggregateId,
            aggregateType: this.aggregateType,
            data: {
                equipementType: this.equipementType,
                ancienStatut: this.ancienStatut,
                nouveauStatut: this.nouveauStatut,
                espaceId: this.espaceId,
                motif: this.motif,
                devientDefectueux: this.devientDefectueux,
                devientFonctionnel: this.devientFonctionnel,
                estUrgent: this.estUrgent(),
            },
        };
    }
}