import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { SiteEntity } from '../domain/entities/site.entity';
import { BuildingEntity } from '../domain/entities/building.entity';
import { FloorEntity } from '../domain/entities/floor.entity';
import { SpaceEntity } from '../domain/entities/space.entity';

// Repositories
import { TypeOrmBuildingRepository } from './persistence/repositories/typeorm-building.repository';
import { TypeOrmSpaceRepository } from './persistence/repositories/typeorm-space.repository';

// Services
import { BuildingService } from '../application/services/building.service';
import { SpaceService } from '../application/services/space.service';

// Controllers
import { BuildingController } from './http/controllers/building.controller';
import { SpaceController } from './http/controllers/space.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            SiteEntity,
            BuildingEntity,
            FloorEntity,
            SpaceEntity
        ])
    ],
    controllers: [
        BuildingController,
        SpaceController
    ],
    providers: [
        BuildingService,
        SpaceService,
        {
            provide: 'IBuildingRepository',
            useClass: TypeOrmBuildingRepository,
        },
        {
            provide: 'ISpaceRepository',
            useClass: TypeOrmSpaceRepository,
        },
    ],
    exports: [BuildingService, SpaceService],
})
export class BuildingModule { }