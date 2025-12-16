# Architecture IMMO360 - Microservices sur Render

## 🏗️ Vue d'Ensemble de l'Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            INTERNET                                      │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │ HTTPS
                               │
                    ┌──────────▼──────────┐
                    │   API GATEWAY       │
                    │  :10000             │
                    │  ┌──────────────┐   │
                    │  │ Rate Limit   │   │
                    │  │ JWT Auth     │   │
                    │  │ Routing      │   │
                    │  └──────────────┘   │
                    └──────────┬──────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
┌───────▼────────┐    ┌────────▼────────┐    ┌──────▼──────┐
│  Auth Service  │    │  User Service   │    │ Infra Svc   │
│  :10000        │    │  :10000         │    │ :10000      │
│  ┌──────────┐  │    │  ┌──────────┐   │    │             │
│  │ JWT      │  │    │  │ Users    │   │    │             │
│  │ OAuth    │  │    │  │ Roles    │   │    │             │
│  │ Sessions │  │    │  │ Perms    │   │    │             │
│  └──────────┘  │    │  └──────────┘   │    │             │
└───────┬────────┘    └────────┬────────┘    └──────┬──────┘
        │                      │                     │
        │                      │                     │
   ┌────▼─────┐          ┌─────▼────┐         ┌─────▼─────┐
   │ Auth DB  │          │ User DB  │         │ Infra DB  │
   │ PG 15    │          │ PG 15    │         │ PG 15     │
   └──────────┘          └──────────┘         └───────────┘


┌──────────────────────────────────────────────────────────────────────┐
│                     AUTRES MICROSERVICES                              │
├──────────────────┬──────────────────┬──────────────────┬─────────────┤
│ Equipment Svc    │ Incidents Svc    │ Audit Svc        │ Analytics   │
│ :10000           │ :10000           │ :10000           │ :10000      │
├──────────────────┼──────────────────┼──────────────────┼─────────────┤
│ Equipment DB     │ Incidents DB     │ Audit DB         │ Analytics DB│
│ PG 15            │ PG 15            │ PG 15            │ PG 15       │
└──────────────────┴──────────────────┴──────────────────┴─────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                     SERVICES ADDITIONNELS                             │
├──────────────────┬──────────────────┬──────────────────┬─────────────┤
│ Notifications    │ File Storage     │ Import/Export    │ Sync Svc    │
│ :10000           │ :10000           │ :10000           │ :10000      │
├──────────────────┼──────────────────┼──────────────────┼─────────────┤
│ Notifs DB        │ Files DB         │                  │             │
│ PG 15            │ PG 15            │                  │             │
└──────────────────┴──────────────────┴──────────────────┴─────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                     INFRASTRUCTURE PARTAGÉE                          │
├──────────────────────────────┬───────────────────────────────────────┤
│      REDIS (Cache)           │    RabbitMQ (CloudAMQP)              │
│      :6379                   │    amqps://                           │
│                              │                                       │
│  • Sessions utilisateur      │  • Événements inter-services         │
│  • Rate limiting             │  • Notifications asynchrones         │
│  • Cache requêtes            │  • Audit logs                        │
│                              │  • Analytics events                  │
└──────────────────────────────┴───────────────────────────────────────┘
```

## 📊 Détails des Services

### 🚪 API Gateway
**Rôle**: Point d'entrée unique de l'application

**Responsabilités**:
- Routage des requêtes vers les microservices
- Authentification JWT
- Rate limiting
- CORS
- Load balancing

**Technologies**:
- NestJS
- Redis (cache)
- Passport JWT

**URL Production**: `https://immo360-api-gateway.onrender.com`

---

### 🔐 Auth Service
**Rôle**: Gestion de l'authentification et autorisation

**Responsabilités**:
- Login/Logout
- Génération JWT tokens
- Refresh tokens
- OAuth (Google)
- Session management
- Account locking

**Base de Données**: Auth DB (PostgreSQL)
- Tables: users, sessions, refresh_tokens, login_attempts

**Technologies**:
- NestJS
- TypeORM
- Passport (Local, JWT, Google)
- bcrypt

**URL Production**: `https://immo360-auth-service.onrender.com`

---

### 👥 User Service
**Rôle**: Gestion des utilisateurs et permissions

**Responsabilités**:
- CRUD utilisateurs
- Gestion des rôles
- Gestion des permissions
- Profils utilisateurs

**Base de Données**: User DB (PostgreSQL)
- Tables: users, roles, permissions, user_roles, role_permissions

