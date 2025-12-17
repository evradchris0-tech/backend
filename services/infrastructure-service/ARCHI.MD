# Infrastructure Service - Architecture Documentation

## Overview

Service de gestion des infrastructures IUSJC implementant une **Architecture Hexagonale** (Ports & Adapters) avec Clean Architecture et Domain-Driven Design.

## Architecture Layers

```
infrastructure-service/
├── src/
│   ├── domain/                 # Core Business Logic (innermost)
│   │   ├── entities/           # Business entities
│   │   ├── value-objects/      # Immutable value objects
│   │   ├── enums/              # Domain enumerations
│   │   ├── events/             # Domain events
│   │   ├── repositories/       # Port interfaces (abstractions)
│   │   └── specifications/     # Specification pattern
│   │
│   ├── application/            # Application Services Layer
│   │   ├── dto/                # Data Transfer Objects
│   │   ├── factories/          # Entity factories
│   │   ├── strategies/         # Strategy pattern (import)
│   │   ├── builders/           # Builder pattern (statistics)
│   │   ├── mappers/            # Domain <-> DTO mappers
│   │   ├── services/           # Application services
│   │   └── handlers/           # Event handlers
│   │
│   ├── infrastructure/         # Infrastructure Layer (adapters)
│   │   ├── config/             # Configuration files
│   │   ├── messaging/          # RabbitMQ adapters
│   │   └── persistence/        # Database adapters
│   │       ├── entities/       # TypeORM entities
│   │       ├── mappers/        # ORM mappers
│   │       └── repositories/   # Repository implementations
│   │
│   ├── presentation/           # Presentation Layer
│   │   ├── controllers/        # REST controllers
│   │   ├── guards/             # Auth guards
│   │   ├── decorators/         # Custom decorators
│   │   └── filters/            # Exception filters
│   │
│   └── modules/                # NestJS modules
│
├── test/                       # Tests
├── package.json
├── tsconfig.json
└── .env.example
```

## Design Patterns Implemented

| Pattern | Location | Purpose |
|---------|----------|---------|
| Repository | domain/repositories | Data access abstraction |
| Factory | application/factories | Complex entity creation |
| Specification | domain/specifications | Composable query filters |
| Observer/Event | domain/events + handlers | Decoupled communication |
| Strategy | application/strategies | Excel import variants |
| Builder | application/builders | Complex object construction |
| Value Object | domain/value-objects | Immutable domain values |
| Mapper | application/mappers | Layer transformation |

## Domain Entities

- **Batiment**: Building entity with coordinates, type, status
- **Etage**: Floor entity linked to a building
- **Espace**: Space entity (room, classroom, office)
- **Equipement**: Equipment with status, maintenance history

## API Endpoints

### Batiments
- `POST /api/v1/batiments` - Create building
- `GET /api/v1/batiments` - List buildings (paginated)
- `GET /api/v1/batiments/:id` - Get building by ID
- `GET /api/v1/batiments/:id/stats` - Get building with statistics
- `PUT /api/v1/batiments/:id` - Update building
- `PUT /api/v1/batiments/:id/desactiver` - Deactivate building
- `DELETE /api/v1/batiments/:id` - Delete building

### Etages
- `POST /api/v1/etages` - Create floor
- `POST /api/v1/etages/multiple` - Create multiple floors
- `GET /api/v1/etages/batiment/:batimentId` - List floors by building
- `PUT /api/v1/etages/:id` - Update floor

### Espaces
- `POST /api/v1/espaces` - Create space
- `POST /api/v1/espaces/chambres/lot` - Create batch of rooms
- `GET /api/v1/espaces/etage/:etageId` - List spaces by floor
- `GET /api/v1/espaces/status/defectueux` - List defective spaces
- `PUT /api/v1/espaces/:id/occupant` - Assign occupant
- `PUT /api/v1/espaces/:id/liberer` - Release space

### Equipements
- `POST /api/v1/equipements` - Create equipment
- `POST /api/v1/equipements/lot` - Create batch
- `POST /api/v1/equipements/kit-chambre` - Create room kit
- `GET /api/v1/equipements/espace/:espaceId` - List by space
- `PUT /api/v1/equipements/:id/statut` - Change status
- `GET /api/v1/equipements/:id/prediction` - Get maintenance prediction

### Import
- `POST /api/v1/import` - Import from Excel
- `POST /api/v1/import/validate` - Validate Excel without import
- `GET /api/v1/import/template/download` - Download template

## Event Flow

1. Equipment status changes
2. `EquipementStatusChangedEvent` emitted
3. `EquipementEventHandler` processes event
4. Updates space defective flag
5. Emits `EspaceDefectueuxEvent` if flag changed
6. Publishes to RabbitMQ for notification-service

## Database Schema

PostgreSQL tables:
- `batiments` - Buildings
- `etages` - Floors (FK to batiments)
- `espaces` - Spaces (FK to etages)
- `equipements` - Equipment (FK to espaces)

## Inter-Service Communication

RabbitMQ queues:
- `infrastructure_queue` - Incoming commands
- `incident_queue` - Equipment status notifications
- `notification_queue` - User notifications
- `audit_queue` - Audit logging

## Security

- JWT authentication via `JwtAuthGuard`
- Role-based access control via `RolesGuard`
- Roles: ADMIN, SUPER_ADMIN, SUPERVISEUR, AGENT

## Running the Service

```bash
# Install dependencies
npm install

# Development
npm run start:dev

# Production
npm run build
npm run start:prod

# Database migrations
npm run migration:run
```

## Environment Variables

See `.env.example` for required configuration.

Port: 4003 (default)