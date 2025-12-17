// src/application/mappers/etage.mapper.ts

import { Injectable } from '@nestjs/common';
import { Etage } from '../../domain/entities';
import { EtageStats } from '../../domain/repositories';
import {
    EtageListResponseDto,
    EtageDetailResponseDto,
    EtageWithStatsResponseDto,
} from '../dtos/etage';

/**
 * Mapper pour convertir les entites Etage en DTOs de reponse
 */
@Injectable()
export class EtageMapper {
    /**
     * Convertit une entite Etage en DTO de liste
     */
    public toListDto(entity: Etage): EtageListResponseDto {
        return {
            id: entity.id,
            batimentId: entity.batimentId,
            numero: entity.numero,
            designation: entity.designation,
            superficie: entity.superficie,
            actif: entity.actif,
            dateCreation: entity.dateCreation,
        };
    }

    /**
     * Convertit plusieurs entites en DTOs de liste
     */
    public toListDtos(entities: Etage[]): EtageListResponseDto[] {
        return entities.map(entity => this.toListDto(entity));
    }

    /**
     * Convertit une entite Etage en DTO de detail
     */
    public toDetailDto(entity: Etage, batimentNom?: string): EtageDetailResponseDto {
        return {
            id: entity.id,
            batimentId: entity.batimentId,
            batimentNom: batimentNom,
            numero: entity.numero,
            designation: entity.designation,
            superficie: entity.superficie,
            planEtage: entity.planEtage,
            actif: entity.actif,
            dateCreation: entity.dateCreation,
            dateModification: entity.dateModification,
        };
    }

    /**
     * Convertit une entite avec ses statistiques
     */
    public toWithStatsDto(
        entity: Etage,
        stats: EtageStats,
        batimentNom?: string,
    ): EtageWithStatsResponseDto {
        const detailDto = this.toDetailDto(entity, batimentNom);
        return {
            ...detailDto,
            stats: {
                nombreEspaces: stats.nombreEspaces,
                nombreEquipements: stats.nombreEquipements,
                nombreEspacesDefectueux: stats.nombreEspacesDefectueux,
                nombreEquipementsDefectueux: stats.nombreEquipementsDefectueux,
            },
        };
    }
}
