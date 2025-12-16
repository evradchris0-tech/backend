import { SpaceEntity } from '../entities/space.entity';
import { SpaceType } from '../enums/space-type.enum';

export interface ISpaceRepository {
    save(space: SpaceEntity): Promise<SpaceEntity>;
    findById(id: string): Promise<SpaceEntity | null>;

    // Pour la navigation
    findByFloorId(floorId: string): Promise<SpaceEntity[]>;
    findByBuildingId(buildingId: string): Promise<SpaceEntity[]>;

    // Pour éviter les doublons (ex: deux chambres 101 au même étage)
    findByNumber(number: string, floorId: string): Promise<SpaceEntity | null>;

    // Pour la Heatmap 3D (filtres rapides)
    findWithBabylonConfig(buildingId: string): Promise<SpaceEntity[]>;

    delete(id: string): Promise<void>;

    update(id: string, space: SpaceEntity): Promise<SpaceEntity>;
    
    updateStatus(id: string, status: string): Promise<SpaceEntity>;
    
    updateCapacity(id: string, capacity: number): Promise<SpaceEntity>;
    
    updateSurfaceArea(id: string, surfaceArea: number): Promise<SpaceEntity>;
    
    updateBabylonConfig(id: string, babylonConfig: Record<string, any>): Promise<SpaceEntity>;
    
    updateFeatures(id: string, features: Record<string, any>): Promise<SpaceEntity>;

    updateType(id: string, type: SpaceType): Promise<SpaceEntity>;

    updateFloorId(id: string, floorId: string): Promise<SpaceEntity>;
    
    updateName(id: string, name: string): Promise<SpaceEntity>;

    updateNumber(id: string, number: string): Promise<SpaceEntity>;
    
    updateDescription(id: string, description: string): Promise<SpaceEntity>;

    updateStatusByIds(ids: string[], status: string): Promise<void>;

    updateCapacityByIds(ids: string[], capacity: number): Promise<void>;

    updateSurfaceAreaByIds(ids: string[], surfaceArea: number): Promise<void>;
}