import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EtatAffectation } from '../../../domain/enums';

export class AffectationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  equipementId: string;

  @ApiProperty()
  quantite: number;

  @ApiProperty()
  serviceBeneficiaire: string;

  @ApiProperty()
  utilisateurBeneficiaire: string;

  @ApiProperty()
  dateAffectation: Date;

  @ApiPropertyOptional()
  dateRetourPrevu?: Date;

  @ApiPropertyOptional()
  dateRetourEffectif?: Date;

  @ApiProperty({ enum: EtatAffectation })
  etat: EtatAffectation;

  @ApiPropertyOptional()
  observations?: string;

  @ApiPropertyOptional()
  motifRetrait?: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  isEnRetard: boolean;

  @ApiProperty({ description: 'Durée en jours' })
  dureeAffectation: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class AffectationListResponseDto {
  @ApiProperty({ type: [AffectationResponseDto] })
  data: AffectationResponseDto[];

  @ApiProperty()
  total: number;
}
