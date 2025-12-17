import { Affectation } from '../entities';
import { EtatAffectation } from '../enums';
import { IBaseRepository } from './base.repository.interface';

/**
 * Interface du repository Affectation
 */
export interface IAffectationRepository extends IBaseRepository<Affectation> {
  /**
   * Trouve les affectations d'un équipement
   */
  findByEquipement(equipementId: string): Promise<Affectation[]>;

  /**
   * Trouve les affectations actives d'un équipement
   */
  findActivesByEquipement(equipementId: string): Promise<Affectation[]>;

  /**
   * Trouve les affectations par utilisateur bénéficiaire
   */
  findByUtilisateur(utilisateurId: string): Promise<Affectation[]>;

  /**
   * Trouve les affectations actives par utilisateur
   */
  findActivesByUtilisateur(utilisateurId: string): Promise<Affectation[]>;

  /**
   * Trouve les affectations par service
   */
  findByService(service: string): Promise<Affectation[]>;

  /**
   * Trouve les affectations actives par service
   */
  findActivesByService(service: string): Promise<Affectation[]>;

  /**
   * Trouve les affectations par état
   */
  findByEtat(etat: EtatAffectation): Promise<Affectation[]>;

  /**
   * Trouve les affectations en retard
   */
  findEnRetard(): Promise<Affectation[]>;

  /**
   * Trouve les affectations par période
   */
  findByPeriode(dateDebut: Date, dateFin: Date): Promise<Affectation[]>;

  /**
   * Compte les affectations actives d'un équipement
   */
  countActivesByEquipement(equipementId: string): Promise<number>;

  /**
   * Obtient la quantité totale affectée pour un équipement
   */
  getTotalQuantiteAffectee(equipementId: string): Promise<number>;

  /**
   * Vérifie si un utilisateur a des affectations actives
   */
  hasAffectationsActives(utilisateurId: string): Promise<boolean>;
}