**Technologies**:
- NestJS
- TypeORM
- RabbitMQ (événements)

**URL Production**: `https://immo360-user-service.onrender.com`

---

### 🏢 Infrastructure Service
**Rôle**: Gestion des biens immobiliers

**Responsabilités**:
- CRUD biens immobiliers
- Gestion des lots
- Gestion des occupants
- Import Excel occupants

**Base de Données**: Infrastructure DB (PostgreSQL)
- Tables: buildings, lots, occupants

**Technologies**:
- NestJS
- TypeORM
- XLSX (import/export)

**URL Production**: `https://immo360-infrastructure-service.onrender.com`

---

### 🔧 Equipment Service
**Rôle**: Gestion des équipements

**Responsabilités**:
- CRUD équipements
- Maintenance
- Historique

**Base de Données**: Equipment DB (PostgreSQL)
- Tables: equipment, maintenance, history

**URL Production**: `https://immo360-equipment-service.onrender.com`

---

### 🚨 Incidents Service
**Rôle**: Gestion des incidents et tickets

**Responsabilités**:
- CRUD incidents
- Workflow de résolution
- Notifications

**Base de Données**: Incidents DB (PostgreSQL)
- Tables: incidents, comments, attachments

**URL Production**: `https://immo360-incidents-service.onrender.com`

---

### 📝 Audit Service
**Rôle**: Journalisation des actions

**Responsabilités**:
- Logs de toutes les actions
- Traçabilité
- Compliance

**Base de Données**: Audit DB (PostgreSQL)
- Tables: audit_logs

**Technologies**:
- NestJS
- RabbitMQ (consumer)

**URL Production**: `https://immo360-audit-service.onrender.com`

---

### 📊 Analytics Service
**Rôle**: Analyses et statistiques

**Responsabilités**:
- KPIs
- Dashboards
- Rapports

**Base de Données**: Analytics DB (PostgreSQL)
- Tables: metrics, reports

**URL Production**: `https://immo360-analytics-service.onrender.com`

---

### 🔔 Notifications Service
**Rôle**: Envoi de notifications

**Responsabilités**:
- Emails
- Push notifications
- SMS (futur)

**Base de Données**: Notifications DB (PostgreSQL)
- Tables: notifications, templates

**Technologies**:
- NestJS
- Nodemailer
- RabbitMQ (consumer)

**URL Production**: `https://immo360-notifications-service.onrender.com`

---

### 📁 File Storage Service
**Rôle**: Stockage et gestion de fichiers

**Responsabilités**:
- Upload fichiers
- Download fichiers
- Gestion métadonnées

**Base de Données**: Files DB (PostgreSQL)
- Tables: files, metadata

**Technologies**:
- NestJS
- Multer
- File system (/tmp sur Render)

**URL Production**: `https://immo360-file-storage-service.onrender.com`

---

### 📥 Import/Export Service
**Rôle**: Import et export de données

**Responsabilités**:
- Import Excel
- Export Excel/CSV
- Validation données

**Technologies**:
- NestJS
- XLSX

**URL Production**: `https://immo360-import-export-service.onrender.com`

---

### 🔄 Sync Service
**Rôle**: Synchronisation de données

**Responsabilités**:
- Sync entre services
- Cache invalidation
- Data consistency

**Technologies**:
- NestJS
- Redis

**URL Production**: `https://immo360-sync-service.onrender.com`

---

### 🤖 Predictions Service
**Rôle**: Machine Learning et prédictions

**Responsabilités**:
- Prédictions de maintenance
- Analyse de tendances
- ML models

**Technologies**:
- NestJS
- (ML libs à ajouter)

**URL Production**: `https://immo360-predictions-service.onrender.com`

---

## 🔗 Communication Inter-Services

### 1. HTTP/REST
Services communiquent via HTTP REST API:
- API Gateway → Services backend
- Service-to-service (direct)

### 2. RabbitMQ (Asynchrone)
Événements asynchrones via RabbitMQ:

```
Auth Service → RabbitMQ → Audit Service (log login)
User Service → RabbitMQ → Notifications Service (welcome email)
Infrastructure → RabbitMQ → Analytics Service (metrics)
```

**Exchanges**:
- `immo360.events` (topic)

**Routing Keys**:
- `auth.login`
- `auth.logout`
- `user.created`
- `user.updated`
- `incident.created`
- etc.

