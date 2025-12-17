import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TypeEquipement, UniteEquipement } from '../../../domain/enums';

class MoneyDto {
  @ApiProperty({ example: 50000, description: 'Montant' })
  @IsNumber()
  @Min(0)
  montant: number;

  @ApiPropertyOptional({ example: 'FCFA', default: 'FCFA' })
  @IsString()
  @IsOptional()
  devise?: string;
}

class EquipementMetadataDto {
  @ApiPropertyOptional({ example: 5.5, description: 'Poids en kg' })
  @IsNumber()
  @IsOptional()
  poids?: number;

  @ApiPropertyOptional({ example: '50x40x30 cm' })
  @IsString()
  @IsOptional()
  dimensions?: string;

  @ApiPropertyOptional({ example: 'Noir' })
  @IsString()
  @IsOptional()
  couleur?: string;

  @ApiPropertyOptional({ example: 24, description: 'Garantie en mois' })
  @IsNumber()
  @IsOptional()
  garantieMois?: number;
}

export class CreateEquipementDto {
  @ApiProperty({ example: 'Ordinateur portable Dell Latitude 5420' })
  @IsString()
  @IsNotEmpty()
  designation: string;

  @ApiProperty({ example: 'EQ-2024-001' })
  @IsString()
  @IsNotEmpty()
  reference: string;

  @ApiProperty({ example: 'uuid-categorie' })
  @IsUUID()
  @IsNotEmpty()
  categorieId: string;

  @ApiProperty({ enum: TypeEquipement, example: TypeEquipement.INFORMATIQUE })
  @IsEnum(TypeEquipement)
  @IsNotEmpty()
  typeEquipement: TypeEquipement;

  @ApiPropertyOptional({ example: 'Dell' })
  @IsString()
  @IsOptional()
  marque?: string;

  @ApiPropertyOptional({ example: 'Latitude 5420' })
  @IsString()
  @IsOptional()
  modele?: string;

  @ApiPropertyOptional({ example: 'SN123456789' })
  @IsString()
  @IsOptional()
  numeroSerie?: string;

  @ApiPropertyOptional({ example: 'Neuf' })
  @IsString()
  @IsOptional()
  qualite?: string;

  @ApiProperty({ example: 10, description: 'Quantité en stock' })
  @IsNumber()
  @Min(0)
  quantiteStock: number;

  @ApiProperty({ example: 2, description: 'Seuil alerte stock faible' })
  @IsNumber()
  @Min(0)
  quantiteMinimale: number;

  @ApiProperty({ enum: UniteEquipement, example: UniteEquipement.PIECE })
  @IsEnum(UniteEquipement)
  @IsNotEmpty()
  unite: UniteEquipement;

  @ApiProperty({ type: MoneyDto })
  @IsObject()
  @ValidateNested()
  @Type(() => MoneyDto)
  valeurUnitaire: MoneyDto;

  @ApiPropertyOptional({ example: '2024-01-15' })
  @IsOptional()
  @Type(() => Date)
  dateAcquisition?: Date;

  @ApiPropertyOptional({ example: 60, description: 'Durée de vie estimée en mois' })
  @IsNumber()
  @IsOptional()
  dureeVieEstimee?: number;

  @ApiPropertyOptional({ example: 'uuid-fournisseur' })
  @IsUUID()
  @IsOptional()
  fournisseurId?: string;

  @ApiPropertyOptional({ example: 'uuid-espace' })
  @IsUUID()
  @IsOptional()
  espaceStockageId?: string;

  @ApiPropertyOptional({ example: 'Matériel neuf, bon état' })
  @IsString()
  @IsOptional()
  observations?: string;

  @ApiPropertyOptional({ type: EquipementMetadataDto })
  @IsObject()
  @ValidateNested()
  @Type(() => EquipementMetadataDto)
  @IsOptional()
  metadata?: EquipementMetadataDto;
}
