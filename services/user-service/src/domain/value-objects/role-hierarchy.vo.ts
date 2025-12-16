// src/domain/value-objects/role-hierarchy.vo.ts

import { UserRole } from '../entities/user.entity';

export class RoleHierarchy {
    /**
     * Hiérarchie des rôles (du plus élevé au plus bas)
     */
    private static readonly HIERARCHY: UserRole[] = [
        UserRole.SUPERADMIN,
        UserRole.ADMINISTRATOR,
        UserRole.SUPERVISOR,
        UserRole.AGENT_TERRAIN,
        UserRole.OCCUPANT,
    ];

    /**
     * Vérifie si un rôle peut gérer (créer/modifier/supprimer) un autre rôle
     * @param managerRole Le rôle de celui qui veut gérer
     * @param targetRole Le rôle cible
     * @returns true si le managerRole peut gérer le targetRole
     */
    static canManage(managerRole: UserRole, targetRole: UserRole): boolean {
        const managerLevel = this.HIERARCHY.indexOf(managerRole);
        const targetLevel = this.HIERARCHY.indexOf(targetRole);

        // Si un des rôles n'est pas trouvé, refuser
        if (managerLevel === -1 || targetLevel === -1) {
            return false;
        }

        // Un rôle peut gérer tous les rôles de niveau inférieur
        // SUPERADMIN peut tout gérer
        // ADMINISTRATOR ne peut pas gérer SUPERADMIN
        return managerLevel <= targetLevel;
    }

    /**
     * Vérifie si un rôle peut modifier un autre rôle
     * Alias de canManage pour compatibilité
     * @param modifierRole Le rôle de celui qui veut modifier
     * @param targetRole Le rôle cible
     * @returns true si le modifierRole peut modifier le targetRole
     */
    static canModify(modifierRole: UserRole, targetRole: UserRole): boolean {
        return this.canManage(modifierRole, targetRole);
    }

    /**
     * Vérifie si un rôle peut créer un autre rôle
     * @param creatorRole Le rôle du créateur
     * @param roleToCreate Le rôle à créer
     * @returns true si le creatorRole peut créer le roleToCreate
     */
    static canCreate(creatorRole: UserRole, roleToCreate: UserRole): boolean {
        // SUPERADMIN peut créer tous les rôles (y compris d'autres SUPERADMIN)
        if (creatorRole === UserRole.SUPERADMIN) {
            return true;
        }

        // ADMINISTRATOR peut créer tous les rôles sauf SUPERADMIN
        if (creatorRole === UserRole.ADMINISTRATOR) {
            return roleToCreate !== UserRole.SUPERADMIN;
        }

        // Les autres rôles ne peuvent pas créer d'utilisateurs
        return false;
    }

    /**
     * Obtient le niveau hiérarchique d'un rôle
     * @param role Le rôle
     * @returns Le niveau (0 = le plus élevé)
     */
    static getLevel(role: UserRole): number {
        return this.HIERARCHY.indexOf(role);
    }

    /**
     * Vérifie si un rôle est supérieur à un autre
     * @param role1 Premier rôle
     * @param role2 Second rôle
     * @returns true si role1 est supérieur à role2
     */
    static isHigher(role1: UserRole, role2: UserRole): boolean {
        const level1 = this.getLevel(role1);
        const level2 = this.getLevel(role2);

        if (level1 === -1 || level2 === -1) {
            return false;
        }

        return level1 < level2;
    }

    /**
     * Vérifie si deux rôles sont au même niveau
     * @param role1 Premier rôle
     * @param role2 Second rôle
     * @returns true si les deux rôles sont égaux
     */
    static areEqual(role1: UserRole, role2: UserRole): boolean {
        return role1 === role2;
    }

    /**
     * Vérifie si un rôle peut supprimer un autre rôle
     * @param deleterRole Le rôle de celui qui veut supprimer
     * @param targetRole Le rôle cible
     * @returns true si le deleterRole peut supprimer le targetRole
     */
    static canDelete(deleterRole: UserRole, targetRole: UserRole): boolean {
        return this.canManage(deleterRole, targetRole);
    }
}