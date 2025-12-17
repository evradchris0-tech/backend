// src/application/mappers/equipement.mapper.ts

import { Injectable } from '@nestjs/common';
import { Equipement, HistoriqueStatut } from '../../domain/entities';
import {
    TypeEquipementLabels,
    StatutEquipementLabels,
    getCategorie,
} from '../../domain/enums';
import { LocalisationResponseDto } from '../dtos/espace';
import {
    EquipementListResponseDto,
    EquipementDetailResponseDto,
    EquipementWithRisqueResponseDto,
    HistoriqueStatutResponseDto,
    PredictionMaintenanceResponseDto,
} from '../dtos/equipement';
import { LocalisationInfo } from './espace.mapper';

/**
 * Mapper pour convertir les entites Equipement en DTOs de reponse
 */
@Injectable()
export class EquipementMapper {
    /**
     * Convertit une entite Equipement en DTO de liste
     */
    public toListDto(entity: Equipement, espaceNumero?: string): EquipementListResponseDto {
        return {
            id: entity.id,
            type: entity.type,
            typeLabel: TypeEquipementLabels[entity.type],
            categorie: getCategorie(entity.type),
            marque: entity.marque,
            modele: entity.modele,
            statut: entity.statut,
            statutLabel: StatutEquipementLabels[entity.statut],
            espaceId: entity.espaceId,
            espaceNumero: espaceNumero ?? null,
            actif: entity.actif,
        };
    }

    /**
     * Convertit plusieurs entites en DTOs de liste
     */
    public toListDtos(entities: Equipement[]): EquipementListResponseDto[] {
        return entities.map(entity => this.toListDto(entity));
    }

    /**
     * Cree un DTO de localisation pour un equipement
     */
    private createLocalisationDto(
        localisation: LocalisationInfo & { espaceNumero: string },
    ): LocalisationResponseDto {
        return {
            batimentId: localisation.batimentId,
            batimentNom: localisation.batimentNom,
            batimentCode: localisation.batimentCode,
            etageId: localisation.etageId,
            etageNumero: localisation.etageNumero,
            etageDesignation: localisation.etageDesignation,
            formatCourt: `${localisation.batimentCode}/${localisation.etageNumero}/${localisation.espaceNumero}`,
            formatComplet: `${localisation.batimentNom}, ${localisation.etageDesignation}, ${localisation.espaceNumero}`,
        };
    }

    /**
     * Convertit une entite Equipement en DTO de detail
     */
    public toDetailDto(
        entity: Equipement,
        localisation?: LocalisationInfo & { espaceNumero: string },
    ): EquipementDetailResponseDto {
        return {
            id: entity.id,
            type: entity.type,
            typeLabel: TypeEquipementLabels[entity.type],
            categorie: getCategorie(entity.type),
            marque: entity.marque,
            modele: entity.modele,
            numeroSerie: entity.numeroSerie,
            statut: entity.statut,
            statutLabel: StatutEquipementLabels[entity.statut],
            espaceId: entity.espaceId,
            dateAcquisition: entity.dateAcquisition,
            valeurAchat: entity.valeurAchat,
            description: entity.description,
            historiquePannes: entity.historiquePannes,
            derniereDatePanne: entity.derniereDatePanne,
            dateInstallation: entity.dateInstallation,
            dateDerniereIntervention: entity.dateDerniereIntervention,
            actif: entity.actif,
            dateCreation: entity.dateCreation,
            dateModification: entity.dateModification,
            localisation: localisation ? this.createLocalisationDto(localisation) : null,
        };
    }

    /**
     * Convertit avec score de risque
     */
    public toWithRisqueDto(
        entity: Equipement,
        localisation?: LocalisationInfo & { espaceNumero: string },
    ): EquipementWithRisqueResponseDto {
        const detailDto = this.toDetailDto(entity, localisation);
        const scoreRisque = entity.calculerScoreRisque();

        return {
            ...detailDto,
            scoreRisque,
            pourcentageVieRestante: entity.getPourcentageVieRestante(),
            tauxPanneAnnuel: entity.getTauxPanneAnnuel(),
            necessiteRemplacement: entity.necessiteRemplacement(),
            facteurRisque: this.determinerFacteursRisque(entity),
            historiqueStatuts: this.toHistoriqueStatutsDtos(entity.historiqueStatuts),
        };
    }

    /**
     * Convertit plusieurs entites avec risque
     */
    public toWithRisqueDtos(
        entities: Equipement[],
    ): EquipementWithRisqueResponseDto[] {
        return entities.map(entity => this.toWithRisqueDto(entity));
    }

    /**
     * Genere une prediction de maintenance
     */
    public toPredictionDto(
        entity: Equipement,
        localisation?: LocalisationInfo & { espaceNumero: string },
    ): PredictionMaintenanceResponseDto {
        const scoreRisque = entity.calculerScoreRisque();

        return {
            equipementId: entity.id,
            type: entity.type,
            typeLabel: TypeEquipementLabels[entity.type],
            localisation: localisation ? this.createLocalisationDto(localisation) : null,
            scoreRisque,
            probabilitePanne: Math.min(scoreRisque / 100, 0.95),
            facteurs: this.determinerFacteursRisque(entity),
            recommandation: this.genererRecommandation(entity, scoreRisque),
        };
    }

    /**
     * Convertit l'historique des statuts
     */
    private toHistoriqueStatutsDtos(
        historique: HistoriqueStatut[],
    ): HistoriqueStatutResponseDto[] {
        return historique.map(h => ({
            ancienStatut: h.ancienStatut,
            nouveauStatut: h.nouveauStatut,
            motif: h.motif,
            date: h.date,
        }));
    }

    /**
     * Identifie les facteurs contribuant au risque
     */
    private determinerFacteursRisque(entity: Equipement): string[] {
        const facteurs: string[] = [];

        const pourcentageVie = entity.getPourcentageVieRestante();
        if (pourcentageVie !== null) {
            if (pourcentageVie <= 0) {
                facteurs.push('Duree de vie estimee depassee');
            } else if (pourcentageVie <= 20) {
                facteurs.push('Fin de vie approchant');
            }
        }

        if (entity.historiquePannes >= 5) {
            facteurs.push(`Historique de pannes eleve (${entity.historiquePannes} pannes)`);
        } else if (entity.historiquePannes >= 3) {
            facteurs.push(`Pannes recurrentes (${entity.historiquePannes} pannes)`);
        }

        if (entity.estDefectueux()) {
            facteurs.push('Equipement actuellement defectueux');
        }

        const tauxPanne = entity.getTauxPanneAnnuel();
        if (tauxPanne !== null && tauxPanne > 2) {
            facteurs.push(`Taux de panne annuel eleve (${tauxPanne.toFixed(1)}/an)`);
        }

        return facteurs;
    }

    /**
     * Genere une recommandation de maintenance
     */
    private genererRecommandation(entity: Equipement, scoreRisque: number): string {
        if (entity.necessiteRemplacement()) {
            return 'Planifier le remplacement de cet equipement';
        }
        if (scoreRisque >= 80) {
            return 'Inspection prioritaire recommandee';
        }
        if (scoreRisque >= 60) {
            return 'Maintenance preventive conseillee';
        }
        if (scoreRisque >= 40) {
            return 'Verification lors de la prochaine ronde';
        }
        return 'Aucune action immediate requise';
    }
}
