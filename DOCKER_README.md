# IMMO360 Backend - Docker & Microservices Guide

Guide complet pour la conteneurisation et le déploiement des microservices IMMO360.

## 📋 Table des Matières

- [Architecture](#architecture)
- [Prérequis](#prérequis)
- [Structure du Projet](#structure-du-projet)
- [Démarrage Rapide](#démarrage-rapide)
- [Développement par Service](#développement-par-service)
- [Déploiement Global](#déploiement-global)
- [Tests E2E](#tests-e2e)
- [Configuration](#configuration)
- [Ports et Services](#ports-et-services)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

---

## 🏗️ Architecture

### Vue d'Ensemble

```
IMMO360 Microservices Architecture
├── API Gateway (4000)           # Point d'entrée principal
├── Auth Service (4001)          # Authentification JWT
├── User Service (4002)          # Gestion utilisateurs
├── Infrastructure Service (4003) # Gestion biens immobiliers
├── Equipment Service (4004)     # Gestion équipements
├── Incidents Service (4005)     # Gestion incidents
├── Audit Service (4006)         # Logs et audit
├── Analytics Service (4007)     # Analyses et statistiques
├── Notifications Service (4008) # Notifications
├── File Storage Service (4009)  # Stockage fichiers
├── Import/Export Service (4010) # Import/Export données
├── Sync Service (4011)          # Synchronisation
└── Predictions Service (4012)   # ML et prédictions

Infrastructure partagée:
├── PostgreSQL (5432)            # Base de données
├── Redis (6379)                 # Cache
└── RabbitMQ (5672, 15672)       # Message broker
```

### Communication

- **HTTP/REST**: Communication synchrone via API Gateway
- **RabbitMQ**: Communication asynchrone (événements)
- **Redis**: Cache partagé et sessions

---

## 🔧 Prérequis

### Requis

- **Docker** 24.0+
- **Docker Compose** 2.20+
- **Node.js** 20+ (pour développement local)
- **Git**

### Optionnel

- **Make** (pour les commandes simplifiées)
- **cURL** (pour tests API)
- **Postman** ou **Insomnia** (pour tests API)

### Vérification

```bash
# Vérifier Docker
docker --version
docker-compose --version

# Vérifier Node.js
node --version
npm --version
```

---

## 📁 Structure du Projet

```
immo360-backend/
├── services/                    # Microservices
│   ├── api-gateway/
│   │   ├── Dockerfile
│   │   ├── docker-compose.dev.yml
│   │   ├── src/
│   │   └── package.json
│   ├── auth-service/
│   │   ├── Dockerfile
│   │   ├── docker-compose.dev.yml
│   │   ├── src/
│   │   └── package.json
│   └── ... (11 autres services)
│
├── tests/
│   └── e2e/                     # Tests E2E inter-services
│       ├── setup.ts
│       ├── auth-flow.e2e.spec.ts
│       ├── inter-service.e2e.spec.ts
│       ├── jest.config.js
│       ├── package.json
│       └── tsconfig.json
│
├── scripts/
│   ├── docker-build-all.sh      # Build tous les services
│   ├── run-e2e-tests.sh         # Lancer tests E2E
│   └── generate-secrets.js      # Générer secrets
│
├── docker-compose.global.yml    # Orchestration globale
├── docker-compose.dev.yml       # Dev infrastructure
├── init-dbs.sql                 # Init bases de données
├── .env.example                 # Template variables
└── DOCKER_README.md             # Ce fichier
```

---

## 🚀 Démarrage Rapide

### 1. Cloner et Configurer

```bash
# Cloner le repository
git clone <repository-url>
cd immo360-backend

# Copier le fichier d'environnement
cp .env.example .env

# Éditer .env avec vos valeurs
nano .env
```

### 2. Démarrer l'Infrastructure

```bash
# Démarrer PostgreSQL, Redis, RabbitMQ
docker-compose -f docker-compose.dev.yml up -d

# Vérifier les services
docker-compose -f docker-compose.dev.yml ps
```

### 3. Démarrer Tous les Microservices

```bash
# Build et démarrer tous les services
docker-compose -f docker-compose.global.yml up --build -d

# Suivre les logs
docker-compose -f docker-compose.global.yml logs -f

# Vérifier le statut
docker-compose -f docker-compose.global.yml ps
```

### 4. Vérifier le Déploiement

```bash
# API Gateway
curl http://localhost:4000/health

# Auth Service
curl http://localhost:4001/health

# User Service
curl http://localhost:4002/health

# Ou vérifier tous les services
for port in {4000..4012}; do
  echo -n "Port $port: "
  curl -s http://localhost:$port/health && echo "✅" || echo "❌"
done
```

---

## 👨‍💻 Développement par Service

### Démarrer un Service Individuellement

Chaque service peut être développé et testé indépendamment:

```bash
# Exemple: Auth Service
cd services/auth-service

# Démarrer le service et ses dépendances
docker-compose -f docker-compose.dev.yml up --build

# Ou en mode détaché
docker-compose -f docker-compose.dev.yml up -d

# Voir les logs
docker-compose -f docker-compose.dev.yml logs -f auth-service

# Arrêter
docker-compose -f docker-compose.dev.yml down
```

### Développement avec Hot Reload

Pour développer en mode watch (hot reload):

```bash
cd services/auth-service

# Installer les dépendances
npm install

# Démarrer en mode dev (sans Docker)
npm run start:dev

# Ou utiliser Docker avec volume mount
docker-compose -f docker-compose.dev.yml up
```

### Build d'un Service

```bash
# Build l'image Docker
cd services/auth-service
docker build -t immo360/auth-service:latest .

# Ou utiliser docker-compose
docker-compose -f docker-compose.dev.yml build
```

---

## 🌐 Déploiement Global

### Démarrer Tout le Stack

```bash
# Build et démarrer tous les services
docker-compose -f docker-compose.global.yml up --build -d

# Démarrer sans rebuild
docker-compose -f docker-compose.global.yml up -d

# Scale un service (exemple: 3 instances de l'API Gateway)
docker-compose -f docker-compose.global.yml up -d --scale api-gateway=3
```

### Arrêter le Stack

```bash
# Arrêter tous les services
docker-compose -f docker-compose.global.yml down

# Arrêter et supprimer les volumes
docker-compose -f docker-compose.global.yml down -v

# Arrêter et supprimer les images
docker-compose -f docker-compose.global.yml down --rmi all
```

### Rebuild Complet

```bash
# Arrêter tout
docker-compose -f docker-compose.global.yml down -v

# Build toutes les images
./scripts/docker-build-all.sh

# Ou utiliser docker-compose
docker-compose -f docker-compose.global.yml build --no-cache

# Démarrer
docker-compose -f docker-compose.global.yml up -d
```

---

## 🧪 Tests E2E

### Configuration

```bash
# Naviguer vers le dossier des tests
cd tests/e2e

# Installer les dépendances
npm install
```

### Exécution

```bash
# S'assurer que tous les services sont démarrés
docker-compose -f docker-compose.global.yml up -d

# Attendre que les services soient prêts (30-60 secondes)
sleep 60

# Lancer les tests E2E
cd tests/e2e
npm test

# Ou utiliser le script
./scripts/run-e2e-tests.sh
```

### Tests Spécifiques

```bash
cd tests/e2e

# Test d'authentification uniquement
npm test -- auth-flow.e2e.spec.ts

# Test inter-services uniquement
npm test -- inter-service.e2e.spec.ts

# Mode watch
npm test -- --watch

# Avec coverage
npm test -- --coverage
```

### Résultats Attendus

```
PASS  tests/e2e/auth-flow.e2e.spec.ts
  Authentication Flow E2E
    ✓ should register a new user via API Gateway (234ms)
    ✓ should login with valid credentials (156ms)
    ✓ should fail login with invalid credentials (89ms)
    ✓ should access protected route with valid token (123ms)
    ✓ should fail to access protected route without token (67ms)
    ✓ should refresh token successfully (145ms)
    ✓ should logout successfully (98ms)

PASS  tests/e2e/inter-service.e2e.spec.ts
  Inter-Service Communication E2E
    ✓ All services health checks (1234ms)
    ...

Test Suites: 2 passed, 2 total
Tests:       15 passed, 15 total
Time:        12.345s
```

---

## ⚙️ Configuration

### Variables d'Environnement

Éditer `.env` à la racine du projet:

```env
# Serveur
NODE_ENV=development
HOST=0.0.0.0

# Base de données
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres

# JWT
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# RabbitMQ
RABBITMQ_URL=amqp://immo360:immo360@rabbitmq:5672
```

### Générer des Secrets

```bash
# Générer JWT_SECRET et autres secrets
node scripts/generate-secrets.js
```

### Configuration par Service

Chaque service peut avoir sa propre configuration dans `services/<service>/docker-compose.dev.yml`:

```yaml
environment:
  - NODE_ENV=development
  - PORT=4001
  - DB_HOST=auth-db
  - DB_DATABASE=immo360_auth
  # ... autres variables
```

---

## 🔌 Ports et Services

### Services Web

| Service | Port | URL | Description |
|---------|------|-----|-------------|
| API Gateway | 4000 | http://localhost:4000 | Point d'entrée principal |
| Auth Service | 4001 | http://localhost:4001 | Authentification |
| User Service | 4002 | http://localhost:4002 | Utilisateurs |
| Infrastructure Service | 4003 | http://localhost:4003 | Biens immobiliers |
| Equipment Service | 4004 | http://localhost:4004 | Équipements |
| Incidents Service | 4005 | http://localhost:4005 | Incidents |
| Audit Service | 4006 | http://localhost:4006 | Audit logs |
| Analytics Service | 4007 | http://localhost:4007 | Analytics |
| Notifications Service | 4008 | http://localhost:4008 | Notifications |
| File Storage Service | 4009 | http://localhost:4009 | Fichiers |
| Import/Export Service | 4010 | http://localhost:4010 | Import/Export |
| Sync Service | 4011 | http://localhost:4011 | Synchronisation |
| Predictions Service | 4012 | http://localhost:4012 | Prédictions |

### Infrastructure

| Service | Port(s) | URL | Credentials |
|---------|---------|-----|-------------|
| PostgreSQL | 5432 | localhost:5432 | postgres/postgres |
| Redis | 6379 | localhost:6379 | (pas d'auth) |
| RabbitMQ | 5672, 15672 | http://localhost:15672 | immo360/immo360 |

### RabbitMQ Management

Accéder à l'interface de gestion:
- URL: http://localhost:15672
- Username: `immo360`
- Password: `immo360`

---

## 📊 Monitoring

### Vérifier les Logs

```bash
# Tous les services
docker-compose -f docker-compose.global.yml logs -f

# Un service spécifique
docker-compose -f docker-compose.global.yml logs -f auth-service

# Dernières 100 lignes
docker-compose -f docker-compose.global.yml logs --tail=100

# Logs depuis un temps spécifique
docker-compose -f docker-compose.global.yml logs --since 10m
```

### Vérifier l'État des Services

```bash
# Status de tous les containers
docker-compose -f docker-compose.global.yml ps

# Détails d'un container
docker inspect immo360-auth-service

# Statistiques en temps réel
docker stats
```

### Health Checks

```bash
# Script pour vérifier tous les services
for port in {4000..4012}; do
  echo -n "Service on port $port: "
  response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$port/health)
  if [ "$response" == "200" ]; then
    echo "✅ OK"
  else
    echo "❌ FAIL (HTTP $response)"
  fi
done
```

### Monitoring RabbitMQ

```bash
# Lister les queues
docker exec immo360-rabbitmq rabbitmqctl list_queues

# Lister les exchanges
docker exec immo360-rabbitmq rabbitmqctl list_exchanges

# Lister les connections
docker exec immo360-rabbitmq rabbitmqctl list_connections
```

### Monitoring PostgreSQL

```bash
# Se connecter à PostgreSQL
docker exec -it immo360-postgres psql -U postgres

# Lister les bases de données
\l

# Se connecter à une base
\c immo360_auth

# Lister les tables
\dt

# Requête SQL
SELECT * FROM users LIMIT 10;
```

---

## 🐛 Troubleshooting

### Problème: Service ne démarre pas

```bash
# Vérifier les logs
docker-compose -f docker-compose.global.yml logs auth-service

# Vérifier les variables d'environnement
docker exec immo360-auth-service printenv

# Rebuild le service
docker-compose -f docker-compose.global.yml up --build -d auth-service
```

### Problème: Connexion à la base de données échoue

```bash
# Vérifier que PostgreSQL est démarré
docker-compose -f docker-compose.global.yml ps postgres

# Vérifier les logs PostgreSQL
docker-compose -f docker-compose.global.yml logs postgres

# Tester la connexion manuellement
docker exec -it immo360-postgres psql -U postgres -c "SELECT 1;"

# Recréer la base de données
docker-compose -f docker-compose.global.yml down postgres
docker volume rm immo360-backend_postgres-data
docker-compose -f docker-compose.global.yml up -d postgres
```

### Problème: Port déjà utilisé

```bash
# Identifier quel processus utilise le port
# Linux/Mac
lsof -i :4000

# Windows
netstat -ano | findstr :4000

# Arrêter le processus ou changer le port dans docker-compose
```

### Problème: Volumes corrompus

```bash
# Supprimer tous les volumes
docker-compose -f docker-compose.global.yml down -v

# Recréer et démarrer
docker-compose -f docker-compose.global.yml up -d
```

### Problème: Mémoire insuffisante

```bash
# Augmenter les ressources Docker
# Docker Desktop → Settings → Resources

# Ou nettoyer Docker
docker system prune -a --volumes
```

### Problème: Build lent

```bash
# Utiliser le cache BuildKit
export DOCKER_BUILDKIT=1
docker-compose -f docker-compose.global.yml build

# Build en parallèle
docker-compose -f docker-compose.global.yml build --parallel
```

---

## 📝 Commandes Utiles

### Docker Compose

```bash
# Démarrer
docker-compose -f docker-compose.global.yml up -d

# Arrêter
docker-compose -f docker-compose.global.yml down

# Rebuild
docker-compose -f docker-compose.global.yml up --build -d

# Logs
docker-compose -f docker-compose.global.yml logs -f

# Status
docker-compose -f docker-compose.global.yml ps

# Exec dans un container
docker-compose -f docker-compose.global.yml exec auth-service sh

# Scale
docker-compose -f docker-compose.global.yml up -d --scale auth-service=3
```

### Docker

```bash
# Lister les containers
docker ps

# Lister les images
docker images

# Supprimer un container
docker rm -f <container-id>

# Supprimer une image
docker rmi <image-id>

# Nettoyer
docker system prune -a

# Stats
docker stats

# Logs
docker logs -f <container-name>
```

### Volumes

```bash
# Lister les volumes
docker volume ls

# Inspecter un volume
docker volume inspect immo360-backend_postgres-data

# Supprimer un volume
docker volume rm immo360-backend_postgres-data

# Nettoyer les volumes inutilisés
docker volume prune
```

---

## 🚢 Déploiement Production

### Build Production

```bash
# Build toutes les images pour production
docker-compose -f docker-compose.global.yml build

# Tag les images
docker tag immo360/auth-service:latest immo360/auth-service:1.0.0

# Push vers registry
docker push immo360/auth-service:1.0.0
```

### Variables de Production

Créer un fichier `.env.production`:

```env
NODE_ENV=production
JWT_SECRET=<secret-fort-genere>
DB_PASSWORD=<mot-de-passe-fort>
RABBITMQ_URL=<url-cloudamqp>
REDIS_HOST=<redis-host>
```

### Docker Swarm (Optionnel)

```bash
# Initialiser Swarm
docker swarm init

# Déployer le stack
docker stack deploy -c docker-compose.global.yml immo360

# Lister les services
docker stack services immo360

# Supprimer le stack
docker stack rm immo360
```

---

## 📚 Ressources

### Documentation

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [NestJS Documentation](https://docs.nestjs.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Redis Documentation](https://redis.io/documentation)
- [RabbitMQ Documentation](https://www.rabbitmq.com/documentation.html)

### Guides du Projet

- [QUICK_START_RENDER.md](QUICK_START_RENDER.md) - Déploiement sur Render
- [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md) - Guide Render complet
- [RABBITMQ_CLOUDAMQP_SETUP.md](RABBITMQ_CLOUDAMQP_SETUP.md) - Configuration RabbitMQ
- [ARCHITECTURE.md](ARCHITECTURE.md) - Architecture détaillée
- [API_DOCUMENTATION.md](API_DOCUMENTATION.md) - Documentation API

---

## ✅ Checklist de Déploiement

### Avant de Démarrer

- [ ] Docker et Docker Compose installés
- [ ] Fichier `.env` configuré
- [ ] Ports 4000-4012, 5432, 6379, 5672, 15672 disponibles
- [ ] 8GB RAM minimum disponible

### Démarrage

- [ ] Infrastructure démarrée (PostgreSQL, Redis, RabbitMQ)
- [ ] Bases de données créées
- [ ] Tous les services buildés
- [ ] Tous les services démarrés
- [ ] Health checks passent pour tous les services

### Tests

- [ ] Tests E2E installés
- [ ] Tests E2E exécutés avec succès
- [ ] Tous les services communiquent correctement
- [ ] RabbitMQ traite les événements

### Production

- [ ] Variables de production configurées
- [ ] Secrets générés et sécurisés
- [ ] Images taguées et pushées
- [ ] Backup strategy en place
- [ ] Monitoring configuré

---

## 🤝 Support

Pour toute question ou problème:

1. Vérifier la section [Troubleshooting](#troubleshooting)
2. Consulter les logs des services
3. Vérifier la documentation des services individuels
4. Créer une issue sur GitHub

---

**IMMO360 - Architecture Microservices Complète avec Docker** 🎉

Dernière mise à jour: $(date +%Y-%m-%d)
