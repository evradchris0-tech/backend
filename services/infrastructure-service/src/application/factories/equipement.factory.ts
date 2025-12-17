// src/application/factories/equipement.factory.ts

import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Equipement, CreateEquipementParams } from '../../domain/entities';
import { TypeEquipement } from '../../domain/enums';
import { CreateEquipementDto } from '../dtos/equipement';

/**
 * Factory pour la creation d'entites Equipement
 */
@Injectable()
export class EquipementFactory {
    /**
     * Cree une entite Equipement a partir d'un DTO
     */
    public create(dto: CreateEquipementDto): Equipement {
        const params: CreateEquipementParams = {
            id: uuidv4(),
            type: dto.type,
            marque: dto.marque?.trim(),
            modele: dto.modele?.trim(),
            numeroSerie: dto.numeroSerie?.trim(),
            espaceId: dto.espaceId,
            dateAcquisition: dto.dateAcquisition
                ? new Date(dto.dateAcquisition)
                : undefined,
            valeurAchat: dto.valeurAchat,
            description: dto.description?.trim(),
        };

        return Equipement.create(params);
    }

    /**
     * Cree un lot d'equipements du meme type
     * Utile pour l'equipement initial de plusieurs espaces
     */
    public createLot(
        type: TypeEquipement,
        quantite: number,
        marque?: string,
        modele?: string,
        dateAcquisition?: Date,
        valeurUnitaire?: number,
    ): Equipement[] {
        const equipements: Equipement[] = [];

        for (let i = 0; i < quantite; i++) {
            const equipement = Equipement.create({
                id: uuidv4(),
                type,
                marque,
                modele,
                dateAcquisition,
                valeurAchat: valeurUnitaire,
            });
            equipements.push(equipement);
        }

        return equipements;
    }

    /**
     * Cree un kit standard d'equipements pour une chambre
     * Selon le cahier des charges: lit, table, chaise, armoire
     */
    public createKitChambre(dateAcquisition?: Date): Equipement[] {
        const typesKit: TypeEquipement[] = [
            TypeEquipement.LIT,
            TypeEquipement.TABLE,
            TypeEquipement.CHAISE,
            TypeEquipement.ARMOIRE,
            TypeEquipement.LAMPE,
            TypeEquipement.PRISE_ELECTRIQUE,
        ];

        return typesKit.map(type => Equipement.create({
            id: uuidv4(),
            type,
            dateAcquisition,
        }));
    }

    /**
     * Cree un kit standard d'equipements pour une salle de classe
     */
    public createKitSalleClasse(
        nombrePlaces: number,
        dateAcquisition?: Date,
    ): Equipement[] {
        const equipements: Equipement[] = [];

        // Tables et chaises selon capacite
        for (let i = 0; i < nombrePlaces; i++) {
            equipements.push(Equipement.create({
                id: uuidv4(),
                type: TypeEquipement.TABLE,
                dateAcquisition,
            }));
            equipements.push(Equipement.create({
                id: uuidv4(),
                type: TypeEquipement.CHAISE,
                dateAcquisition,
            }));
        }

        // Equipements fixes de salle
        const equipementsFixes: TypeEquipement[] = [
            TypeEquipement.TABLEAU_BLANC,
            TypeEquipement.PROJECTEUR,
            TypeEquipement.CLIMATISEUR,
            TypeEquipement.PLAFONNIER,
            TypeEquipement.PLAFONNIER,
        ];

        equipementsFixes.forEach(type => {
            equipements.push(Equipement.create({
                id: uuidv4(),
                type,
                dateAcquisition,
            }));
        });

        return equipements;
    }

    /**
     * Genere un numero de serie unique
     */
    public generateNumeroSerie(type: TypeEquipement): string {
        const prefixes: Partial<Record<TypeEquipement, string>> = {
            [TypeEquipement.CLIMATISEUR]: 'CLM',
            [TypeEquipement.REFRIGERATEUR]: 'REF',
            [TypeEquipement.TELEVISEUR]: 'TV',
            [TypeEquipement.PROJECTEUR]: 'PRJ',
            [TypeEquipement.ORDINATEUR]: 'PC',
        };
        const prefix = prefixes[type] || 'EQP';
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `${prefix}-${timestamp}-${random}`;
    }
}