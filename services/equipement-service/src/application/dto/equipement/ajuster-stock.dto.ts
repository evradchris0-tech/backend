import { IsNumber, IsString, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AjusterStockDto {
  @ApiProperty({ example: 10, description: 'Quantité à ajouter (positif) ou retirer (négatif)' })
  @IsNumber()
  quantite: number;

  @ApiProperty({ example: 'Réapprovisionnement fournisseur XYZ' })
  @IsString()
  motif: string;

  @ApiPropertyOptional({ example: 'BR-2024-001' })
  @IsString()
  @IsOptional()
  reference?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  observations?: string;
}

export class ReserverStockDto {
  @ApiProperty({ example: 5 })
  @IsNumber()
  @Min(1)
  quantite: number;

  @ApiProperty({ example: 'Réservation pour projet X' })
  @IsString()
  motif: string;
}

export class LibererReservationDto {
  @ApiProperty({ example: 5 })
  @IsNumber()
  @Min(1)
  quantite: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  motif?: string;
}
