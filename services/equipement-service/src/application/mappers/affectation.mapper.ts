import { Affectation } from '../../domain/entities';
import {
  CreateAffectationDto,
  AffectationResponseDto,
} from '../dto/affectation';

export class AffectationMapper {
  static toDomain(id: string, dto: CreateAffectationDto): Affectation {
    return new Affectation({
      id,
      equipementId: dto.equipementId,
      quantite: dto.quantite,
      serviceBeneficiaire: dto.serviceBeneficiaire,
      utilisateurBeneficiaire: dto.utilisateurBeneficiaire,
      dateRetourPrevu: dto.dateRetourPrevu,
      observations: dto.observations,
    });
  }

  static toDto(affectation: Affectation): AffectationResponseDto {
    return {
      id: affectation.id,
      equipementId: affectation.equipementId,
      quantite: affectation.quantite,
      serviceBeneficiaire: affectation.serviceBeneficiaire,
      utilisateurBeneficiaire: affectation.utilisateurBeneficiaire,
      dateAffectation: affectation.dateAffectation,
      dateRetourPrevu: affectation.dateRetourPrevu,
      dateRetourEffectif: affectation.dateRetourEffectif,
      etat: affectation.etat,
      observations: affectation.observations,
      motifRetrait: affectation.motifRetrait,
      isActive: affectation.isActive(),
      isEnRetard: affectation.isEnRetard(),
      dureeAffectation: affectation.getDureeAffectation(),
      createdAt: affectation.createdAt,
      updatedAt: affectation.updatedAt,
    };
  }

  static toDtoList(affectations: Affectation[]): AffectationResponseDto[] {
    return affectations.map((a) => this.toDto(a));
  }
}
