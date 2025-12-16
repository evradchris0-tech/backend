import { BuildingEntity } from '../entities/building.entity';

export interface IBuildingRepository {
    save(building: BuildingEntity): Promise<BuildingEntity>;
    
    findAll(): Promise<BuildingEntity[]>;
    
    findById(id: string): Promise<BuildingEntity | null>;

    findByCode(code: string, siteId: string): Promise<BuildingEntity | null>;
    
    findBySiteId(siteId: string): Promise<BuildingEntity[]>;

    exists(code: string, siteId: string): Promise<boolean>;

    delete(id: string): Promise<void>;

    update(id: string, building: BuildingEntity): Promise<BuildingEntity>;

    updateStatus(id: string, status: string): Promise<BuildingEntity>;

    updateLocationData(id: string, locationData: { x: number; y: number; z: number; rotation: number }): Promise<BuildingEntity>;

    updateMetadata(id: string, metadata: Record<string, any>): Promise<BuildingEntity>;

    updateFloorsCount(id: string, floorsCount: number): Promise<BuildingEntity>;

    updateTotalCapacity(id: string, totalCapacity: number): Promise<BuildingEntity>;

    updateSiteId(id: string, siteId: string): Promise<BuildingEntity>;

    updateName(id: string, name: string): Promise<BuildingEntity>;

    updateCode(id: string, code: string): Promise<BuildingEntity>;

    updateType(id: string, type: string): Promise<BuildingEntity>;

    updateDescription(id: string, description: string): Promise<BuildingEntity>;

    updateCapacity(id: string, capacity: number): Promise<BuildingEntity>;

    updateStatusByIds(ids: string[], status: string): Promise<void>;
}