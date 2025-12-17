// src/application/factories/espace.factory.ts

import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Espace, CreateEspaceParams } from '../../domain/entities';
import { TypeEspace } from '../../domain/enums';
import { CreateEspaceDto } from '../dtos/espace';

/**
 * Factory pour la creation d'entites Espace
 */
@Injectable()
export class EspaceFactory {
    /**
     * Cree une entite Espace a partir d'un DTO
     */
    public create(dto: CreateEspaceDto): Espace {
        const params: CreateEspaceParams = {
            id: uuidv4(),
            etageId: dto.etageId,
            numero: dto.numero.trim(),
            type: dto.type,
            superficie: dto.superficie,
            capacite: dto.capacite,
            description: dto.description?.trim(),
        };

        return Espace.create(params);
    }

    /**
     * Cree plusieurs chambres pour un etage
     * Utile lors de la configuration initiale d'une cite universitaire
     */
    public createChambres(
        etageId: string,
        prefixe: string,
        nombreChambres: number,
        type: TypeEspace = TypeEspace.CHAMBRE_SIMPLE,
        debutNumero: number = 1,
    ): Espace[] {
        const espaces: Espace[] = [];

        for (let i = 0; i < nombreChambres; i++) {
            const numero = `${prefixe}${(debutNumero + i).toString().padStart(2, '0')}`;
            const espace = Espace.create({
                id: uuidv4(),
                etageId,
                numero,
                type,
            });
            espaces.push(espace);
        }

        return espaces;
    }

    /**
     * Genere un numero d'espace selon les conventions
     * Format: [Prefixe Batiment][Etage][Numero] (ex: C201 = Cite U, 2eme etage, chambre 01)
     */
    public generateNumero(
        prefixeBatiment: string,
        numeroEtage: number,
        sequence: number,
    ): string {
        const etageStr = numeroEtage < 0
            ? `S${Math.abs(numeroEtage)}`
            : numeroEtage.toString();
        return `${prefixeBatiment}${etageStr}${sequence.toString().padStart(2, '0')}`;
    }
}