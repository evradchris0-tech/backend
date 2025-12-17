import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  TypeEquipement,
  StatutEquipement,
  UniteEquipement,
} from '../../../domain/enums';

class MoneyResponseDto {
  @ApiProperty()
  montant: number;

  @ApiProperty()
  devise: string;
}

class EquipementMetadataResponseDto {
  @ApiPropertyOptional()
  poids?: number;

  @ApiPropertyOptional()
  dimensions?: string;

  @ApiPropertyOptional()
  couleur?: string;

  @ApiPropertyOptional()
  garantieMois?: number;
}

export class EquipementResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  designation: string;

  @ApiProperty()
  reference: string;

  @ApiProperty()
  categorieId: string;

  @ApiProperty({ enum: TypeEquipement })
  typeEquipement: TypeEquipement;

  @ApiPropertyOptional()
  marque?: string;

  @ApiPropertyOptional()
  modele?: string;

  @ApiPropertyOptional()
  numeroSerie?: string;

  @ApiProperty({ enum: StatutEquipement })
  statut: StatutEquipement;

  @ApiPropertyOptional()
  qualite?: string;

  @ApiProperty()
  quantiteStock: number;

  @ApiProperty()
  quantiteMinimale: number;

  @ApiProperty()
  quantiteReservee: number;

  @ApiProperty({ description: 'Quantité réellement disponible (stock - réservé)' })
  quantiteDisponible: number;

  @ApiProperty({ enum: UniteEquipement })
  unite: UniteEquipement;

  @ApiProperty({ type: MoneyResponseDto })
  valeurUnitaire: MoneyResponseDto;

  @ApiProperty({ type: MoneyResponseDto, description: 'Valeur totale du stock' })
  valeurTotaleStock: MoneyResponseDto;

  @ApiPropertyOptional()
  dateAcquisition?: Date;

  @ApiPropertyOptional()
  dureeVieEstimee?: number;

  @ApiPropertyOptional()
  fournisseurId?: string;

  @ApiPropertyOptional()
  espaceStockageId?: string;

  @ApiPropertyOptional()
  observations?: string;

  @ApiPropertyOptional({ type: EquipementMetadataResponseDto })
  metadata?: EquipementMetadataResponseDto;

  @ApiProperty()
  historiquePannes: number;

  @ApiProperty()
  isStockFaible: boolean;

  @ApiProperty()
  isDisponible: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class EquipementListResponseDto {
  @ApiProperty({ type: [EquipementResponseDto] })
  data: EquipementResponseDto[];

  @ApiProperty()
  total: number;

  @ApiPropertyOptional()
  page?: number;

  @ApiPropertyOptional()
  limit?: number;
}
