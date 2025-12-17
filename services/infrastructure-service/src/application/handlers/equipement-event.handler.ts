// src/application/handlers/equipement-event.handler.ts

import { Injectable, Inject } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
    IEquipementRepository,
    EQUIPEMENT_REPOSITORY,
    IEspaceRepository,
    ESPACE_REPOSITORY,
} from '../../domain/repositories';
import {
    EquipementStatusChangedEvent,
    EquipementAssigneEvent,
} from '../../domain/events';

/**
 * Handler des evenements lies aux equipements
 * Gere les effets de bord des changements d'etat
 */
@Injectable()
export class EquipementEventHandler {
    constructor(
        @Inject(EQUIPEMENT_REPOSITORY)
        private readonly equipementRepository: IEquipementRepository,
        @Inject(ESPACE_REPOSITORY)
        private readonly espaceRepository: IEspaceRepository,
        private readonly eventEmitter: EventEmitter2,
    ) {}

    /**
     * Gere le changement de statut d'un equipement
     */
    @OnEvent('equipement.status.changed')
    async handleStatusChanged(event: EquipementStatusChangedEvent): Promise<void> {
        console.log(
            `[EquipementEventHandler] Equipement ${event.aggregateId}: ` +
            `${event.ancienStatut} -> ${event.nouveauStatut}` +
            (event.motif ? ` (${event.motif})` : ''),
        );

        // Si l'equipement est assigne a un espace, propager le changement
        if (event.espaceId) {
            // Demander la mise a jour du flag defectueux de l'espace
            this.eventEmitter.emit('espace.defectueux.update.required', {
                espaceId: event.espaceId,
            });
        }

        // Si le statut est critique, emettre une alerte
        if (event.estUrgent()) {
            console.log(
                `[EquipementEventHandler] ALERTE: Equipement ${event.aggregateId} en statut critique (${event.nouveauStatut})`,
            );
            // TODO: Emettre vers notification-service via RabbitMQ
        }

        // Si l'equipement vient d'etre repare
        if (event.estRepare()) {
            console.log(
                `[EquipementEventHandler] Equipement ${event.aggregateId} repare avec succes`,
            );
        }

        // Statistiques: emettre evenement pour analytics
        this.eventEmitter.emit('analytics.equipement.status.changed', {
            equipementId: event.aggregateId,
            type: event.equipementType,
            ancienStatut: event.ancienStatut,
            nouveauStatut: event.nouveauStatut,
            espaceId: event.espaceId,
            timestamp: event.occurredOn,
        });
    }

    /**
     * Gere l'assignation d'un equipement a un espace
     */
    @OnEvent('equipement.assigned')
    async handleEquipementAssigned(event: EquipementAssigneEvent): Promise<void> {
        console.log(
            `[EquipementEventHandler] Equipement ${event.aggregateId} assigne a l'espace ${event.nouvelEspaceId}` +
            (event.ancienEspaceId ? ` (depuis ${event.ancienEspaceId})` : ''),
        );

        // Mettre a jour le flag defectueux du nouvel espace
        if (event.nouvelEspaceId) {
            this.eventEmitter.emit('espace.defectueux.update.required', {
                espaceId: event.nouvelEspaceId,
            });
        }

        // Si l'equipement etait assigne ailleurs, mettre a jour l'ancien espace aussi
        if (event.ancienEspaceId) {
            this.eventEmitter.emit('espace.defectueux.update.required', {
                espaceId: event.ancienEspaceId,
            });
        }
    }

    /**
     * Gere le retrait d'un equipement d'un espace
     */
    @OnEvent('equipement.removed')
    async handleEquipementRemoved(event: EquipementAssigneEvent): Promise<void> {
        console.log(
            `[EquipementEventHandler] Equipement ${event.aggregateId} retire de l'espace ${event.ancienEspaceId}`,
        );

        // Mettre a jour le flag defectueux de l'ancien espace
        if (event.ancienEspaceId) {
            this.eventEmitter.emit('espace.defectueux.update.required', {
                espaceId: event.ancienEspaceId,
            });
        }
    }

    /**
     * Gere la creation d'un equipement
     */
    @OnEvent('equipement.created')
    async handleEquipementCreated(
        payload: { equipementId: string; type: string; espaceId?: string },
    ): Promise<void> {
        console.log(
            `[EquipementEventHandler] Equipement cree: ${payload.type} (${payload.equipementId})` +
            (payload.espaceId ? ` dans l'espace ${payload.espaceId}` : ''),
        );
    }

    /**
     * Gere la creation d'un lot d'equipements
     */
    @OnEvent('equipements.created')
    async handleEquipementsCreated(
        payload: { type: string; quantite: number },
    ): Promise<void> {
        console.log(
            `[EquipementEventHandler] ${payload.quantite} equipement(s) de type ${payload.type} cree(s)`,
        );
    }

    /**
     * Gere la creation d'un kit d'equipements
     */
    @OnEvent('equipements.kit.created')
    async handleKitCreated(
        payload: { espaceId: string; type: string; quantite: number },
    ): Promise<void> {
        console.log(
            `[EquipementEventHandler] Kit ${payload.type} cree pour l'espace ${payload.espaceId} (${payload.quantite} equipements)`,
        );

        // Mettre a jour le flag defectueux de l'espace
        this.eventEmitter.emit('espace.defectueux.update.required', {
            espaceId: payload.espaceId,
        });
    }

    /**
     * Gere la suppression d'un equipement
     */
    @OnEvent('equipement.deleted')
    async handleEquipementDeleted(
        payload: { equipementId: string; type: string; espaceId?: string },
    ): Promise<void> {
        console.log(
            `[EquipementEventHandler] Equipement supprime: ${payload.type} (${payload.equipementId})`,
        );

        // Si l'equipement etait assigne, mettre a jour l'espace
        if (payload.espaceId) {
            this.eventEmitter.emit('espace.defectueux.update.required', {
                espaceId: payload.espaceId,
            });
        }
    }
}
