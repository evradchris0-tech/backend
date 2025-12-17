# Equipement Service - Immo360

Microservice de gestion des équipements, stock matériel, affectations et mouvements.

## 🏗️ Architecture

Ce service implémente l'**Architecture Hexagonale** (Ports & Adapters) avec **Domain-Driven Design**.

```
src/
├── domain/              # Logique métier pure
├── application/         # Use Cases & DTOs
├── infrastructure/      # Détails techniques (DB, RabbitMQ)
├── presentation/        # API REST (Controllers)
└── modules/            # Modules NestJS
```

## 🚀 Démarrage rapide

### Prérequis

- Node.js 20+
- PostgreSQL 15+
- RabbitMQ 3.12+
- Docker (optionnel)

### Installation

```bash
# Installer les dépendances
npm install

# Copier le fichier .env
cp .env.example .env
```

### Développement

```bash
# Démarrer en mode dev
npm run start:dev

# Avec Docker
docker-compose up -d
```

## 📚 API Documentation

Une fois lancé, la documentation Swagger est disponible:
```
http://localhost:3004/api/docs
```

## 🗄️ Base de données

### Migrations TypeORM

```bash
# Générer une migration
npm run migration:generate -- src/infrastructure/migrations/InitialSchema

# Exécuter les migrations
npm run migration:run

# Annuler la dernière migration
npm run migration:revert
```

## 🧪 Tests

```bash
# Tests unitaires
npm run test

# Tests e2e
npm run test:e2e

# Coverage
npm run test:cov
```

## 📦 Build & Déploiement

```bash
# Build pour production
npm run build

# Démarrer en production
npm run start:prod
```

## 🐳 Docker

```bash
# Build l'image
docker build -t equipement-service .

# Démarrer avec docker-compose
docker-compose up -d

# Logs
docker-compose logs -f equipement-service
```

## 🔧 Variables d'environnement

Voir [.env.example](.env.example) pour la liste complète.

## 📋 Fonctionnalités

### Gestion Équipements
- ✅ CRUD équipements
- ✅ Catégorisation hiérarchique
- ✅ Recherche multicritères
- ✅ Gestion métadonnées

### Gestion Stock
- ✅ Entrées/Sorties
- ✅ Réservations
- ✅ Alertes stock faible
- ✅ Historique mouvements

### Affectations
- ✅ Affectation équipements
- ✅ Gestion retours
- ✅ Suivi retards

### Événements
- ✅ Stock faible/épuisé
- ✅ Maintenance nécessaire
- ✅ Affectations en retard

## 🔗 Intégrations

- **Infrastructure Service**: Espaces de stockage (bâtiments)
- **User Service**: Authentification & utilisateurs
- **Notification Service**: Alertes temps réel

## 📝 License

Private - Immo360
