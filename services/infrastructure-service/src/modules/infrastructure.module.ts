// src/modules/infrastructure.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

// Controllers
import {
    BatimentController,
    EtageController,
    EspaceController,
    EquipementController,
    ImportController,
} from '../presentation/controllers';

// Application Services
import {
    BatimentService,
    EtageService,
    EspaceService,
    EquipementService,
    ImportService,
} from '../application/services';

// Application Mappers
import {
    BatimentMapper,
    EtageMapper,
    EspaceMapper,
    EquipementMapper,
} from '../application/mappers';

// Application Factories
import {
    BatimentFactory,
    EtageFactory,
    EspaceFactory,
    EquipementFactory,
} from '../application/factories';

// Event Handlers
import {
    EspaceEventHandler,
    EquipementEventHandler,
    ImportEventHandler,
} from '../application/handlers';

// Import Strategies
import {
    BatimentImportStrategy,
    EspaceImportStrategy,
    EquipementImportStrategy,
} from '../application/strategies';

// Guards
import { JwtAuthGuard, RolesGuard } from '../presentation/guards';

// Persistence Module
import { PersistenceModule } from './persistence.module';

// Messaging Module
import { MessagingModule } from './messaging.module';

/**
 * Module principal Infrastructure
 * Regroupe tous les composants de gestion des batiments, etages, espaces et equipements
 */
@Module({
    imports: [
        ConfigModule,
        PersistenceModule,
        MessagingModule,
    ],
    controllers: [
        BatimentController,
        EtageController,
        EspaceController,
        EquipementController,
        ImportController,
    ],
    providers: [
        // Application Services
        BatimentService,
        EtageService,
        EspaceService,
        EquipementService,
        ImportService,

        // Application Mappers
        BatimentMapper,
        EtageMapper,
        EspaceMapper,
        EquipementMapper,

        // Factories
        BatimentFactory,
        EtageFactory,
        EspaceFactory,
        EquipementFactory,

        // Event Handlers
        EspaceEventHandler,
        EquipementEventHandler,
        ImportEventHandler,

        // Import Strategies
        BatimentImportStrategy,
        EspaceImportStrategy,
        EquipementImportStrategy,

        // Guards
        JwtAuthGuard,
        RolesGuard,
    ],
    exports: [
        BatimentService,
        EtageService,
        EspaceService,
        EquipementService,
    ],
})
export class InfrastructureModule {}