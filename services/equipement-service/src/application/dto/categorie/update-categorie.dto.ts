import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateCategorieDto } from './create-categorie.dto';

export class UpdateCategorieDto extends PartialType(
  OmitType(CreateCategorieDto, ['code'] as const),
) {}
