/**
 * Interface de base pour le pattern Specification
 * Permet d'encapsuler les règles métier réutilisables
 */
export interface ISpecification<T> {
  /**
   * Vérifie si l'entité satisfait la spécification
   */
  isSatisfiedBy(entity: T): boolean;

  /**
   * Combine avec une autre spécification (ET logique)
   */
  and(other: ISpecification<T>): ISpecification<T>;

  /**
   * Combine avec une autre spécification (OU logique)
   */
  or(other: ISpecification<T>): ISpecification<T>;

  /**
   * Négation de la spécification
   */
  not(): ISpecification<T>;
}

/**
 * Classe abstraite de base pour les spécifications
 */
export abstract class Specification<T> implements ISpecification<T> {
  abstract isSatisfiedBy(entity: T): boolean;

  and(other: ISpecification<T>): ISpecification<T> {
    return new AndSpecification(this, other);
  }

  or(other: ISpecification<T>): ISpecification<T> {
    return new OrSpecification(this, other);
  }

  not(): ISpecification<T> {
    return new NotSpecification(this);
  }
}

/**
 * Spécification AND
 */
class AndSpecification<T> extends Specification<T> {
  constructor(
    private left: ISpecification<T>,
    private right: ISpecification<T>,
  ) {
    super();
  }

  isSatisfiedBy(entity: T): boolean {
    return (
      this.left.isSatisfiedBy(entity) && this.right.isSatisfiedBy(entity)
    );
  }
}

/**
 * Spécification OR
 */
class OrSpecification<T> extends Specification<T> {
  constructor(
    private left: ISpecification<T>,
    private right: ISpecification<T>,
  ) {
    super();
  }

  isSatisfiedBy(entity: T): boolean {
    return this.left.isSatisfiedBy(entity) || this.right.isSatisfiedBy(entity);
  }
}

/**
 * Spécification NOT
 */
class NotSpecification<T> extends Specification<T> {
  constructor(private spec: ISpecification<T>) {
    super();
  }

  isSatisfiedBy(entity: T): boolean {
    return !this.spec.isSatisfiedBy(entity);
  }
}
