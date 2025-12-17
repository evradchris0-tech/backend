// src/application/factories/etage.factory.ts

import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Etage, CreateEtageParams } from '../../domain/entities';
import { CreateEtageDto } from '../dtos/etage';

/**
 * Factory pour la creation d'entites Etage
 */
@Injectable()
export class EtageFactory {
    /**
     * Cree une entite Etage a partir d'un DTO
     */
    public create(dto: CreateEtageDto): Etage {
        const params: CreateEtageParams = {
            id: uuidv4(),
            batimentId: dto.batimentId,
            numero: dto.numero,
            designation: dto.designation,
            superficie: dto.superficie,
            planEtage: dto.planEtage,
        };

        return Etage.create(params);
    }

    /**
     * Cree plusieurs etages pour un batiment
     * Utile lors de l'import initial
     */
    public createMultiple(
        batimentId: string,
        nombreEtages: number,
        avecSousSol: boolean = false,
    ): Etage[] {
        const etages: Etage[] = [];
        const debut = avecSousSol ? -1 : 0;

        for (let i = debut; i < nombreEtages; i++) {
            const etage = Etage.create({
                id: uuidv4(),
                batimentId,
                numero: i,
            });
            etages.push(etage);
        }

        return etages;
    }
}