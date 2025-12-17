// src/domain/events/espace-defectueux.event.ts

import { BaseDomainEvent } from './domain-event.interface';
import { TypeEspace } from '../enums';

/**
 * Evenement emis lorsqu'un espace devient defectueux ou redevient fonctionnel
 * Utilise pour:
 * - Notifier les administrateurs
 * - Mettre a jour les tableaux de bord
 * - Declencher des alertes si chambre occupee
 */
export class EspaceDefectueuxEvent extends BaseDomainEvent {
    public readonly eventType = 'ESPACE_DEFECTUEUX_CHANGE';
    public readonly aggregateType = 'Espace';

    constructor(
        public readonly aggregateId: string,
        public readonly espaceNumero: string,
        public readonly espaceType: TypeEspace,
        public readonly etageId: string,
        public readonly batimentId: string,
        public readonly devientDefectueux: boolean,
        public readonly nombreEquipementsDefectueux: number,
        public readonly estOccupe: boolean,
        public readonly occupantId: string | null,
    ) {
        super();
    }

    /**
     * Factory method
     */
    public static create(params: {
        espaceId: string;
        espaceNumero: string;
        espaceType: TypeEspace;
        etageId: string;
        batimentId: string;
        devientDefectueux: boolean;
        nombreEquipementsDefectueux: number;
        estOccupe: boolean;
        occupantId: string | null;
    }): EspaceDefectueuxEvent {
        return new EspaceDefectueuxEvent(
            params.espaceId,
            params.espaceNumero,
            params.espaceType,
            params.etageId,
            params.batimentId,
            params.devientDefectueux,
            params.nombreEquipementsDefectueux,
            params.estOccupe,
            params.occupantId,
        );
    }

    /**
     * Verifie si une alerte occupant est necessaire
     */
    public necessiteAlerteOccupant(): boolean {
        return this.devientDefectueux && this.estOccupe && this.occupantId !== null;
    }

    public toPayload(): Record<string, unknown> {
        return {
            eventId: this.eventId,
            eventType: this.eventType,
            occurredOn: this.occurredOn.toISOString(),
            aggregateId: this.aggregateId,
            aggregateType: this.aggregateType,
            data: {
                espaceNumero: this.espaceNumero,
                espaceType: this.espaceType,
                etageId: this.etageId,
                batimentId: this.batimentId,
                devientDefectueux: this.devientDefectueux,
                nombreEquipementsDefectueux: this.nombreEquipementsDefectueux,
                estOccupe: this.estOccupe,
                occupantId: this.occupantId,
            },
        };
    }
}