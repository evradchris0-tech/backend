// src/application/mappers/espace.mapper.ts

import { Injectable } from '@nestjs/common';
import { Espace } from '../../domain/entities';
import { TypeEspaceLabels } from '../../domain/enums';
import { Localisation } from '../../domain/value-objects';
import {
    EspaceListResponseDto,
    EspaceDetailResponseDto,
    EspaceWithEquipementsResponseDto,
    LocalisationResponseDto,
} from '../dtos/espace';

/**
 * Informations de localisation pour enrichir les DTOs
 */
export interface LocalisationInfo {
    batimentId: string;
    batimentNom: string;
    batimentCode: string;
    etageId: string;
    etageNumero: number;
    etageDesignation: string;
}

/**
 * DTO leger pour equipement dans espace
 */
export interface EquipementLegerDto {
    id: string;
    type: string;
    typeLabel: string;
    marque: string | null;
    modele: string | null;
    statut: string;
    statutLabel: string;
}

/**
 * Mapper pour convertir les entites Espace en DTOs de reponse
 */
@Injectable()
export class EspaceMapper {
    /**
     * Cree un DTO de localisation
     */
    public createLocalisationDto(
        localisation: LocalisationInfo,
        etageId: string,
        espaceNumero: string,
    ): LocalisationResponseDto {
        return {
            batimentId: localisation.batimentId,
            batimentNom: localisation.batimentNom,
            batimentCode: localisation.batimentCode,
            etageId: etageId,
            etageNumero: localisation.etageNumero,
            etageDesignation: localisation.etageDesignation,
            formatCourt: `${localisation.batimentCode}/${localisation.etageNumero}/${espaceNumero}`,
            formatComplet: `${localisation.batimentNom}, ${localisation.etageDesignation}, ${espaceNumero}`,
        };
    }

    /**
     * Convertit une entite Espace en DTO de liste
     */
    public toListDto(entity: Espace, localisation: LocalisationInfo): EspaceListResponseDto {
        return {
            id: entity.id,
            numero: entity.numero,
            type: entity.type,
            typeLabel: TypeEspaceLabels[entity.type],
            estOccupe: entity.estOccupe,
            aEquipementDefectueux: entity.aEquipementDefectueux,
            nombreEquipementsDefectueux: entity.nombreEquipementsDefectueux,
            actif: entity.actif,
            localisation: this.createLocalisationDto(localisation, entity.etageId, entity.numero),
        };
    }

    /**
     * Convertit plusieurs entites en DTOs de liste
     */
    public toListDtos(entities: Espace[], localisations: Map<string, LocalisationInfo>): EspaceListResponseDto[] {
        return entities.map(entity => {
            const loc = localisations.get(entity.etageId);
            if (!loc) {
                throw new Error(`Localisation non trouvee pour etage ${entity.etageId}`);
            }
            return this.toListDto(entity, loc);
        });
    }

    /**
     * Convertit une entite Espace en DTO de detail
     */
    public toDetailDto(entity: Espace, localisation: LocalisationInfo): EspaceDetailResponseDto {
        return {
            id: entity.id,
            etageId: entity.etageId,
            numero: entity.numero,
            type: entity.type,
            typeLabel: TypeEspaceLabels[entity.type],
            superficie: entity.superficie,
            capacite: entity.capacite,
            description: entity.description,
            estOccupe: entity.estOccupe,
            occupantId: entity.occupantId,
            aEquipementDefectueux: entity.aEquipementDefectueux,
            nombreEquipementsDefectueux: entity.nombreEquipementsDefectueux,
            actif: entity.actif,
            dateCreation: entity.dateCreation,
            dateModification: entity.dateModification,
            localisation: this.createLocalisationDto(localisation, entity.etageId, entity.numero),
        };
    }

    /**
     * Convertit avec la liste des equipements
     */
    public toWithEquipementsDto(
        entity: Espace,
        equipements: EquipementLegerDto[],
        localisation: LocalisationInfo,
    ): EspaceWithEquipementsResponseDto {
        const detailDto = this.toDetailDto(entity, localisation);
        return {
            ...detailDto,
            equipements,
        };
    }
}
