import { MouvementStock } from '../../../domain/entities';
import { Facture, Money } from '../../../domain/value-objects';
import { TypeMouvement } from '../../../domain/enums';
import { MouvementStockOrmEntity } from '../entities';

export class MouvementOrmMapper {
  static toDomain(ormEntity: MouvementStockOrmEntity): MouvementStock {
    const facture =
      ormEntity.factureNumero && ormEntity.factureMontant
        ? new Facture(
            ormEntity.factureNumero,
            new Money(Number(ormEntity.factureMontant), ormEntity.factureDevise),
            ormEntity.factureDate,
            ormEntity.factureFichierUrl,
          )
        : undefined;

    return new MouvementStock({
      id: ormEntity.id,
      equipementId: ormEntity.equipementId,
      typeMouvement: ormEntity.typeMouvement as TypeMouvement,
      quantite: ormEntity.quantite,
      quantiteAvant: ormEntity.quantiteAvant,
      quantiteApres: ormEntity.quantiteApres,
      motif: ormEntity.motif,
      utilisateurId: ormEntity.utilisateurId,
      reference: ormEntity.reference,
      livreur: ormEntity.livreur,
      serviceDestination: ormEntity.serviceDestination,
      dateRetrait: ormEntity.dateRetrait,
      dateReception: ormEntity.dateReception,
      facture,
      observations: ormEntity.observations,
      createdAt: ormEntity.createdAt,
    });
  }

  static toOrm(domain: MouvementStock): MouvementStockOrmEntity {
    const ormEntity = new MouvementStockOrmEntity();

    ormEntity.id = domain.id;
    ormEntity.equipementId = domain.equipementId;
    ormEntity.typeMouvement = domain.typeMouvement;
    ormEntity.quantite = domain.quantite;
    ormEntity.quantiteAvant = domain.quantiteAvant;
    ormEntity.quantiteApres = domain.quantiteApres;
    ormEntity.motif = domain.motif;
    ormEntity.utilisateurId = domain.utilisateurId;
    ormEntity.reference = domain.reference;
    ormEntity.livreur = domain.livreur;
    ormEntity.serviceDestination = domain.serviceDestination;
    ormEntity.dateRetrait = domain.dateRetrait;
    ormEntity.dateReception = domain.dateReception;
    ormEntity.observations = domain.observations;

    if (domain.facture) {
      ormEntity.factureNumero = domain.facture.numero;
      ormEntity.factureMontant = domain.facture.montant.montant;
      ormEntity.factureDevise = domain.facture.montant.devise;
      ormEntity.factureDate = domain.facture.dateFacture;
      ormEntity.factureFichierUrl = domain.facture.fichierUrl;
    }

    ormEntity.createdAt = domain.createdAt;

    return ormEntity;
  }

  static toDomainList(ormEntities: MouvementStockOrmEntity[]): MouvementStock[] {
    return ormEntities.map((e) => this.toDomain(e));
  }
}
