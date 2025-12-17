import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateEquipementDto } from './create-equipement.dto';

/**
 * DTO pour mise à jour d'un équipement
 * Tous les champs sont optionnels sauf ceux omis (reference, categorieId, typeEquipement)
 */
export class UpdateEquipementDto extends PartialType(
  OmitType(CreateEquipementDto, [
    'reference',
    'categorieId',
    'typeEquipement',
    'quantiteStock',
  ] as const),
) {}
