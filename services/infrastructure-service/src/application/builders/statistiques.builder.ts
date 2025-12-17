// src/application/builders/statistiques.builder.ts

import { Injectable, Inject } from '@nestjs/common';
import {
    IBatimentRepository,
    BATIMENT_REPOSITORY,
    IEtageRepository,
    ETAGE_REPOSITORY,
    IEspaceRepository,
    ESPACE_REPOSITORY,
    IEquipementRepository,
    EQUIPEMENT_REPOSITORY,
} from '../../domain/repositories';
import {
    TypeBatiment,
    TypeEspace,
    TypeEquipement,
    StatutEquipement,
    CategorieEquipement,
} from '../../domain/enums';

/**
 * Statistiques globales du systeme
 */
export interface StatistiquesGlobales {
    timestamp: Date;
    batiments: {
        total: number;
        actifs: number;
        parType: Record<TypeBatiment, number>;
    };
    etages: {
        total: number;
        actifs: number;
    };
    espaces: {
        total: number;
        actifs: number;
        defectueux: number;
        occupes: number;
        libres: number;
        parType: Record<TypeEspace, number>;
    };
    equipements: {
        total: number;
        actifs: number;
        assignes: number;
        nonAssignes: number;
        parStatut: Record<StatutEquipement, number>;
        parCategorie: Record<CategorieEquipement, number>;
        aRisque: number;
    };
    indicateurs: {
        tauxEquipementsEnBonEtat: number;
        tauxOccupationChambres: number;
        tauxEspacesDefectueux: number;
        nombreEquipementsParEspace: number;
    };
}

/**
 * Statistiques d'un batiment specifique
 */
export interface StatistiquesBatiment {
    batimentId: string;
    batimentNom: string;
    batimentCode: string;
    timestamp: Date;
    etages: {
        total: number;
        parNumero: { numero: number; nombreEspaces: number }[];
    };
    espaces: {
        total: number;
        defectueux: number;
        occupes: number;
        parType: Record<TypeEspace, number>;
    };
    equipements: {
        total: number;
        parStatut: Record<StatutEquipement, number>;
        parCategorie: Record<CategorieEquipement, number>;
    };
    topEspacesDefectueux: {
        espaceId: string;
        espaceNumero: string;
        nombreEquipementsDefectueux: number;
    }[];
}

/**
 * Configuration du builder
 */
export interface StatistiquesBuilderConfig {
    inclureTopDefectueux?: boolean;
    limitTopDefectueux?: number;
    inclureDetails?: boolean;
}

/**
 * Builder Pattern pour construire des statistiques complexes
 * Permet de composer les statistiques de maniere fluide
 */
@Injectable()
export class StatistiquesBuilder {
    private config: StatistiquesBuilderConfig = {
        inclureTopDefectueux: true,
        limitTopDefectueux: 10,
        inclureDetails: true,
    };

    private batimentIdFilter: string | null = null;

    constructor(
        @Inject(BATIMENT_REPOSITORY)
        private readonly batimentRepository: IBatimentRepository,
        @Inject(ETAGE_REPOSITORY)
        private readonly etageRepository: IEtageRepository,
        @Inject(ESPACE_REPOSITORY)
        private readonly espaceRepository: IEspaceRepository,
        @Inject(EQUIPEMENT_REPOSITORY)
        private readonly equipementRepository: IEquipementRepository,
    ) {}

    /**
     * Configure le builder
     */
    public withConfig(config: Partial<StatistiquesBuilderConfig>): this {
        this.config = { ...this.config, ...config };
        return this;
    }

    /**
     * Filtre par batiment
     */
    public forBatiment(batimentId: string): this {
        this.batimentIdFilter = batimentId;
        return this;
    }

    /**
     * Reset les filtres
     */
    public reset(): this {
        this.batimentIdFilter = null;
        this.config = {
            inclureTopDefectueux: true,
            limitTopDefectueux: 10,
            inclureDetails: true,
        };
        return this;
    }

