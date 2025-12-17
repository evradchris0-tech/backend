import { Affectation } from '../../../domain/entities';
import { EtatAffectation } from '../../../domain/enums';
import { AffectationOrmEntity } from '../entities';

export class AffectationOrmMapper {
  static toDomain(ormEntity: AffectationOrmEntity): Affectation {
    return new Affectation({
      id: ormEntity.id,
      equipementId: ormEntity.equipementId,
      quantite: ormEntity.quantite,
      serviceBeneficiaire: ormEntity.serviceBeneficiaire,
      utilisateurBeneficiaire: ormEntity.utilisateurBeneficiaire,
      dateAffectation: ormEntity.dateAffectation,
      dateRetourPrevu: ormEntity.dateRetourPrevu,
      dateRetourEffectif: ormEntity.dateRetourEffectif,
      etat: ormEntity.etat as EtatAffectation,
      observations: ormEntity.observations,
      motifRetrait: ormEntity.motifRetrait,
      createdAt: ormEntity.createdAt,
      updatedAt: ormEntity.updatedAt,
    });
  }

  static toOrm(domain: Affectation): AffectationOrmEntity {
    const ormEntity = new AffectationOrmEntity();

    ormEntity.id = domain.id;
    ormEntity.equipementId = domain.equipementId;
    ormEntity.quantite = domain.quantite;
    ormEntity.serviceBeneficiaire = domain.serviceBeneficiaire;
    ormEntity.utilisateurBeneficiaire = domain.utilisateurBeneficiaire;
    ormEntity.dateAffectation = domain.dateAffectation;
    ormEntity.dateRetourPrevu = domain.dateRetourPrevu;
    ormEntity.dateRetourEffectif = domain.dateRetourEffectif;
    ormEntity.etat = domain.etat;
    ormEntity.observations = domain.observations;
    ormEntity.motifRetrait = domain.motifRetrait;
    ormEntity.createdAt = domain.createdAt;
    ormEntity.updatedAt = domain.updatedAt;

    return ormEntity;
  }

  static toDomainList(ormEntities: AffectationOrmEntity[]): Affectation[] {
    return ormEntities.map((e) => this.toDomain(e));
  }
}
