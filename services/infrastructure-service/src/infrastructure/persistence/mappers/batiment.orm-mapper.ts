// src/infrastructure/persistence/mappers/batiment.orm-mapper.ts

import { Injectable } from '@nestjs/common';
import { Batiment } from '../../../domain/entities';
import { Coordonnees } from '../../../domain/value-objects';
import { BatimentOrmEntity } from '../entities/batiment.orm-entity';

/**
 * Mapper pour convertir entre Batiment (Domain) et BatimentOrmEntity (Infrastructure)
 */
@Injectable()
export class BatimentOrmMapper {
    /**
     * Convertit une entite de domaine en entite ORM
     */
    public toPersistence(domain: Batiment): BatimentOrmEntity {
        const orm = new BatimentOrmEntity();

        orm.id = domain.id;
        orm.nom = domain.nom;
        orm.code = domain.code;
        orm.type = domain.type;
        orm.adresse = domain.adresse ?? null;
        orm.latitude = domain.coordonnees?.latitude ?? null;
        orm.longitude = domain.coordonnees?.longitude ?? null;
        orm.altitude = domain.coordonnees?.altitude ?? null;
        orm.nombreEtages = domain.nombreEtages;
        orm.superficie = domain.superficie ?? null;
        orm.dateConstruction = domain.dateConstruction ?? null;
        orm.description = domain.description ?? null;
        orm.planBatiment = domain.planBatiment ?? null;
        orm.actif = domain.actif;
        orm.createdAt = domain.dateCreation;
        orm.updatedAt = domain.dateModification;

        return orm;
    }

    /**
     * Convertit une entite ORM en entite de domaine
     */
    public toDomain(orm: BatimentOrmEntity): Batiment {
        // Reconstruire les coordonnees si presentes
        let coordonnees: Coordonnees | undefined;
        if (orm.latitude !== null && orm.longitude !== null) {
            coordonnees = Coordonnees.create(
                Number(orm.latitude),
                Number(orm.longitude),
                orm.altitude ? Number(orm.altitude) : undefined,
            );
        }

        return Batiment.fromPersistence({
            id: orm.id,
            nom: orm.nom,
            code: orm.code,
            type: orm.type,
            adresse: orm.adresse ?? undefined,
            coordonnees,
            nombreEtages: orm.nombreEtages,
            superficie: orm.superficie ? Number(orm.superficie) : undefined,
            dateConstruction: orm.dateConstruction ?? undefined,
            description: orm.description ?? undefined,
            planBatiment: orm.planBatiment ?? undefined,
            actif: orm.actif,
            dateCreation: orm.createdAt,
            dateModification: orm.updatedAt,
        });
    }

    /**
     * Convertit un tableau d'entites ORM en entites de domaine
     */
    public toDomainList(ormEntities: BatimentOrmEntity[]): Batiment[] {
        return ormEntities.map(orm => this.toDomain(orm));
    }
}