    /**
     * Construit les statistiques globales
     */
    public async buildGlobales(): Promise<StatistiquesGlobales> {
        const [
            batimentsStats,
            etagesCount,
            espacesResume,
            equipementsResume,
        ] = await Promise.all([
            this.batimentRepository.countByType(),
            this.etageRepository.count(),
            this.espaceRepository.getResume(this.batimentIdFilter ?? undefined),
            this.equipementRepository.getResume(this.batimentIdFilter ?? undefined),
        ]);

        // Calculer les indicateurs
        const totalEquipements = equipementsResume.total;
        const equipementsEnBonEtat = equipementsResume.parStatut[StatutEquipement.BON_ETAT] || 0;
        const tauxEquipementsEnBonEtat = totalEquipements > 0
            ? Math.round((equipementsEnBonEtat / totalEquipements) * 100 * 10) / 10
            : 100;

        const nombreChambres = this.countChambres(espacesResume.parType);
        const tauxOccupationChambres = nombreChambres > 0
            ? Math.round((espacesResume.occupes / nombreChambres) * 100 * 10) / 10
            : 0;

        const tauxEspacesDefectueux = espacesResume.total > 0
            ? Math.round((espacesResume.defectueux / espacesResume.total) * 100 * 10) / 10
            : 0;

        const nombreEquipementsParEspace = espacesResume.total > 0
            ? Math.round((equipementsResume.assignes / espacesResume.total) * 10) / 10
            : 0;

        // Compter les batiments
        let totalBatiments = 0;
        for (const count of Object.values(batimentsStats)) {
            totalBatiments += count;
        }

        return {
            timestamp: new Date(),
            batiments: {
                total: totalBatiments,
                actifs: totalBatiments, // A affiner avec un comptage specifique
                parType: batimentsStats,
            },
            etages: {
                total: etagesCount,
                actifs: etagesCount,
            },
            espaces: {
                total: espacesResume.total,
                actifs: espacesResume.actifs,
                defectueux: espacesResume.defectueux,
                occupes: espacesResume.occupes,
                libres: espacesResume.libres,
                parType: espacesResume.parType,
            },
            equipements: {
                total: equipementsResume.total,
                actifs: equipementsResume.total,
                assignes: equipementsResume.assignes,
                nonAssignes: equipementsResume.nonAssignes,
                parStatut: equipementsResume.parStatut,
                parCategorie: equipementsResume.parCategorie,
                aRisque: equipementsResume.aRisque,
            },
            indicateurs: {
                tauxEquipementsEnBonEtat,
                tauxOccupationChambres,
                tauxEspacesDefectueux,
                nombreEquipementsParEspace,
            },
        };
    }

    /**
     * Construit les statistiques d'un batiment
     */
    public async buildBatiment(batimentId: string): Promise<StatistiquesBatiment | null> {
        const batiment = await this.batimentRepository.findById(batimentId);
        if (!batiment) {
            return null;
        }

        const [etages, espacesResume, equipementsResume] = await Promise.all([
            this.etageRepository.findActifsByBatiment(batimentId),
            this.espaceRepository.getResume(batimentId),
            this.equipementRepository.getResume(batimentId),
        ]);

        // Stats par etage
        const etagesStats = await Promise.all(
            etages.map(async etage => {
                const espaces = await this.espaceRepository.findActifsByEtage(etage.id);
                return {
                    numero: etage.numero,
                    nombreEspaces: espaces.length,
                };
            }),
        );

        // Top espaces defectueux
        let topEspacesDefectueux: StatistiquesBatiment['topEspacesDefectueux'] = [];
        if (this.config.inclureTopDefectueux) {
            const espacesDefectueux = await this.espaceRepository.findMostDefectueux(
                this.config.limitTopDefectueux || 10,
                batimentId,
            );
            topEspacesDefectueux = espacesDefectueux.map(e => ({
                espaceId: e.id,
                espaceNumero: e.numero,
                nombreEquipementsDefectueux: e.nombreEquipementsDefectueux,
            }));
        }

        return {
            batimentId: batiment.id,
            batimentNom: batiment.nom,
            batimentCode: batiment.code,
            timestamp: new Date(),
            etages: {
                total: etages.length,
                parNumero: etagesStats,
            },
            espaces: {
                total: espacesResume.total,
                defectueux: espacesResume.defectueux,
                occupes: espacesResume.occupes,
                parType: espacesResume.parType,
            },
            equipements: {
                total: equipementsResume.total,
                parStatut: equipementsResume.parStatut,
                parCategorie: equipementsResume.parCategorie,
            },
            topEspacesDefectueux,
        };
    }

    /**
     * Compte le nombre de chambres parmi les types d'espaces
     */
    private countChambres(parType: Record<TypeEspace, number>): number {
        return (
            (parType[TypeEspace.CHAMBRE_SIMPLE] || 0) +
            (parType[TypeEspace.CHAMBRE_DOUBLE] || 0) +
            (parType[TypeEspace.CHAMBRE_TRIPLE] || 0)
        );
    }
}