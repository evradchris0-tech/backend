import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EtatAffectation } from '../../../domain/enums';

export class RetourAffectationDto {
  @ApiProperty({
    enum: [
      EtatAffectation.RETOURNEE,
      EtatAffectation.PERDUE,
      EtatAffectation.ENDOMMAGEE,
    ],
    example: EtatAffectation.RETOURNEE,
  })
  @IsEnum([
    EtatAffectation.RETOURNEE,
    EtatAffectation.PERDUE,
    EtatAffectation.ENDOMMAGEE,
  ])
  etat: EtatAffectation;

  @ApiPropertyOptional({ example: '2024-06-15' })
  @Type(() => Date)
  @IsOptional()
  dateRetour?: Date;

  @ApiPropertyOptional({ example: 'Équipement endommagé - écran fissuré' })
  @IsString()
  @IsOptional()
  motif?: string;
}

export class ProlongerAffectationDto {
  @ApiProperty({ example: '2025-01-31' })
  @Type(() => Date)
  nouvelleDate: Date;

  @ApiPropertyOptional({ example: 'Prolongation pour fin de projet' })
  @IsString()
  @IsOptional()
  motif?: string;
}
