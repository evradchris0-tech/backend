import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PersistenceModule } from './persistence.module';
import { MessagingModule } from './messaging.module';
import {
  EquipementService,
  StockService,
  CategorieService,
} from '../application/services';
import {
  StockAlerteHandler,
  EquipementEventHandler,
  AffectationEventHandler,
} from '../application/handlers';
import {
  EquipementController,
  CategorieController,
} from '../presentation/controllers';

/**
 * Module principal Équipement
 * Regroupe tous les composants liés aux équipements
 */
@Module({
  imports: [
    PersistenceModule,
    MessagingModule,
    EventEmitterModule.forRoot({
      wildcard: false,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 10,
      verboseMemoryLeak: true,
      ignoreErrors: false,
    }),
  ],
  controllers: [EquipementController, CategorieController],
  providers: [
    // Application Services
    EquipementService,
    StockService,
    CategorieService,

    // Event Handlers (publish to RabbitMQ)
    StockAlerteHandler,
    EquipementEventHandler,
    AffectationEventHandler,
  ],
  exports: [EquipementService, StockService, CategorieService],
})
export class EquipementModule {}
