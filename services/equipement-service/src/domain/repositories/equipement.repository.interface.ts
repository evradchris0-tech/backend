import { Equipement } from '../entities';
import { StatutEquipement, TypeEquipement } from '../enums';
import { IBaseRepository } from './base.repository.interface';

/**
 * Interface du repository Equipement
 * Définit le contrat pour la persistence des équipements
 */
export interface IEquipementRepository extends IBaseRepository<Equipement> {
  /**
   * Trouve un équipement par sa référence
   */
  findByReference(reference: string): Promise<Equipement | null>;

  /**
   * Trouve un équipement par son numéro de série
   */
  findByNumeroSerie(numeroSerie: string): Promise<Equipement | null>;

  /**
   * Trouve les équipements par catégorie
   */
  findByCategorie(categorieId: string): Promise<Equipement[]>;

  /**
   * Trouve les équipements par type
   */
  findByType(type: TypeEquipement): Promise<Equipement[]>;

  /**
   * Trouve les équipements par statut
   */
  findByStatut(statut: StatutEquipement): Promise<Equipement[]>;

  /**
   * Trouve les équipements par fournisseur
   */
  findByFournisseur(fournisseurId: string): Promise<Equipement[]>;

  /**
   * Trouve les équipements en stock faible (quantité <= quantité minimale)
   */
  findStockFaible(): Promise<Equipement[]>;

  /**
   * Trouve les équipements épuisés
   */
  findEpuises(): Promise<Equipement[]>;

  /**
   * Trouve les équipements disponibles
   */
  findDisponibles(): Promise<Equipement[]>;

  /**
   * Trouve les équipements par espace de stockage
   */
  findByEspaceStockage(espaceId: string): Promise<Equipement[]>;

  /**
   * Recherche des équipements par terme (designation, reference, marque, modèle)
   */
  search(terme: string): Promise<Equipement[]>;

  /**
   * Compte les équipements par statut
   */
  countByStatut(statut: StatutEquipement): Promise<number>;

  /**
   * Compte les équipements par type
   */
  countByType(type: TypeEquipement): Promise<number>;

  /**
   * Obtient la valeur totale du stock
   */
  getValeurTotaleStock(): Promise<number>;

  /**
   * Trouve les équipements nécessitant une maintenance (historique pannes élevé)
   */
  findNecessitantMaintenance(seuilPannes: number): Promise<Equipement[]>;
}
