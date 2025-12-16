import { SpaceType } from '../../domain/enums/space-type.enum';

export class SpaceMapDto {
    id: string;
    number: string;
    type: SpaceType;
    status: string; // Pour la couleur (Vert/Rouge)

    // Configuration purement visuelle
    babylonConfig: {
        modelId?: string;
        dimensions?: { width: number; height: number; depth: number };
        position?: { x: number; y: number; z: number };
        rotation?: number;
    };

    // Indicateurs rapides pour l'UI (Icones au dessus de la pièce)
    alerts: {
        incidentCount: number;
        occupancyRate: number;
    };
}