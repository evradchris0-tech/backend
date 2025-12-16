# IMMO360 Backend

Architecture microservices pour la gestion immobilière complète.

## 🏗️ Architecture

13 microservices NestJS + 9 bases PostgreSQL + Redis + RabbitMQ

- **API Gateway** - Point d'entrée et routage
- **Auth Service** - Authentification JWT et OAuth
- **User Service** - Gestion utilisateurs et permissions
- **Infrastructure Service** - Gestion des biens immobiliers
- **Equipment Service** - Gestion des équipements
- **Incidents Service** - Gestion des incidents
- **Audit Service** - Logs et audit trail
- **Analytics Service** - Analyses et statistiques
- **Notifications Service** - Emails et notifications
- **File Storage Service** - Stockage de fichiers
- **Import/Export Service** - Import/Export Excel
- **Sync Service** - Synchronisation
- **Predictions Service** - ML et prédictions

## 🚀 Déploiement sur Render

### Guide Rapide (30 minutes)

**[📖 QUICK_START_RENDER.md](QUICK_START_RENDER.md)**

1. Configurer CloudAMQP (RabbitMQ)
2. Pousser sur Git
3. Déployer via Blueprint Render
4. Configurer Environment Groups
5. Vérifier et tester

### Documentation Complète

- **[README_DEPLOYMENT.md](README_DEPLOYMENT.md)** - Vue d'ensemble du déploiement
- **[RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md)** - Guide détaillé Render
- **[RABBITMQ_CLOUDAMQP_SETUP.md](RABBITMQ_CLOUDAMQP_SETUP.md)** - Configuration RabbitMQ
- **[RENDER_ENVIRONMENT_GROUPS.md](RENDER_ENVIRONMENT_GROUPS.md)** - Variables d'environnement

## 💻 Développement Local

### Prérequis

- Node.js 20+
- PostgreSQL 15
- Redis 7
- RabbitMQ 3

### Installation

```bash
# Installer les dépendances racine
npm install

# Installer les dépendances de chaque service
cd services/auth-service && npm install
cd services/user-service && npm install
# ... pour chaque service

# Ou utiliser Docker Compose
docker-compose -f docker-compose.dev.yml up -d
```

### Configuration

```bash
# Copier le fichier d'exemple
cp .env.example .env

# Éditer .env avec vos valeurs
nano .env
```

### Démarrage

```bash
# Démarrer tous les services
npm run start:dev

# Ou individuellement
cd services/auth-service && npm run start:dev
```

### Tests

```bash
# Tests unitaires
npm run test

# Tests e2e
npm run test:e2e

# Coverage
npm run test:cov
```

## 📚 Documentation API

- **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** - Documentation complète des API
- **[COMPLETE_TESTING_GUIDE.http](COMPLETE_TESTING_GUIDE.http)** - Collection de tests REST
- **[IMMO360-Complete-Collection.json](IMMO360-Complete-Collection.json)** - Collection Postman

## 🔒 Sécurité

- Authentification JWT
- Refresh tokens
- Role-based access control (RBAC)
- Audit logging
- Rate limiting
- CORS configuré
- Validation des données

## 🛠️ Technologies

### Backend
- **NestJS** - Framework Node.js
- **TypeScript** - Langage
- **TypeORM** - ORM
- **PostgreSQL** - Base de données
- **Redis** - Cache
- **RabbitMQ** - Message broker
- **JWT** - Authentification
- **Passport** - Stratégies auth

### DevOps
- **Docker** - Conteneurisation
- **Docker Compose** - Orchestration locale
- **Render** - Hébergement cloud
- **CloudAMQP** - RabbitMQ managé

## 📊 Structure du Projet

```
immo360-backend/
├── services/
│   ├── api-gateway/           # Point d'entrée
│   ├── auth-service/          # Authentification
│   ├── user-service/          # Utilisateurs
│   ├── infrastructure-service/ # Biens immobiliers
│   ├── equipment-service/     # Équipements
│   ├── incidents-service/     # Incidents
│   ├── audit-service/         # Audit
│   ├── analytics-service/     # Analytics
│   ├── notifications-service/ # Notifications
│   ├── file-storage-service/  # Fichiers
│   ├── import-export-service/ # Import/Export
│   ├── sync-service/          # Synchronisation
│   └── predictions-service/   # Prédictions
├── shared/                    # Code partagé
├── infrastructure/            # Config infrastructure
├── docs/                      # Documentation
├── render.yaml               # Config Render
├── docker-compose.dev.yml    # Docker local
└── .env.example              # Variables d'env

Chaque service contient:
├── src/
│   ├── domain/          # Entités métier
│   ├── application/     # Cas d'usage
│   ├── infrastructure/  # Adapters (DB, API, etc.)
│   ├── config/          # Configuration
│   └── main.ts          # Point d'entrée
├── test/                # Tests
└── package.json
```

## 🌐 URLs de Production

- **API Gateway**: `https://immo360-api-gateway.onrender.com`
- **Render Dashboard**: `https://dashboard.render.com`
- **CloudAMQP**: `https://customer.cloudamqp.com`

## 💰 Coûts

### Plan Gratuit (Dev/Test)
- 13 services web: **0€**
- 9 PostgreSQL: **0€**
- Redis: **0€**
- CloudAMQP: **0€**
- **Total: 0€/mois**

### Plan Production
- Services critiques (3): **21€**
- Bases critiques (2): **14€**
- Redis: **10€**
- CloudAMQP: **19€**
- **Total: ~64€/mois**

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 License

MIT

## 👥 Équipe

IMMO360 Team

## 📞 Support

- Documentation: Voir `/docs`
- Issues: GitHub Issues
- Email: support@immo360.com

---

**Prêt à déployer?** Commencez par [QUICK_START_RENDER.md](QUICK_START_RENDER.md)
