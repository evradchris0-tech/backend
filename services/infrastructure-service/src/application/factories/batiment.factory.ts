// src/application/factories/batiment.factory.ts

import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Batiment, CreateBatimentParams } from '../../domain/entities';
import { Coordonnees } from '../../domain/value-objects';
import { CreateBatimentDto } from '../dtos/batiment';

/**
 * Factory pour la creation d'entites Batiment
 * Applique le pattern Factory pour encapsuler la logique de creation complexe
 */
@Injectable()
export class BatimentFactory {
    /**
     * Cree une entite Batiment a partir d'un DTO
     */
    public create(dto: CreateBatimentDto): Batiment {
        const params: CreateBatimentParams = {
            id: uuidv4(),
            nom: dto.nom.trim(),
            code: dto.code.toUpperCase().trim(),
            type: dto.type,
            adresse: dto.adresse?.trim(),
            coordonnees: this.createCoordonnees(dto.coordonnees),
            nombreEtages: dto.nombreEtages ?? 1,
            superficie: dto.superficie,
            dateConstruction: dto.dateConstruction
                ? new Date(dto.dateConstruction)
                : undefined,
            description: dto.description?.trim(),
            planBatiment: dto.planBatiment,
        };

        return Batiment.create(params);
    }

    /**
     * Cree un Value Object Coordonnees a partir du DTO
     */
    private createCoordonnees(
        dto?: { latitude: number; longitude: number; altitude?: number },
    ): Coordonnees | undefined {
        if (!dto) {
            return undefined;
        }
        return Coordonnees.create(dto.latitude, dto.longitude, dto.altitude);
    }

    /**
     * Genere un code unique pour un batiment
     * Format: TYPE-XXX (ex: CITE-001, PED-002)
     */
    public generateCode(type: string, sequence: number): string {
        const prefixes: Record<string, string> = {
            PEDAGOGIQUE: 'PED',
            ADMINISTRATIF: 'ADM',
            CITE_UNIVERSITAIRE: 'CITE',
            RESIDENCE_PERSONNEL: 'RES',
            MIXTE: 'MIX',
        };
        const prefix = prefixes[type] || 'BAT';
        return `${prefix}-${sequence.toString().padStart(3, '0')}`;
    }
}