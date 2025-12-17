import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CategorieResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  libelle: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional()
  categorieParentId?: string;

  @ApiProperty()
  estActif: boolean;

  @ApiProperty()
  isRacine: boolean;

  @ApiProperty()
  isSousCategorie: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class CategorieListResponseDto {
  @ApiProperty({ type: [CategorieResponseDto] })
  data: CategorieResponseDto[];

  @ApiProperty()
  total: number;
}

export class CategorieArborescenceDto extends CategorieResponseDto {
  @ApiPropertyOptional({ type: [CategorieArborescenceDto] })
  enfants?: CategorieArborescenceDto[];
}
