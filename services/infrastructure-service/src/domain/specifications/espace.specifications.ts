// src/domain/specifications/espace.specifications.ts

import { CompositeSpecification } from './specification.interface';
import { Espace } from '../entities';
import { TypeEspace, estUneChambre, estUnBureau, estUneSalle } from '../enums';

/**
 * Specification: Espace actif
 */
export class EspaceActifSpecification extends CompositeSpecification<Espace> {
    public isSatisfiedBy(espace: Espace): boolean {
        return espace.actif;
    }
}

/**
 * Specification: Espace occupe
 */
export class EspaceOccupeSpecification extends CompositeSpecification<Espace> {
    public isSatisfiedBy(espace: Espace): boolean {
        return espace.estOccupe;
    }
}

/**
 * Specification: Espace disponible (non occupe et actif)
 */
export class EspaceDisponibleSpecification extends CompositeSpecification<Espace> {
    public isSatisfiedBy(espace: Espace): boolean {
        return !espace.estOccupe && espace.actif;
    }
}

/**
 * Specification: Espace avec equipement defectueux
 */
export class EspaceDefectueuxSpecification extends CompositeSpecification<Espace> {
    public isSatisfiedBy(espace: Espace): boolean {
        return espace.aEquipementDefectueux;
    }
}

/**
 * Specification: Espace est une chambre
 */
export class EspaceChambreSpecification extends CompositeSpecification<Espace> {
    public isSatisfiedBy(espace: Espace): boolean {
        return espace.estUneChambre();
    }
}

/**
 * Specification: Espace est un bureau
 */
export class EspaceBureauSpecification extends CompositeSpecification<Espace> {
    public isSatisfiedBy(espace: Espace): boolean {
        return estUnBureau(espace.type);
    }
}

/**
 * Specification: Espace est une salle
 */
export class EspaceSalleSpecification extends CompositeSpecification<Espace> {
    public isSatisfiedBy(espace: Espace): boolean {
        return estUneSalle(espace.type);
    }
}

/**
 * Specification: Espace d'un type specifique
 */
export class EspaceTypeSpecification extends CompositeSpecification<Espace> {
    constructor(private readonly typeRecherche: TypeEspace) {
        super();
    }

    public isSatisfiedBy(espace: Espace): boolean {
        return espace.type === this.typeRecherche;
    }
}

/**
 * Specification: Espace dans un etage specifique
 */
export class EspaceEtageSpecification extends CompositeSpecification<Espace> {
    constructor(private readonly etageId: string) {
        super();
    }

    public isSatisfiedBy(espace: Espace): boolean {
        return espace.etageId === this.etageId;
    }
}

/**
 * Specification: Espace avec une capacite minimale
 */
export class EspaceCapaciteMinimaleSpecification extends CompositeSpecification<Espace> {
    constructor(private readonly capaciteMinimale: number) {
        super();
    }

    public isSatisfiedBy(espace: Espace): boolean {
        return espace.capacite !== null && espace.capacite >= this.capaciteMinimale;
    }
}

/**
 * Specification: Espace avec une superficie minimale
 */
export class EspaceSuperficieMinimaleSpecification extends CompositeSpecification<Espace> {
    constructor(private readonly superficieMinimale: number) {
        super();
    }

    public isSatisfiedBy(espace: Espace): boolean {
        return espace.superficie !== null && espace.superficie >= this.superficieMinimale;
    }
}

/**
 * Specification: Espace avec un occupant specifique
 */
export class EspaceOccupantSpecification extends CompositeSpecification<Espace> {
    constructor(private readonly occupantId: string) {
        super();
    }

    public isSatisfiedBy(espace: Espace): boolean {
        return espace.occupantId === this.occupantId;
    }
}

/**
 * Specification: Espace avec beaucoup d'equipements defectueux
 */
export class EspaceMultipleDefectsSpecification extends CompositeSpecification<Espace> {
    constructor(private readonly seuilDefauts: number = 2) {
        super();
    }

    public isSatisfiedBy(espace: Espace): boolean {
        return espace.nombreEquipementsDefectueux >= this.seuilDefauts;
    }
}

/**
 * Factory pour combiner plusieurs specifications courantes
 */
export class EspaceSpecifications {
    /**
     * Chambres disponibles (non occupees et actives)
     */
    public static chambresDisponibles(): CompositeSpecification<Espace> {
        return new EspaceChambreSpecification().and(
            new EspaceDisponibleSpecification(),
        ) as CompositeSpecification<Espace>;
    }

    /**
     * Chambres occupees
     */
    public static chambresOccupees(): CompositeSpecification<Espace> {
        return new EspaceChambreSpecification().and(
            new EspaceOccupeSpecification(),
        ) as CompositeSpecification<Espace>;
    }

    /**
     * Espaces avec problemes (equipements defectueux)
     */
    public static avecProblemes(): CompositeSpecification<Espace> {
        return new EspaceActifSpecification().and(
            new EspaceDefectueuxSpecification(),
        ) as CompositeSpecification<Espace>;
    }

    /**
     * Espaces avec problemes critiques (plusieurs equipements defectueux)
     */
    public static avecProblemesCritiques(seuil: number = 2): CompositeSpecification<Espace> {
        return new EspaceActifSpecification().and(
            new EspaceMultipleDefectsSpecification(seuil),
        ) as CompositeSpecification<Espace>;
    }

    /**
     * Espaces d'un etage specifique actifs
     */
    public static parEtageActifs(etageId: string): CompositeSpecification<Espace> {
        return new EspaceActifSpecification().and(
            new EspaceEtageSpecification(etageId),
        ) as CompositeSpecification<Espace>;
    }

    /**
     * Chambres disponibles dans un etage
     */
    public static chambresDisponiblesParEtage(etageId: string): CompositeSpecification<Espace> {
        return new EspaceChambreSpecification()
            .and(new EspaceDisponibleSpecification())
            .and(new EspaceEtageSpecification(etageId)) as CompositeSpecification<Espace>;
    }

    /**
     * Salles avec capacite minimale
     */
    public static sallesAvecCapacite(capaciteMinimale: number): CompositeSpecification<Espace> {
        return new EspaceSalleSpecification()
            .and(new EspaceActifSpecification())
            .and(new EspaceCapaciteMinimaleSpecification(capaciteMinimale)) as CompositeSpecification<Espace>;
    }

    /**
     * Espaces assignables (actifs et pouvant accueillir des equipements)
     */
    public static assignables(): CompositeSpecification<Espace> {
        return new EspaceActifSpecification();
    }

    /**
     * Espaces d'un type specifique dans un etage
     */
    public static parTypeEtEtage(
        type: TypeEspace,
        etageId: string,
    ): CompositeSpecification<Espace> {
        return new EspaceActifSpecification()
            .and(new EspaceTypeSpecification(type))
            .and(new EspaceEtageSpecification(etageId)) as CompositeSpecification<Espace>;
    }
}
