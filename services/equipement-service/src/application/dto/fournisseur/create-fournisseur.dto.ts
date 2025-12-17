import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class ContactDto {
  @ApiProperty({ example: '+237670000000' })
  @IsString()
  @IsNotEmpty()
  telephone: string;

  @ApiPropertyOptional({ example: 'contact@fournisseur.com' })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: '+237690000000' })
  @IsString()
  @IsOptional()
  telephoneSecondaire?: string;
}

class AdresseDto {
  @ApiPropertyOptional({ example: 'Avenue de la Réunification' })
  @IsString()
  @IsOptional()
  rue?: string;

  @ApiPropertyOptional({ example: 'Bonanjo' })
  @IsString()
  @IsOptional()
  quartier?: string;

  @ApiPropertyOptional({ example: 'Douala' })
  @IsString()
  @IsOptional()
  ville?: string;

  @ApiPropertyOptional({ example: 'Cameroun', default: 'Cameroun' })
  @IsString()
  @IsOptional()
  pays?: string;
}

export class CreateFournisseurDto {
  @ApiProperty({ example: 'Société Générale d\'Équipement' })
  @IsString()
  @IsNotEmpty()
  nom: string;

  @ApiProperty({ type: ContactDto })
  @IsObject()
  @ValidateNested()
  @Type(() => ContactDto)
  contact: ContactDto;

  @ApiPropertyOptional({ type: AdresseDto })
  @IsObject()
  @ValidateNested()
  @Type(() => AdresseDto)
  @IsOptional()
  adresse?: AdresseDto;

  @ApiPropertyOptional({ example: 'Paiement à 30 jours' })
  @IsString()
  @IsOptional()
  conditionsPaiement?: string;
}
