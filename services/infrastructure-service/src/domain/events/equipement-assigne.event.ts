// src/domain/events/equipement-assigne.event.ts

import { BaseDomainEvent } from './domain-event.interface';
import { TypeEquipement } from '../enums';

/**
 * Evenement emis lorsqu'un equipement est assigne ou desassigne d'un espace
 * Utilise pour:
 * - Mettre a jour les compteurs d'equipements de l'espace
 * - Notifier le service de gestion des espaces
 * - Logger l'historique des mouvements d'equipements
 */
export class EquipementAssigneEvent extends BaseDomainEvent {
    public readonly eventType = 'EQUIPEMENT_ASSIGNE';
    public readonly aggregateType = 'Equipement';

    constructor(
        public readonly aggregateId: string,
        public readonly equipementType: TypeEquipement,
        public readonly ancienEspaceId: string | null,
        public readonly nouvelEspaceId: string | null,
        public readonly estAssignation: boolean,
        public readonly equipementNom: string,
    ) {
        super();
    }

    /**
     * Factory method pour creer l'evenement lors d'une assignation
     */
    public static creerAssignation(params: {
        equipementId: string;
        equipementType: TypeEquipement;
        equipementNom: string;
        ancienEspaceId: string | null;
        nouvelEspaceId: string;
    }): EquipementAssigneEvent {
        return new EquipementAssigneEvent(
            params.equipementId,
            params.equipementType,
            params.ancienEspaceId,
            params.nouvelEspaceId,
            true,
            params.equipementNom,
        );
    }

    /**
     * Factory method pour creer l'evenement lors d'une desassignation
     */
    public static creerDesassignation(params: {
        equipementId: string;
        equipementType: TypeEquipement;
        equipementNom: string;
        ancienEspaceId: string;
    }): EquipementAssigneEvent {
        return new EquipementAssigneEvent(
            params.equipementId,
            params.equipementType,
            params.ancienEspaceId,
            null,
            false,
            params.equipementNom,
        );
    }

    /**
     * Factory method pour creer l'evenement lors d'un transfert
     */
    public static creerTransfert(params: {
        equipementId: string;
        equipementType: TypeEquipement;
        equipementNom: string;
        ancienEspaceId: string;
        nouvelEspaceId: string;
    }): EquipementAssigneEvent {
        return new EquipementAssigneEvent(
            params.equipementId,
            params.equipementType,
            params.ancienEspaceId,
            params.nouvelEspaceId,
            true,
            params.equipementNom,
        );
    }

    /**
     * Verifie si c'est un transfert entre deux espaces
     */
    public estTransfert(): boolean {
        return this.ancienEspaceId !== null && this.nouvelEspaceId !== null;
    }

    /**
     * Verifie si c'est une premiere assignation
     */
    public estPremiereAssignation(): boolean {
        return this.ancienEspaceId === null && this.nouvelEspaceId !== null;
    }

    /**
     * Verifie si c'est une desassignation (retour au stock)
     */
    public estDesassignation(): boolean {
        return !this.estAssignation && this.nouvelEspaceId === null;
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
                equipementNom: this.equipementNom,
                ancienEspaceId: this.ancienEspaceId,
                nouvelEspaceId: this.nouvelEspaceId,
                estAssignation: this.estAssignation,
                estTransfert: this.estTransfert(),
                estPremiereAssignation: this.estPremiereAssignation(),
                estDesassignation: this.estDesassignation(),
            },
        };
    }
}
