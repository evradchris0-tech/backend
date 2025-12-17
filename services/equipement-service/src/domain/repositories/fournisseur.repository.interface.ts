import { Fournisseur } from '../entities';
import { IBaseRepository } from './base.repository.interface';

/**
 * Interface du repository Fournisseur
 */
export interface IFournisseurRepository extends IBaseRepository<Fournisseur> {
  /**
   * Trouve un fournisseur par son nom
   */
  findByNom(nom: string): Promise<Fournisseur | null>;

  /**
   * Trouve les fournisseurs actifs
   */
  findActifs(): Promise<Fournisseur[]>;

  /**
   * Recherche des fournisseurs par terme (nom, ville)
   */
  search(terme: string): Promise<Fournisseur[]>;

  /**
   * Vérifie si un fournisseur a des équipements associés
   */
  hasEquipements(fournisseurId: string): Promise<boolean>;
}
