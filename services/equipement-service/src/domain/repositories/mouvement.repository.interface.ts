import { MouvementStock } from '../entities';
import { TypeMouvement } from '../enums';
import { IBaseRepository } from './base.repository.interface';

/**
 * Interface du repository MouvementStock
 */
export interface IMouvementRepository extends IBaseRepository<MouvementStock> {
  /**
   * Trouve les mouvements d'un équipement
   */
  findByEquipement(equipementId: string): Promise<MouvementStock[]>;

  /**
   * Trouve les mouvements par type
   */
  findByType(type: TypeMouvement): Promise<MouvementStock[]>;

  /**
   * Trouve les mouvements par utilisateur
   */
  findByUtilisateur(utilisateurId: string): Promise<MouvementStock[]>;

  /**
   * Trouve les mouvements par période
   */
  findByPeriode(dateDebut: Date, dateFin: Date): Promise<MouvementStock[]>;

  /**
   * Trouve les mouvements d'un équipement par période
   */
  findByEquipementAndPeriode(
    equipementId: string,
    dateDebut: Date,
    dateFin: Date,
  ): Promise<MouvementStock[]>;

  /**
   * Trouve les derniers mouvements d'un équipement
   */
  findLastByEquipement(
    equipementId: string,
    limit: number,
  ): Promise<MouvementStock[]>;

  /**
   * Compte les mouvements par type
   */
  countByType(type: TypeMouvement): Promise<number>;

  /**
   * Trouve les mouvements avec facture
   */
  findWithFacture(): Promise<MouvementStock[]>;

  /**
   * Trouve les entrées (achats, dons, retours)
   */
  findEntrees(dateDebut?: Date, dateFin?: Date): Promise<MouvementStock[]>;

  /**
   * Trouve les sorties
   */
  findSorties(dateDebut?: Date, dateFin?: Date): Promise<MouvementStock[]>;
}