### 3. Redis (Cache)
Cache partagé:
- Sessions utilisateur
- Rate limiting
- Cache de requêtes

---

## 🗄️ Bases de Données

### PostgreSQL 15

**9 bases de données indépendantes**:
1. Auth DB (authentification)
2. User DB (utilisateurs)
3. Infrastructure DB (biens)
4. Equipment DB (équipements)
5. Incidents DB (incidents)
6. Audit DB (logs)
7. Analytics DB (analytics)
8. Notifications DB (notifications)
9. Files DB (fichiers)

**Avantages**:
- ✅ Isolation des données
- ✅ Scalabilité indépendante
- ✅ Sécurité renforcée
- ✅ Backups indépendants

**Schéma par service**:
- Migrations TypeORM
- Auto-sync en dev (`DB_SYNCHRONIZE=true`)
- Migrations en prod (`DB_SYNCHRONIZE=false`)

---

## 🔒 Sécurité

### Authentification
1. **JWT Tokens**:
   - Access token: 2h
   - Refresh token: 7d
   - Signature: HMAC SHA256

2. **OAuth**:
   - Google OAuth 2.0
   - Création automatique utilisateur

### Autorisation
- **RBAC** (Role-Based Access Control)
- Rôles: SUPER_ADMIN, ADMIN, MANAGER, USER
- Permissions granulaires

### Protection
- Rate limiting (Redis)
- CORS configuré
- Validation des données (class-validator)
- SQL injection (TypeORM parameterized queries)
- XSS protection
- Account locking (5 tentatives)

---

## 📈 Scalabilité

### Horizontal Scaling
Chaque service peut être scalé indépendamment:
```
API Gateway: 3 instances (load balanced)
Auth Service: 2 instances
User Service: 2 instances
Autres: 1 instance (scalable si besoin)
```

### Vertical Scaling
Upgrade des ressources:
- Plan Free → Starter → Standard
- RAM: 512 MB → 2 GB → 4 GB
- CPU: 0.1 → 0.5 → 1.0

### Caching
- Redis pour cache chaud
- Cache HTTP au niveau API Gateway
- Database query caching

---

## 🌐 Flux de Requête Typique

### Exemple: Créer un Incident

```
1. Frontend
   │ POST /incidents
   │ Authorization: Bearer <jwt>
   ▼
2. API Gateway
   │ Vérifie JWT
   │ Rate limiting
   │ Route vers Incidents Service
   ▼
3. Incidents Service
   │ Valide les données
   │ Crée l'incident en DB
   │ Publie événement RabbitMQ
   ▼
4. Base de Données
   │ Incidents DB
   │ INSERT INTO incidents
   ▼
5. RabbitMQ
   │ incident.created
   ├─▶ Audit Service (log)
   ├─▶ Notifications Service (email)
   └─▶ Analytics Service (metrics)
   ▼
6. Retour Frontend
   │ HTTP 201 Created
   │ { id: 123, ... }
```

---

## 💾 Backup et Recovery

### Bases de Données
**Plan Free**:
- ❌ Pas de backups automatiques
- ⏱️ Expire après 90 jours

**Plan Payant**:
- ✅ Backups quotidiens automatiques
- ✅ Point-in-time recovery
- ✅ Retention 7 jours

### Recommandations
1. Upgrade bases critiques (Auth, User)
2. Export manuel hebdomadaire
3. Scripts de backup custom
4. Réplication multi-région (si critique)

---

## 🔍 Monitoring

### Render Dashboard
- **Metrics**: CPU, Memory, Network
- **Logs**: Centralisés par service
- **Events**: Déploiements, crashes
- **Alerts**: Email notifications

### Recommandations
- ✅ Sentry (error tracking)
- ✅ LogRocket (session replay)
- ✅ DataDog (APM)
- ✅ PagerDuty (alertes)

---

## 📝 Résumé Technique

| Composant | Quantité | Technologie | Plan |
|-----------|----------|-------------|------|
| Services Web | 13 | NestJS + TypeScript | Free/Paid |
| Bases PostgreSQL | 9 | PostgreSQL 15 | Free/Paid |
| Cache | 1 | Redis 7 | Free/Paid |
| Message Broker | 1 | RabbitMQ (CloudAMQP) | Free/Paid |
| **Total** | **24** | - | **0-64€/mois** |

---

**Architecture conçue pour**: Scalabilité, Résilience, Maintenabilité

**Prêt à déployer?** → [QUICK_START_RENDER.md](QUICK_START_RENDER.md)
