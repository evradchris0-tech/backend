// src/infrastructure/persistence/mappers/equipement.orm-mapper.ts

import { Injectable } from '@nestjs/common';
import { Equipement } from '../../../domain/entities';
import { StatutEquipement } from '../../../domain/enums';
import { EquipementOrmEntity, HistoriqueStatutJson } from '../entities/equipement.orm-entity';

/**
 * Mapper pour convertir entre Equipement (Domain) et EquipementOrmEntity (Infrastructure)
 */
@Injectable()
export class EquipementOrmMapper {
    /**
     * Convertit une entite de domaine en entite ORM
     */
    public toPersistence(domain: Equipement): EquipementOrmEntity {
        const orm = new EquipementOrmEntity();

        orm.id = domain.id;
        orm.type = domain.type;
        orm.marque = domain.marque ?? null;
        orm.modele = domain.modele ?? null;
        orm.numeroSerie = domain.numeroSerie ?? null;
        orm.statut = domain.statut;
        orm.espaceId = domain.espaceId ?? null;
        orm.dateAcquisition = domain.dateAcquisition ?? null;
        orm.valeurAchat = domain.valeurAchat ?? null;
        orm.description = domain.description ?? null;
        orm.historiquePannes = domain.historiquePannes;
        orm.derniereDatePanne = domain.derniereDatePanne ?? null;
        orm.dateInstallation = domain.dateInstallation ?? null;
        orm.dateDerniereIntervention = domain.dateDerniereIntervention ?? null;
        orm.historiqueStatuts = this.serializeHistoriqueStatuts(domain.historiqueStatuts);
        orm.actif = domain.actif;
        orm.createdAt = domain.dateCreation;
        orm.updatedAt = domain.dateModification;

        return orm;
    }

    /**
     * Convertit une entite ORM en entite de domaine
     */
    public toDomain(orm: EquipementOrmEntity): Equipement {
        return Equipement.fromPersistence({
            id: orm.id,
            type: orm.type,
            marque: orm.marque ?? undefined,
            modele: orm.modele ?? undefined,
            numeroSerie: orm.numeroSerie ?? undefined,
            statut: orm.statut,
            espaceId: orm.espaceId ?? undefined,
            dateAcquisition: orm.dateAcquisition ?? undefined,
            valeurAchat: orm.valeurAchat ? Number(orm.valeurAchat) : undefined,
            description: orm.description ?? undefined,
            historiquePannes: orm.historiquePannes,
            derniereDatePanne: orm.derniereDatePanne ?? undefined,
            dateInstallation: orm.dateInstallation ?? undefined,
            dateDerniereIntervention: orm.dateDerniereIntervention ?? undefined,
            historiqueStatuts: this.deserializeHistoriqueStatuts(orm.historiqueStatuts),
            actif: orm.actif,
            dateCreation: orm.createdAt,
            dateModification: orm.updatedAt,
        });
    }

    /**
     * Convertit un tableau d'entites ORM en entites de domaine
     */
    public toDomainList(ormEntities: EquipementOrmEntity[]): Equipement[] {
        return ormEntities.map(orm => this.toDomain(orm));
    }

    /**
     * Serialise l'historique des statuts pour stockage JSONB
     */
    private serializeHistoriqueStatuts(
        historique: Equipement['historiqueStatuts'],
    ): HistoriqueStatutJson[] {
        return historique.map(h => ({
            ancienStatut: h.ancienStatut,
            nouveauStatut: h.nouveauStatut,
            motif: h.motif,
            date: h.date.toISOString(),
        }));
    }

    /**
     * Deserialise l'historique des statuts depuis JSONB
     */
    private deserializeHistoriqueStatuts(
        json: HistoriqueStatutJson[],
    ): Equipement['historiqueStatuts'] {
        if (!json || !Array.isArray(json)) {
            return [];
        }

        return json.map(h => ({
            ancienStatut: h.ancienStatut as StatutEquipement | null,
            nouveauStatut: h.nouveauStatut as StatutEquipement,
            motif: h.motif ?? '',
            date: new Date(h.date),
        }));
    }
}