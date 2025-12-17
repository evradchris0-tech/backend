import { Fournisseur } from '../../../domain/entities';
import { Contact, Adresse } from '../../../domain/value-objects';
import { FournisseurOrmEntity } from '../entities';

export class FournisseurOrmMapper {
  static toDomain(ormEntity: FournisseurOrmEntity): Fournisseur {
    const contact = new Contact(
      ormEntity.contactTelephone,
      ormEntity.contactEmail,
      ormEntity.contactTelephoneSecondaire,
    );

    const adresse =
      ormEntity.adresseRue ||
      ormEntity.adresseQuartier ||
      ormEntity.adresseVille
        ? new Adresse(
            ormEntity.adresseRue,
            ormEntity.adresseQuartier,
            ormEntity.adresseVille,
            ormEntity.adressePays,
          )
        : undefined;

    return new Fournisseur({
      id: ormEntity.id,
      nom: ormEntity.nom,
      contact,
      adresse,
      conditionsPaiement: ormEntity.conditionsPaiement,
      estActif: ormEntity.estActif,
      createdAt: ormEntity.createdAt,
      updatedAt: ormEntity.updatedAt,
    });
  }

  static toOrm(domain: Fournisseur): FournisseurOrmEntity {
    const ormEntity = new FournisseurOrmEntity();

    ormEntity.id = domain.id;
    ormEntity.nom = domain.nom;
    ormEntity.contactTelephone = domain.contact.telephone;
    ormEntity.contactEmail = domain.contact.email;
    ormEntity.contactTelephoneSecondaire = domain.contact.telephoneSecondaire;

    if (domain.adresse) {
      ormEntity.adresseRue = domain.adresse.rue;
      ormEntity.adresseQuartier = domain.adresse.quartier;
      ormEntity.adresseVille = domain.adresse.ville;
      ormEntity.adressePays = domain.adresse.pays;
    }

    ormEntity.conditionsPaiement = domain.conditionsPaiement;
    ormEntity.estActif = domain.estActif;
    ormEntity.createdAt = domain.createdAt;
    ormEntity.updatedAt = domain.updatedAt;

    return ormEntity;
  }

  static toDomainList(ormEntities: FournisseurOrmEntity[]): Fournisseur[] {
    return ormEntities.map((e) => this.toDomain(e));
  }
}
