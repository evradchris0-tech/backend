// src/application/mappers/batiment.mapper.ts

import { Injectable } from '@nestjs/common';
import { Batiment } from '../../domain/entities';
import { TypeBatimentLabels } from '../../domain/enums';
import { BatimentStats } from '../../domain/repositories';
import {
    BatimentListResponseDto,
    BatimentDetailResponseDto,
    BatimentWithStatsResponseDto,
} from '../dtos/batiment';

/**
 * Mapper pour convertir les entites Batiment en DTOs de reponse
 * Centralise la logique de transformation pour maintenir la coherence
 */
@Injectable()
export class BatimentMapper {
    /**
     * Convertit une entite Batiment en DTO de liste (version legere)
     */
    public toListDto(entity: Batiment): BatimentListResponseDto {
        return {
            id: entity.id,
            nom: entity.nom,
            code: entity.code,
            type: entity.type,
            typeLabel: TypeBatimentLabels[entity.type],
            nombreEtages: entity.nombreEtages,
            actif: entity.actif,
            dateCreation: entity.dateCreation,
        };
    }

    /**
     * Convertit plusieurs entites en DTOs de liste
     */
    public toListDtos(entities: Batiment[]): BatimentListResponseDto[] {
        return entities.map(entity => this.toListDto(entity));
    }

    /**
     * Convertit une entite Batiment en DTO de detail (version complete)
     */
    public toDetailDto(entity: Batiment): BatimentDetailResponseDto {
        return {
            id: entity.id,
            nom: entity.nom,
            code: entity.code,
            type: entity.type,
            typeLabel: TypeBatimentLabels[entity.type],
            adresse: entity.adresse,
            coordonnees: entity.coordonnees
                ? {
                      latitude: entity.coordonnees.latitude,
                      longitude: entity.coordonnees.longitude,
                      altitude: entity.coordonnees.altitude,
                  }
                : null,
            nombreEtages: entity.nombreEtages,
            superficie: entity.superficie,
            dateConstruction: entity.dateConstruction,
            description: entity.description,
            planBatiment: entity.planBatiment,
            actif: entity.actif,
            dateCreation: entity.dateCreation,
            dateModification: entity.dateModification,
        };
    }

    /**
     * Convertit une entite avec ses statistiques
     */
    public toWithStatsDto(
        entity: Batiment,
        stats: BatimentStats,
    ): BatimentWithStatsResponseDto {
        const detailDto = this.toDetailDto(entity);
        return {
            ...detailDto,
            stats: {
                nombreEspaces: stats.nombreEspaces,
                nombreEquipements: stats.nombreEquipements,
                nombreEquipementsDefectueux: stats.nombreEquipementsDefectueux,
                nombreEspacesDefectueux: stats.nombreEspacesDefectueux,
                tauxEquipementsEnBonEtat: stats.nombreEquipements > 0
                    ? Math.round(((stats.nombreEquipements - stats.nombreEquipementsDefectueux) / stats.nombreEquipements) * 100)
                    : 100,
            },
        };
    }
}
