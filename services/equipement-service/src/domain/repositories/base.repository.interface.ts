/**
 * Interface de base pour tous les repositories
 * Pattern Repository - Abstraction de la persistence
 */
export interface IBaseRepository<T> {
  /**
   * Trouve une entité par son ID
   */
  findById(id: string): Promise<T | null>;

  /**
   * Trouve toutes les entités
   */
  findAll(): Promise<T[]>;

  /**
   * Sauvegarde une entité (create ou update)
   */
  save(entity: T): Promise<T>;

  /**
   * Supprime une entité
   */
  delete(id: string): Promise<void>;

  /**
   * Vérifie si une entité existe
   */
  exists(id: string): Promise<boolean>;

  /**
   * Compte le nombre total d'entités
   */
  count(): Promise<number>;
}
