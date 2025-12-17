import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAffectationDto {
  @ApiProperty({ example: 'uuid-equipement' })
  @IsUUID()
  @IsNotEmpty()
  equipementId: string;

  @ApiProperty({ example: 2 })
  @IsNumber()
  @Min(1)
  quantite: number;

  @ApiProperty({ example: 'Service Informatique' })
  @IsString()
  @IsNotEmpty()
  serviceBeneficiaire: string;

  @ApiProperty({ example: 'Jean Dupont' })
  @IsString()
  @IsNotEmpty()
  utilisateurBeneficiaire: string;

  @ApiPropertyOptional({ example: '2024-12-31' })
  @Type(() => Date)
  @IsOptional()
  dateRetourPrevu?: Date;

  @ApiPropertyOptional({ example: 'Affectation pour projet X' })
  @IsString()
  @IsOptional()
  observations?: string;
}
