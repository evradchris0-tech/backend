import { MouvementStock } from '../../domain/entities';
import { Facture, Money } from '../../domain/value-objects';
import {
  CreateMouvementDto,
  MouvementResponseDto,
} from '../dto/mouvement';

export class MouvementMapper {
  static toDomain(
    id: string,
    dto: CreateMouvementDto,
    quantiteAvant: number,
    quantiteApres: number,
  ): MouvementStock {
    const facture = dto.facture
      ? new Facture(
          dto.facture.numero,
          new Money(dto.facture.montant, dto.facture.devise),
          dto.facture.dateFacture,
          dto.facture.fichierUrl,
        )
      : undefined;

    return new MouvementStock({
      id,
      equipementId: dto.equipementId,
      typeMouvement: dto.typeMouvement,
      quantite: dto.quantite,
      quantiteAvant,
      quantiteApres,
      motif: dto.motif,
      utilisateurId: dto.utilisateurId,
      reference: dto.reference,
      livreur: dto.livreur,
      serviceDestination: dto.serviceDestination,
      dateRetrait: dto.dateRetrait,
      dateReception: dto.dateReception,
      facture,
      observations: dto.observations,
    });
  }

  static toDto(mouvement: MouvementStock): MouvementResponseDto {
    return {
      id: mouvement.id,
      equipementId: mouvement.equipementId,
      typeMouvement: mouvement.typeMouvement,
      quantite: mouvement.quantite,
      quantiteAvant: mouvement.quantiteAvant,
      quantiteApres: mouvement.quantiteApres,
      motif: mouvement.motif,
      reference: mouvement.reference,
      livreur: mouvement.livreur,
      serviceDestination: mouvement.serviceDestination,
      utilisateurId: mouvement.utilisateurId,
      dateRetrait: mouvement.dateRetrait,
      dateReception: mouvement.dateReception,
      facture: mouvement.facture
        ? {
            numero: mouvement.facture.numero,
            montant: mouvement.facture.montant.montant,
            devise: mouvement.facture.montant.devise,
            dateFacture: mouvement.facture.dateFacture,
            fichierUrl: mouvement.facture.fichierUrl,
          }
        : undefined,
      observations: mouvement.observations,
      isEntree: mouvement.isEntree(),
      isSortie: mouvement.isSortie(),
      isTransfert: mouvement.isTransfert(),
      createdAt: mouvement.createdAt,
    };
  }

  static toDtoList(mouvements: MouvementStock[]): MouvementResponseDto[] {
    return mouvements.map((m) => this.toDto(m));
  }
}
