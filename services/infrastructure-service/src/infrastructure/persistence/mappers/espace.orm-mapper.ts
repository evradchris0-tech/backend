// src/infrastructure/persistence/mappers/espace.orm-mapper.ts

import { Injectable } from '@nestjs/common';
import { Espace } from '../../../domain/entities';
import { EspaceOrmEntity } from '../entities/espace.orm-entity';

/**
 * Mapper pour convertir entre Espace (Domain) et EspaceOrmEntity (Infrastructure)
 */
@Injectable()
export class EspaceOrmMapper {
    /**
     * Convertit une entite de domaine en entite ORM
     */
    public toPersistence(domain: Espace): EspaceOrmEntity {
        const orm = new EspaceOrmEntity();

        orm.id = domain.id;
        orm.etageId = domain.etageId;
        orm.numero = domain.numero;
        orm.type = domain.type;
        orm.superficie = domain.superficie ?? null;
        orm.capacite = domain.capacite ?? null;
        orm.description = domain.description ?? null;
        orm.estOccupe = domain.estOccupe;
        orm.occupantId = domain.occupantId ?? null;
        orm.aEquipementDefectueux = domain.aEquipementDefectueux;
        orm.nombreEquipementsDefectueux = domain.nombreEquipementsDefectueux;
        orm.actif = domain.actif;
        orm.createdAt = domain.dateCreation;
        orm.updatedAt = domain.dateModification;

        return orm;
    }

    /**
     * Convertit une entite ORM en entite de domaine
     */
    public toDomain(orm: EspaceOrmEntity): Espace {
        return Espace.fromPersistence({
            id: orm.id,
            etageId: orm.etageId,
            numero: orm.numero,
            type: orm.type,
            superficie: orm.superficie ? Number(orm.superficie) : undefined,
            capacite: orm.capacite ?? undefined,
            description: orm.description ?? undefined,
            estOccupe: orm.estOccupe,
            occupantId: orm.occupantId ?? undefined,
            aEquipementDefectueux: orm.aEquipementDefectueux,
            nombreEquipementsDefectueux: orm.nombreEquipementsDefectueux,
            actif: orm.actif,
            dateCreation: orm.createdAt,
            dateModification: orm.updatedAt,
        });
    }

    /**
     * Convertit un tableau d'entites ORM en entites de domaine
     */
    public toDomainList(ormEntities: EspaceOrmEntity[]): Espace[] {
        return ormEntities.map(orm => this.toDomain(orm));
    }
}