import { Fournisseur } from '../../domain/entities';
import { Contact, Adresse } from '../../domain/value-objects';
import {
  CreateFournisseurDto,
  FournisseurResponseDto,
} from '../dto/fournisseur';

export class FournisseurMapper {
  static toDomain(id: string, dto: CreateFournisseurDto): Fournisseur {
    const contact = new Contact(
      dto.contact.telephone,
      dto.contact.email,
      dto.contact.telephoneSecondaire,
    );

    const adresse = dto.adresse
      ? new Adresse(
          dto.adresse.rue,
          dto.adresse.quartier,
          dto.adresse.ville,
          dto.adresse.pays,
        )
      : undefined;

    return new Fournisseur({
      id,
      nom: dto.nom,
      contact,
      adresse,
      conditionsPaiement: dto.conditionsPaiement,
    });
  }

  static toDto(fournisseur: Fournisseur): FournisseurResponseDto {
    return {
      id: fournisseur.id,
      nom: fournisseur.nom,
      contact: {
        telephone: fournisseur.contact.telephone,
        email: fournisseur.contact.email,
        telephoneSecondaire: fournisseur.contact.telephoneSecondaire,
      },
      adresse: fournisseur.adresse
        ? {
            rue: fournisseur.adresse.rue,
            quartier: fournisseur.adresse.quartier,
            ville: fournisseur.adresse.ville,
            pays: fournisseur.adresse.pays,
          }
        : undefined,
      conditionsPaiement: fournisseur.conditionsPaiement,
      estActif: fournisseur.estActif,
      createdAt: fournisseur.createdAt,
      updatedAt: fournisseur.updatedAt,
    };
  }

  static toDtoList(fournisseurs: Fournisseur[]): FournisseurResponseDto[] {
    return fournisseurs.map((f) => this.toDto(f));
  }
}
