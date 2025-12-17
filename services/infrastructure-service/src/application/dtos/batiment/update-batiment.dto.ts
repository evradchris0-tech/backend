// src/application/dto/batiment/update-batiment.dto.ts

import { PartialType } from '@nestjs/mapped-types';
import { CreateBatimentDto } from './create-batiment.dto';

/**
 * DTO pour mettre a jour un batiment
 * Tous les champs sont optionnels
 */
export class UpdateBatimentDto extends PartialType(CreateBatimentDto) {}