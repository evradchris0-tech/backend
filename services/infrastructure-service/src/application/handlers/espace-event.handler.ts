// src/application/handlers/espace-event.handler.ts

import { Injectable, Inject } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
    IEspaceRepository,
    ESPACE_REPOSITORY,
    IEquipementRepository,
    EQUIPEMENT_REPOSITORY,
} from '../../domain/repositories';
import { EspaceDefectueuxEvent } from '../../domain/events';

/**
 * Handler des evenements lies aux espaces
 * Gere la propagation des changements d'etat
 */
@Injectable()
export class EspaceEventHandler {
    constructor(
        @Inject(ESPACE_REPOSITORY)
        private readonly espaceRepository: IEspaceRepository,
        @Inject(EQUIPEMENT_REPOSITORY)
        private readonly equipementRepository: IEquipementRepository,
    ) {}

    /**
     * Met a jour le flag defectueux d'un espace
     * Declenche quand le statut d'un equipement change
     */
    @OnEvent('espace.defectueux.update.required')
    async handleDefectueuxUpdateRequired(
        payload: { espaceId: string },
    ): Promise<void> {
        const { espaceId } = payload;

        try {
            const espace = await this.espaceRepository.findById(espaceId);
            if (!espace) {
                return;
            }

            // Compter les equipements defectueux
            const nombreDefectueux = await this.equipementRepository.countDefectueuxByEspace(espaceId);
            
            // Mettre a jour l'espace
            espace.mettreAJourEquipementsDefectueux(nombreDefectueux);
            await this.espaceRepository.save(espace);
        } catch (error) {
            console.error(
                `[EspaceEventHandler] Erreur lors de la mise a jour du flag defectueux pour l'espace ${espaceId}:`,
                error,
            );
        }
    }

    /**
     * Gere l'evenement de changement de defectuosite d'un espace
     */
    @OnEvent('espace.defectueux.changed')
    async handleDefectueuxChanged(event: EspaceDefectueuxEvent): Promise<void> {
        // Log pour monitoring
        console.log(
            `[EspaceEventHandler] Espace ${event.espaceNumero} (${event.aggregateId}): ` +
            `devientDefectueux=${event.devientDefectueux}, nombreEquipementsDefectueux=${event.nombreEquipementsDefectueux}`,
        );

        // Si l'espace est occupe et devient defectueux, on pourrait notifier l'occupant
        if (event.necessiteAlerteOccupant()) {
            // TODO: Emettre un evenement vers le notification-service via RabbitMQ
            console.log(
                `[EspaceEventHandler] Alerte necessaire pour l'occupant ${event.occupantId}`,
            );
        }
    }

    /**
     * Gere la creation d'un espace
     */
    @OnEvent('espace.created')
    async handleEspaceCreated(
        payload: { espaceId: string; etageId: string; numero: string; type: string },
    ): Promise<void> {
        console.log(
            `[EspaceEventHandler] Espace cree: ${payload.numero} (${payload.espaceId})`,
        );
    }

    /**
     * Gere l'assignation d'un occupant
     */
    @OnEvent('espace.occupant.assigned')
    async handleOccupantAssigned(
        payload: { espaceId: string; occupantId: string },
    ): Promise<void> {
        console.log(
            `[EspaceEventHandler] Occupant ${payload.occupantId} assigne a l'espace ${payload.espaceId}`,
        );
        // TODO: Emettre evenement vers user-service via RabbitMQ
    }

    /**
     * Gere la liberation d'un espace
     */
    @OnEvent('espace.liberated')
    async handleEspaceLiberated(
        payload: { espaceId: string; ancienOccupantId?: string },
    ): Promise<void> {
        console.log(
            `[EspaceEventHandler] Espace ${payload.espaceId} libere` +
            (payload.ancienOccupantId ? ` (ancien occupant: ${payload.ancienOccupantId})` : ''),
        );
        // TODO: Emettre evenement vers user-service via RabbitMQ
    }
}
