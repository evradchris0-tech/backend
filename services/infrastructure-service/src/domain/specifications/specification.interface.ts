// src/domain/specifications/specification.interface.ts

/**
 * Interface de base pour le Specification Pattern
 * Permet de definir des criteres de filtrage reutilisables et composables
 */
export interface Specification<T> {
    /**
     * Verifie si un element satisfait la specification
     */
    isSatisfiedBy(candidate: T): boolean;

    /**
     * Combine cette specification avec une autre via AND logique
     */
    and(other: Specification<T>): Specification<T>;

    /**
     * Combine cette specification avec une autre via OR logique
     */
    or(other: Specification<T>): Specification<T>;

    /**
     * Inverse cette specification (NOT logique)
     */
    not(): Specification<T>;
}

/**
 * Implementation abstraite de base pour les specifications
 */
export abstract class CompositeSpecification<T> implements Specification<T> {
    public abstract isSatisfiedBy(candidate: T): boolean;

    public and(other: Specification<T>): Specification<T> {
        return new AndSpecification<T>(this, other);
    }

    public or(other: Specification<T>): Specification<T> {
        return new OrSpecification<T>(this, other);
    }

    public not(): Specification<T> {
        return new NotSpecification<T>(this);
    }
}

/**
 * Specification AND (et logique)
 */
export class AndSpecification<T> extends CompositeSpecification<T> {
    constructor(
        private readonly left: Specification<T>,
        private readonly right: Specification<T>,
    ) {
        super();
    }

    public isSatisfiedBy(candidate: T): boolean {
        return (
            this.left.isSatisfiedBy(candidate) && this.right.isSatisfiedBy(candidate)
        );
    }
}

/**
 * Specification OR (ou logique)
 */
export class OrSpecification<T> extends CompositeSpecification<T> {
    constructor(
        private readonly left: Specification<T>,
        private readonly right: Specification<T>,
    ) {
        super();
    }

    public isSatisfiedBy(candidate: T): boolean {
        return (
            this.left.isSatisfiedBy(candidate) || this.right.isSatisfiedBy(candidate)
        );
    }
}

/**
 * Specification NOT (negation)
 */
export class NotSpecification<T> extends CompositeSpecification<T> {
    constructor(private readonly spec: Specification<T>) {
        super();
    }

    public isSatisfiedBy(candidate: T): boolean {
        return !this.spec.isSatisfiedBy(candidate);
    }
}

/**
 * Specification qui accepte tout (pour initialisation)
 */
export class TrueSpecification<T> extends CompositeSpecification<T> {
    public isSatisfiedBy(_candidate: T): boolean {
        return true;
    }
}

/**
 * Specification qui rejette tout
 */
export class FalseSpecification<T> extends CompositeSpecification<T> {
    public isSatisfiedBy(_candidate: T): boolean {
        return false;
    }
}