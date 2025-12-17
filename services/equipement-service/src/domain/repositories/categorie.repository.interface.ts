import { CategorieEquipement } from '../entities';
import { IBaseRepository } from './base.repository.interface';

/**
 * Interface du repository CategorieEquipement
 */
export interface ICategorieRepository
  extends IBaseRepository<CategorieEquipement> {
  /**
   * Trouve une catégorie par son code
   */
  findByCode(code: string): Promise<CategorieEquipement | null>;

  /**
   * Trouve les catégories racines (sans parent)
   */
  findRacines(): Promise<CategorieEquipement[]>;

  /**
   * Trouve les sous-catégories d'une catégorie parent
   */
  findByParent(categorieParentId: string): Promise<CategorieEquipement[]>;

  /**
   * Trouve les catégories actives
   */
  findActives(): Promise<CategorieEquipement[]>;

  /**
   * Vérifie si une catégorie a des sous-catégories
   */
  hasEnfants(categorieId: string): Promise<boolean>;

  /**
   * Vérifie si une catégorie a des équipements associés
   */
  hasEquipements(categorieId: string): Promise<boolean>;

  /**
   * Recherche des catégories par terme (code, libelle)
   */
  search(terme: string): Promise<CategorieEquipement[]>;
}
