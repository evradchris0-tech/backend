// src/application/dto/espace/update-espace.dto.ts

import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateEspaceDto } from './create-espace.dto';

/**
 * DTO pour mettre a jour un espace
 * L'etageId ne peut pas etre modifie
 */
export class UpdateEspaceDto extends PartialType(
    OmitType(CreateEspaceDto, ['etageId'] as const),
) {}