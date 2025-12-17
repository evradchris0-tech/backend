// src/infrastructure/persistence/mappers/etage.orm-mapper.ts

import { Injectable } from '@nestjs/common';
import { Etage } from '../../../domain/entities';
import { EtageOrmEntity } from '../entities/etage.orm-entity';

/**
 * Mapper pour convertir entre Etage (Domain) et EtageOrmEntity (Infrastructure)
 */
@Injectable()
export class EtageOrmMapper {
    /**
     * Convertit une entite de domaine en entite ORM
     */
    public toPersistence(domain: Etage): EtageOrmEntity {
        const orm = new EtageOrmEntity();

        orm.id = domain.id;
        orm.batimentId = domain.batimentId;
        orm.numero = domain.numero;
        orm.designation = domain.designation;
        orm.superficie = domain.superficie ?? null;
        orm.planEtage = domain.planEtage ?? null;
        orm.actif = domain.actif;
        orm.createdAt = domain.dateCreation;
        orm.updatedAt = domain.dateModification;

        return orm;
    }

    /**
     * Convertit une entite ORM en entite de domaine
     */
    public toDomain(orm: EtageOrmEntity): Etage {
        return Etage.fromPersistence({
            id: orm.id,
            batimentId: orm.batimentId,
            numero: orm.numero,
            designation: orm.designation,
            superficie: orm.superficie ? Number(orm.superficie) : undefined,
            planEtage: orm.planEtage ?? undefined,
            actif: orm.actif,
            dateCreation: orm.createdAt,
            dateModification: orm.updatedAt,
        });
    }

    /**
     * Convertit un tableau d'entites ORM en entites de domaine
     */
    public toDomainList(ormEntities: EtageOrmEntity[]): Etage[] {
        return ormEntities.map(orm => this.toDomain(orm));
    }
}