import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class ContactResponseDto {
  @ApiProperty()
  telephone: string;

  @ApiPropertyOptional()
  email?: string;

  @ApiPropertyOptional()
  telephoneSecondaire?: string;
}

class AdresseResponseDto {
  @ApiPropertyOptional()
  rue?: string;

  @ApiPropertyOptional()
  quartier?: string;

  @ApiPropertyOptional()
  ville?: string;

  @ApiProperty()
  pays: string;
}

export class FournisseurResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  nom: string;

  @ApiProperty({ type: ContactResponseDto })
  contact: ContactResponseDto;

  @ApiPropertyOptional({ type: AdresseResponseDto })
  adresse?: AdresseResponseDto;

  @ApiPropertyOptional()
  conditionsPaiement?: string;

  @ApiProperty()
  estActif: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class FournisseurListResponseDto {
  @ApiProperty({ type: [FournisseurResponseDto] })
  data: FournisseurResponseDto[];

  @ApiProperty()
  total: number;
}
