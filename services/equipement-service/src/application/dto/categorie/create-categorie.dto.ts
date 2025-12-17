import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategorieDto {
  @ApiProperty({ example: 'CAT-INFO-001' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'Matériel Informatique' })
  @IsString()
  @IsNotEmpty()
  libelle: string;

  @ApiPropertyOptional({ example: 'Ordinateurs, imprimantes, accessoires IT' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'uuid-parent', description: 'ID de la catégorie parente (pour sous-catégories)' })
  @IsUUID()
  @IsOptional()
  categorieParentId?: string;
}
