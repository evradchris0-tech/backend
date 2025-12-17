// src/domain/specifications/equipement.specifications.ts

import { CompositeSpecification } from './specification.interface';
import { Equipement } from '../entities';
import {
    StatutEquipement,
    TypeEquipement,
    CategorieEquipement,
    estStatutDefectueux,
    estStatutCritique,
} from '../enums';

/**
 * Specification: Equipement defectueux (A_REPARER, A_REMPLACER, EN_MAINTENANCE, EN_ATTENTE_PIECE)
 */
export class EquipementDefectueuxSpecification extends CompositeSpecification<Equipement> {
    public isSatisfiedBy(equipement: Equipement): boolean {
        return estStatutDefectueux(equipement.statut);
    }
}

/**
 * Specification: Equipement a remplacer
 */
export class EquipementARemplacerSpecification extends CompositeSpecification<Equipement> {
    public isSatisfiedBy(equipement: Equipement): boolean {
        return equipement.statut === StatutEquipement.A_REMPLACER;
    }
}

/**
 * Specification: Equipement critique (statut critique)
 */
export class EquipementStatutCritiqueSpecification extends CompositeSpecification<Equipement> {
    public isSatisfiedBy(equipement: Equipement): boolean {
        return estStatutCritique(equipement.statut);
    }
}

/**
 * Specification: Equipement en bon etat
 */
export class EquipementBonEtatSpecification extends CompositeSpecification<Equipement> {
    public isSatisfiedBy(equipement: Equipement): boolean {
        return equipement.statut === StatutEquipement.BON_ETAT;
    }
}

/**
 * Specification: Equipement actif
 */
export class EquipementActifSpecification extends CompositeSpecification<Equipement> {
    public isSatisfiedBy(equipement: Equipement): boolean {
        return equipement.actif;
    }
}

/**
 * Specification: Equipement assigne a un espace
 */
export class EquipementAssigneSpecification extends CompositeSpecification<Equipement> {
    public isSatisfiedBy(equipement: Equipement): boolean {
        return equipement.espaceId !== null;
    }
}

/**
 * Specification: Equipement non assigne (disponible)
 */
export class EquipementDisponibleSpecification extends CompositeSpecification<Equipement> {
    public isSatisfiedBy(equipement: Equipement): boolean {
        return equipement.espaceId === null && equipement.actif;
    }
}

/**
 * Specification: Equipement d'un type specifique
 */
export class EquipementTypeSpecification extends CompositeSpecification<Equipement> {
    constructor(private readonly typeRecherche: TypeEquipement) {
        super();
    }

    public isSatisfiedBy(equipement: Equipement): boolean {
        return equipement.type === this.typeRecherche;
    }
}

/**
 * Specification: Equipement d'une categorie specifique
 */
export class EquipementCategorieSpecification extends CompositeSpecification<Equipement> {
    constructor(private readonly categorieRecherche: CategorieEquipement) {
        super();
    }

    public isSatisfiedBy(equipement: Equipement): boolean {
        return equipement.getCategorie() === this.categorieRecherche;
    }
}

/**
 * Specification: Equipement avec un statut specifique
 */
export class EquipementStatutSpecification extends CompositeSpecification<Equipement> {
    constructor(private readonly statutRecherche: StatutEquipement) {
        super();
    }

    public isSatisfiedBy(equipement: Equipement): boolean {
        return equipement.statut === this.statutRecherche;
    }
}

/**
 * Specification: Equipement dans un espace specifique
 */
export class EquipementEspaceSpecification extends CompositeSpecification<Equipement> {
    constructor(private readonly espaceId: string) {
        super();
    }

    public isSatisfiedBy(equipement: Equipement): boolean {
        return equipement.espaceId === this.espaceId;
    }
}

/**
 * Specification: Equipement a haut risque de panne (score >= seuil)
 */
export class EquipementHautRisqueSpecification extends CompositeSpecification<Equipement> {
    constructor(private readonly seuilRisque: number = 70) {
        super();
    }

    public isSatisfiedBy(equipement: Equipement): boolean {
        return equipement.calculerScoreRisque() >= this.seuilRisque;
    }
}

/**
 * Specification: Equipement necessitant un remplacement base sur les indicateurs
 */
export class EquipementNecessiteRemplacementSpecification extends CompositeSpecification<Equipement> {
    public isSatisfiedBy(equipement: Equipement): boolean {
        return equipement.necessiteRemplacement();
    }
}

/**
 * Specification: Equipement avec vie restante faible
 */
export class EquipementVieRestanteFaibleSpecification extends CompositeSpecification<Equipement> {
    constructor(private readonly seuilPourcentage: number = 20) {
        super();
    }

    public isSatisfiedBy(equipement: Equipement): boolean {
        const vieRestante = equipement.getPourcentageVieRestante();
        return vieRestante !== null && vieRestante <= this.seuilPourcentage;
    }
}

/**
 * Specification: Equipement avec pannes frequentes
 */
export class EquipementPannesFrequentesSpecification extends CompositeSpecification<Equipement> {
    constructor(private readonly seuilPannes: number = 3) {
        super();
    }

    public isSatisfiedBy(equipement: Equipement): boolean {
        return equipement.historiquePannes >= this.seuilPannes;
    }
}

/**
 * Factory pour combiner plusieurs specifications courantes
 */
export class EquipementSpecifications {
    /**
     * Equipements defectueux actifs
     */
    public static defectueuxActifs(): CompositeSpecification<Equipement> {
        return new EquipementActifSpecification().and(
            new EquipementDefectueuxSpecification(),
        ) as CompositeSpecification<Equipement>;
    }

    /**
     * Equipements a remplacer (urgents)
     */
    public static aRemplacerUrgent(): CompositeSpecification<Equipement> {
        return new EquipementActifSpecification().and(
            new EquipementARemplacerSpecification(),
        ) as CompositeSpecification<Equipement>;
    }

    /**
     * Equipements disponibles pour assignation
     */
    public static disponiblesPourAssignation(): CompositeSpecification<Equipement> {
        return new EquipementDisponibleSpecification().and(
            new EquipementBonEtatSpecification(),
        ) as CompositeSpecification<Equipement>;
    }

    /**
     * Equipements a risque (pour maintenance preventive)
     */
    public static aRisque(seuil: number = 70): CompositeSpecification<Equipement> {
        return new EquipementActifSpecification().and(
            new EquipementHautRisqueSpecification(seuil),
        ) as CompositeSpecification<Equipement>;
    }

    /**
     * Equipements d'un espace specifique
     */
    public static parEspace(espaceId: string): CompositeSpecification<Equipement> {
        return new EquipementActifSpecification().and(
            new EquipementEspaceSpecification(espaceId),
        ) as CompositeSpecification<Equipement>;
    }

    /**
     * Equipements d'une categorie dans un espace
     */
    public static parCategorieEtEspace(
        categorie: CategorieEquipement,
        espaceId: string,
    ): CompositeSpecification<Equipement> {
        return new EquipementActifSpecification()
            .and(new EquipementCategorieSpecification(categorie))
            .and(new EquipementEspaceSpecification(espaceId)) as CompositeSpecification<Equipement>;
    }

    /**
     * Equipements vieillissants necessitant attention
     */
    public static vieillissants(): CompositeSpecification<Equipement> {
        return new EquipementActifSpecification().and(
            new EquipementVieRestanteFaibleSpecification(20),
        ) as CompositeSpecification<Equipement>;
    }
}