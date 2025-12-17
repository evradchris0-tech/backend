import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TypeMouvement } from '../../../domain/enums';

class FactureResponseDto {
  @ApiProperty()
  numero: string;

  @ApiProperty()
  montant: number;

  @ApiProperty()
  devise: string;

  @ApiProperty()
  dateFacture: Date;

  @ApiPropertyOptional()
  fichierUrl?: string;
}

export class MouvementResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  equipementId: string;

  @ApiProperty({ enum: TypeMouvement })
  typeMouvement: TypeMouvement;

  @ApiProperty()
  quantite: number;

  @ApiProperty()
  quantiteAvant: number;

  @ApiProperty()
  quantiteApres: number;

  @ApiProperty()
  motif: string;

  @ApiPropertyOptional()
  reference?: string;

  @ApiPropertyOptional()
  livreur?: string;

  @ApiPropertyOptional()
  serviceDestination?: string;

  @ApiProperty()
  utilisateurId: string;

  @ApiPropertyOptional()
  dateRetrait?: Date;

  @ApiPropertyOptional()
  dateReception?: Date;

  @ApiPropertyOptional({ type: FactureResponseDto })
  facture?: FactureResponseDto;

  @ApiPropertyOptional()
  observations?: string;

  @ApiProperty()
  isEntree: boolean;

  @ApiProperty()
  isSortie: boolean;

  @ApiProperty()
  isTransfert: boolean;

  @ApiProperty()
  createdAt: Date;
}

export class MouvementListResponseDto {
  @ApiProperty({ type: [MouvementResponseDto] })
  data: MouvementResponseDto[];

  @ApiProperty()
  total: number;
}
