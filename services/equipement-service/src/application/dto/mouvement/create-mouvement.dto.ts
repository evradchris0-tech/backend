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
import { TypeMouvement } from '../../../domain/enums';

class FactureDto {
  @ApiProperty({ example: 'FACT-2024-001' })
  @IsString()
  @IsNotEmpty()
  numero: string;

  @ApiProperty({ example: 500000 })
  @IsNumber()
  @Min(0)
  montant: number;

  @ApiProperty({ example: 'FCFA', default: 'FCFA' })
  @IsString()
  devise: string;

  @ApiProperty({ example: '2024-01-15' })
  @Type(() => Date)
  dateFacture: Date;

  @ApiPropertyOptional({ example: 'https://storage.com/factures/fact-001.pdf' })
  @IsString()
  @IsOptional()
  fichierUrl?: string;
}

export class CreateMouvementDto {
  @ApiProperty({ example: 'uuid-equipement' })
  @IsUUID()
  @IsNotEmpty()
  equipementId: string;

  @ApiProperty({ enum: TypeMouvement, example: TypeMouvement.ENTREE_ACHAT })
  @IsEnum(TypeMouvement)
  @IsNotEmpty()
  typeMouvement: TypeMouvement;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(1)
  quantite: number;

  @ApiProperty({ example: 'Réapprovisionnement mensuel' })
  @IsString()
  @IsNotEmpty()
  motif: string;

  @ApiProperty({ example: 'uuid-utilisateur' })
  @IsUUID()
  @IsNotEmpty()
  utilisateurId: string;

  @ApiPropertyOptional({ example: 'BR-2024-001' })
  @IsString()
  @IsOptional()
  reference?: string;

  @ApiPropertyOptional({ example: 'SARL Transport Services' })
  @IsString()
  @IsOptional()
  livreur?: string;

  @ApiPropertyOptional({ example: 'Service Informatique' })
  @IsString()
  @IsOptional()
  serviceDestination?: string;

  @ApiPropertyOptional({ example: '2024-01-15' })
  @Type(() => Date)
  @IsOptional()
  dateRetrait?: Date;

  @ApiPropertyOptional({ example: '2024-01-15' })
  @Type(() => Date)
  @IsOptional()
  dateReception?: Date;

  @ApiPropertyOptional({ type: FactureDto })
  @IsObject()
  @ValidateNested()
  @Type(() => FactureDto)
  @IsOptional()
  facture?: FactureDto;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  observations?: string;
}
