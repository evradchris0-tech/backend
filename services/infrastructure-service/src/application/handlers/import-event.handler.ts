// src/application/handlers/import-event.handler.ts

import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

/**
 * Handler des evenements lies aux imports Excel
 * Gere le logging et le monitoring des operations d'import
 */
@Injectable()
export class ImportEventHandler {
    /**
     * Gere le debut d'un import
     */
    @OnEvent('import.started')
    handleImportStarted(
        payload: { type: string; nombreLignes: number },
    ): void {
        console.log(
            `[ImportEventHandler] Debut import ${payload.type}: ${payload.nombreLignes} lignes a traiter`,
        );
    }

    /**
     * Gere la fin d'un import
     */
    @OnEvent('import.completed')
    handleImportCompleted(payload: {
        type: string;
        success: boolean;
        lignesTraitees: number;
        lignesSucces: number;
        lignesErreur: number;
        duration: number;
    }): void {
        const status = payload.success ? 'SUCCES' : 'PARTIEL';
        const errorRate = payload.lignesTraitees > 0
            ? ((payload.lignesErreur / payload.lignesTraitees) * 100).toFixed(1)
            : '0';

        console.log(
            `[ImportEventHandler] Import ${payload.type} termine (${status}):`,
        );
        console.log(`  - Lignes traitees: ${payload.lignesTraitees}`);
        console.log(`  - Succes: ${payload.lignesSucces}`);
        console.log(`  - Erreurs: ${payload.lignesErreur} (${errorRate}%)`);
        console.log(`  - Duree: ${payload.duration}ms`);

        // TODO: Emettre vers analytics-service via RabbitMQ pour historisation
    }

    /**
     * Gere une erreur d'import critique
     */
    @OnEvent('import.error')
    handleImportError(payload: {
        type: string;
        error: string;
        ligne?: number;
    }): void {
        console.error(
            `[ImportEventHandler] Erreur import ${payload.type}` +
            (payload.ligne ? ` (ligne ${payload.ligne})` : '') +
            `: ${payload.error}`,
        );
    }
}