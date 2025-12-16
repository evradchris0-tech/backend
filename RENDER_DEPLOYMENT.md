# Guide de Déploiement IMMO360 sur Render

Ce guide vous accompagne dans le déploiement de l'architecture microservices IMMO360 sur Render.

## Table des Matières
- [Prérequis](#prérequis)
- [Architecture Déployée](#architecture-déployée)
- [Méthode 1: Déploiement Automatique (Blueprint)](#méthode-1-déploiement-automatique-blueprint)
- [Méthode 2: Déploiement Manuel](#méthode-2-déploiement-manuel)
- [Configuration Post-Déploiement](#configuration-post-déploiement)
- [Surveillance et Logs](#surveillance-et-logs)
- [Coûts et Limitations](#coûts-et-limitations)
- [Troubleshooting](#troubleshooting)

---

## Prérequis

1. **Compte Render**
   - Créer un compte sur [render.com](https://render.com)
   - Vérifier votre email

2. **Dépôt Git**
   - Code source hébergé sur GitHub/GitLab/Bitbucket
   - Accès au repository depuis Render

3. **Connaissances requises**
   - Bases de Git
   - Compréhension des variables d'environnement
   - Notions de microservices

---

## Architecture Déployée

### Services Web (13 microservices)
1. **API Gateway** - Point d'entrée principal (port 10000)
2. **Auth Service** - Authentification JWT
3. **User Service** - Gestion des utilisateurs
4. **Infrastructure Service** - Gestion des biens immobiliers
5. **Equipment Service** - Gestion des équipements
6. **Incidents Service** - Gestion des incidents
7. **Audit Service** - Journalisation des actions
8. **Analytics Service** - Analyses et statistiques
9. **Notifications Service** - Notifications
10. **File Storage Service** - Stockage de fichiers
11. **Import/Export Service** - Import/Export de données
12. **Sync Service** - Synchronisation
13. **Predictions Service** - Prédictions

### Bases de Données PostgreSQL (9 bases)
- `immo360-auth-db` - Authentification
- `immo360-user-db` - Utilisateurs
- `immo360-infrastructure-db` - Biens
- `immo360-equipment-db` - Équipements
- `immo360-incidents-db` - Incidents
- `immo360-audit-db` - Audit
- `immo360-analytics-db` - Analytics
- `immo360-notifications-db` - Notifications
- `immo360-files-db` - Fichiers

### Services Additionnels
- **Redis** - Cache partagé
- **RabbitMQ** - Message broker via CloudAMQP (voir [RABBITMQ_CLOUDAMQP_SETUP.md](RABBITMQ_CLOUDAMQP_SETUP.md))

---

## Méthode 1: Déploiement Automatique (Blueprint)

### Étapes

1. **Préparer le Repository**
   ```bash
   # Committer le fichier render.yaml
   git add render.yaml
   git commit -m "Add Render deployment configuration"
   git push origin main
   ```

2. **Configurer RabbitMQ (CloudAMQP)**
   - **Avant le déploiement**, créer une instance CloudAMQP
   - Suivre le guide: [RABBITMQ_CLOUDAMQP_SETUP.md](RABBITMQ_CLOUDAMQP_SETUP.md)
   - Copier l'URL AMQP (format: `amqps://user:pass@host.cloudamqp.com/vhost`)

3. **Connecter à Render**
   - Aller sur [render.com/dashboard](https://dashboard.render.com)
   - Cliquer sur **"New"** → **"Blueprint"**
   - Sélectionner votre repository GitHub/GitLab

4. **Configuration du Blueprint**
   - Render détectera automatiquement `render.yaml`
   - Réviser la configuration proposée
   - Cliquer sur **"Apply Blueprint"**

5. **Déploiement**
   - Render va créer tous les services automatiquement
   - Les bases de données seront créées en premier
   - Puis les services web seront déployés
   - Durée estimée: 15-30 minutes

6. **Configurer les variables partagées**
   - Créer un Environment Group (voir [RENDER_ENVIRONMENT_GROUPS.md](RENDER_ENVIRONMENT_GROUPS.md))
   - Ajouter `RABBITMQ_URL`, `JWT_SECRET`, `FRONTEND_URL`
   - Lier tous les services au groupe

### Avantages
- Configuration en un seul fichier
- Déploiement reproductible
- Gestion des dépendances automatique
- Mise à jour facile via Git

---

## Méthode 2: Déploiement Manuel

### Étape 1: Créer les Bases de Données

Pour chaque base de données:

1. **Dashboard Render** → **"New"** → **"PostgreSQL"**
2. **Configuration**:
   - Name: `immo360-auth-db` (exemple)
   - Database: `immo360_auth`
   - User: `immo360_user`
   - Region: `Frankfurt` (Europe)
   - Plan: `Free`
3. Répéter pour les 9 bases de données

### Étape 2: Créer Redis

1. **Dashboard** → **"New"** → **"Redis"**
2. **Configuration**:
   - Name: `immo360-redis`
   - Region: `Frankfurt`
   - Plan: `Free`
   - Max Memory Policy: `allkeys-lru`

### Étape 3: Déployer les Services Web

Pour chaque microservice:

1. **Dashboard** → **"New"** → **"Web Service"**
2. **Configuration de base**:
   - Name: `immo360-auth-service` (exemple)
   - Region: `Frankfurt`
   - Branch: `main`
   - Runtime: `Node`
   - Plan: `Free`

3. **Build Configuration**:
   ```bash
   # Build Command (exemple pour auth-service)
   cd services/auth-service && npm install && npm run build

   # Start Command
   cd services/auth-service && npm run start:prod
   ```

4. **Variables d'environnement**:

   Variables communes à tous les services:
   ```
   NODE_ENV=production
   PORT=10000
   HOST=0.0.0.0
   JWT_SECRET=[générer une valeur aléatoire]
   ```

   Variables spécifiques (exemple pour auth-service):
   ```
   DB_HOST=[copier depuis immo360-auth-db Internal Database URL - host]
   DB_PORT=[copier depuis immo360-auth-db - port]
   DB_USERNAME=[copier depuis immo360-auth-db - user]
   DB_PASSWORD=[copier depuis immo360-auth-db - password]
   DB_DATABASE=immo360_auth
   DB_SYNCHRONIZE=true
   DB_LOGGING=false
   JWT_ACCESS_TOKEN_EXPIRATION=2h
   JWT_REFRESH_TOKEN_EXPIRATION=7d
   BCRYPT_SALT_ROUNDS=12
   ```

5. **Ordre de déploiement recommandé**:
   1. Auth Service
   2. User Service
   3. Autres services (ordre indifférent)
   4. API Gateway (en dernier)

---

## Configuration Post-Déploiement

### 1. Vérifier les Services

Pour chaque service:
- Aller dans **Logs** et vérifier qu'il n'y a pas d'erreurs
- Vérifier que le message de démarrage apparaît:
  ```
  🚀 [Service Name] running on http://0.0.0.0:10000
  ```

### 2. Tester l'API Gateway

```bash
# Récupérer l'URL de l'API Gateway
# Format: https://immo360-api-gateway.onrender.com

# Test de santé
curl https://immo360-api-gateway.onrender.com/health

# Test d'authentification
curl -X POST https://immo360-api-gateway.onrender.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'
```

### 3. Configurer les URLs dans le Frontend

Mettre à jour votre frontend avec l'URL de l'API Gateway:
```env
VITE_API_URL=https://immo360-api-gateway.onrender.com
# ou
REACT_APP_API_URL=https://immo360-api-gateway.onrender.com
```

### 4. Migrations de Base de Données

Si vous avez des migrations TypeORM:

```bash
# Se connecter au service via Render Shell
# Depuis le dashboard du service → Shell

# Exécuter les migrations
npm run migration:run
```

### 5. Seed des Données Initiales

Si vous avez des données de départ (rôles, permissions, etc.):

```bash
# Via Render Shell sur le service approprié
npm run seed
```

---

## Surveillance et Logs

### Accès aux Logs

1. **Dashboard Render** → Sélectionner un service
2. **Onglet "Logs"**
3. Filtres disponibles:
   - Par date/heure
   - Par niveau (error, warn, info)

### Métriques Disponibles

Dans l'onglet **"Metrics"** de chaque service:
- CPU Usage
- Memory Usage
- Request Count
- Response Time
- Bandwidth

### Alertes

Configurer des alertes email pour:
- Service down
- Erreurs critiques
- Utilisation excessive de ressources

---

## Coûts et Limitations

### Plan Free (Gratuit)

**Services Web**:
- 750 heures/mois par service
- 512 MB RAM
- 0.1 CPU
- Le service se met en veille après 15 minutes d'inactivité
- Réveil en ~30 secondes lors de la première requête

**Bases de données PostgreSQL**:
- 1 GB de stockage
- Expire après 90 jours
- Pas de backups automatiques

**Redis**:
- 25 MB de stockage
- Pas de persistence

### Plan Payant (7$/mois par service)

**Avantages**:
- Pas de mise en veille
- Plus de ressources
- Backups automatiques (pour PostgreSQL)
- Support prioritaire

### Recommandations

1. **Phase de développement**: Utiliser le plan Free
2. **Production**:
   - Services critiques (Auth, User, API Gateway): Plan Payant
   - Autres services: Plan Free acceptable
   - Bases de données: Plan Payant pour la persistence

---

## Troubleshooting

### Problème: Service ne démarre pas

**Vérifications**:
1. Logs d'erreur dans l'onglet "Logs"
2. Variables d'environnement correctes
3. Build command et start command corrects
4. Dependencies installées (`package.json`)

**Solution**:
```bash
# Dans le Shell du service
# Vérifier les variables d'environnement
printenv

# Tester manuellement
cd services/[nom-service]
npm install
npm run build
npm run start:prod
```

### Problème: Connexion base de données échoue

**Vérifications**:
1. URL interne de la base de données (pas l'externe)
2. Variables DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD
3. Base de données bien créée et active

**Solution**:
```bash
# Dans le Shell du service
# Tester la connexion
psql $DATABASE_URL -c "SELECT version();"
```

### Problème: Service se met en veille (Plan Free)

**Solutions**:
1. **Uptime monitoring**: Utiliser un service comme UptimeRobot pour pinger votre API toutes les 5 minutes
2. **Upgrade au plan payant**: 7$/mois pour les services critiques
3. **Accepter le délai**: 30 secondes de réveil acceptable pour certains cas

### Problème: CORS errors

**Solution**:
Vérifier la configuration CORS dans `main.ts`:
```typescript
app.enableCors({
  origin: process.env.FRONTEND_URL || true,
  credentials: true,
});
```

Ajouter la variable d'environnement:
```
FRONTEND_URL=https://votre-frontend.com
```

### Problème: JWT_SECRET manquant

**Solution**:
Générer un secret fort:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Ajouter aux variables d'environnement de tous les services.

### Problème: Build timeout

**Solution**:
Optimiser le build:
```json
// package.json
{
  "scripts": {
    "build": "nest build",
    "prebuild": "npm ci --only=production"
  }
}
```

---

## URLs Importantes

Après déploiement, vos services seront disponibles aux URLs suivantes:

- **API Gateway**: `https://immo360-api-gateway.onrender.com`
- **Auth Service**: `https://immo360-auth-service.onrender.com`
- **User Service**: `https://immo360-user-service.onrender.com`
- etc.

**Note**: Les services communiquent entre eux via les URLs internes de Render, pas les URLs publiques.

---

## Prochaines Étapes

1. **Sécurité**:
   - Changer tous les JWT_SECRET en production
   - Configurer un WAF (Web Application Firewall)
   - Activer HTTPS uniquement

2. **Monitoring**:
   - Intégrer Sentry pour le tracking d'erreurs
   - Configurer des healthchecks
   - Mettre en place des dashboards

3. **CI/CD**:
   - Auto-deploy depuis la branche `main`
   - Preview deployments pour les Pull Requests
   - Tests automatiques avant déploiement

4. **Performance**:
   - Activer la compression
   - Configurer le caching Redis
   - Optimiser les requêtes SQL

---

## Support

- Documentation Render: https://render.com/docs
- Support Render: support@render.com
- Issues GitHub: Créer une issue dans votre repository

---

**Félicitations! Votre architecture IMMO360 est maintenant déployée sur Render!** 🎉
