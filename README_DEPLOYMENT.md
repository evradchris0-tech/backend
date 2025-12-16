# IMMO360 Backend - Guide de Déploiement

Bienvenue dans le guide de déploiement de l'architecture microservices IMMO360 sur Render.

## 📖 Documentation Disponible

### 🚀 Pour Commencer
- **[QUICK_START_RENDER.md](QUICK_START_RENDER.md)** - Déploiement rapide en 30 minutes
  - Guide pas-à-pas condensé
  - Checklist complète
  - Troubleshooting rapide

### 📚 Guides Détaillés
- **[RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md)** - Guide complet de déploiement
  - Méthode automatique (Blueprint)
  - Méthode manuelle détaillée
  - Configuration post-déploiement
  - Surveillance et monitoring
  - Coûts et limitations

- **[RABBITMQ_CLOUDAMQP_SETUP.md](RABBITMQ_CLOUDAMQP_SETUP.md)** - Configuration RabbitMQ
  - Création compte CloudAMQP
  - Configuration instance RabbitMQ
  - Intégration avec Render
  - Alternatives et options

- **[RENDER_ENVIRONMENT_GROUPS.md](RENDER_ENVIRONMENT_GROUPS.md)** - Variables d'environnement
  - Configuration Environment Groups
  - Variables partagées
  - Sécurité et bonnes pratiques
  - Gestion multi-environnements

### 📋 Fichiers de Configuration
- **[render.yaml](render.yaml)** - Blueprint Render (infrastructure as code)
- **[.env.example](.env.example)** - Template de variables d'environnement

---

## 🏗️ Architecture

### Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────┐
│                        Internet                              │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
              ┌────────────────┐
              │  API Gateway   │  Point d'entrée principal
              │  (Port 10000)  │
              └────────┬───────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
┌──────────────┐ ┌──────────┐ ┌─────────────┐
│ Auth Service │ │   User   │ │Infrastructure│
│              │ │ Service  │ │   Service    │
└──────┬───────┘ └────┬─────┘ └──────┬──────┘
       │              │              │
       ▼              ▼              ▼
  ┌────────┐    ┌────────┐    ┌────────┐
  │Auth DB │    │User DB │    │Infra DB│
  └────────┘    └────────┘    └────────┘

  + 10 autres microservices avec leurs BDs
  + Redis (cache partagé)
  + RabbitMQ CloudAMQP (messaging)
```

### Services Déployés

| Service | Description | Base de Données |
|---------|-------------|-----------------|
| **API Gateway** | Point d'entrée, routing, authentification | - |
| **Auth Service** | Authentification JWT, sessions, OAuth | PostgreSQL |
| **User Service** | Gestion utilisateurs, rôles, permissions | PostgreSQL |
| **Infrastructure Service** | Gestion biens immobiliers | PostgreSQL |
| **Equipment Service** | Gestion équipements | PostgreSQL |
| **Incidents Service** | Gestion incidents et tickets | PostgreSQL |
| **Audit Service** | Logs et audit trail | PostgreSQL |
| **Analytics Service** | Statistiques et analyses | PostgreSQL |
| **Notifications Service** | Emails, SMS, push notifications | PostgreSQL |
| **File Storage Service** | Upload et stockage fichiers | PostgreSQL |
| **Import/Export Service** | Import/Export données (Excel, CSV) | - |
| **Sync Service** | Synchronisation données | - |
| **Predictions Service** | ML et prédictions | - |

### Infrastructure

| Ressource | Service | Plan |
|-----------|---------|------|
| **Cache** | Redis | Free (25 MB) |
| **Message Broker** | RabbitMQ (CloudAMQP) | Lemur Free (1M msgs/mois) |
| **Bases de Données** | PostgreSQL × 9 | Free (1 GB chacune) |

---

## 🎯 Déploiement Rapide

### Méthode Recommandée: Blueprint

1. **Configurer CloudAMQP** (5 min)
   ```bash
   # Voir RABBITMQ_CLOUDAMQP_SETUP.md
   ```

2. **Pousser sur Git** (2 min)
   ```bash
   git add render.yaml .env.example
   git commit -m "Add Render deployment"
   git push origin main
   ```

3. **Déployer sur Render** (10 min)
   - Dashboard → New → Blueprint
   - Sélectionner repository
   - Apply Blueprint

4. **Configurer Environment Group** (5 min)
   ```bash
   # Générer JWT_SECRET
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   - Créer groupe `immo360-shared`
   - Ajouter: `RABBITMQ_URL`, `JWT_SECRET`, `FRONTEND_URL`
   - Lier tous les services

5. **Vérifier** (5 min)
   ```bash
   curl https://immo360-api-gateway.onrender.com/health
   ```

**Total: ~30 minutes**

📖 **Guide détaillé**: [QUICK_START_RENDER.md](QUICK_START_RENDER.md)

---

## 💰 Coûts

### Plan Gratuit (Recommandé pour Dev/Test)

| Ressource | Quantité | Coût/mois | Limitations |
|-----------|----------|-----------|-------------|
| Services Web | 13 | 0€ | Mise en veille après 15 min |
| PostgreSQL | 9 | 0€ | 1 GB, expire après 90 jours |
| Redis | 1 | 0€ | 25 MB |
| CloudAMQP | 1 | 0€ | 1M messages/mois |
| **TOTAL** | **24** | **0€** | - |

### Plan Production (Recommandé)

| Ressource | Quantité | Coût/mois |
|-----------|----------|-----------|
| Services Web critiques | 3 | 21€ |
| PostgreSQL critiques | 2 | 14€ |
| Redis | 1 | 10€ |
| CloudAMQP Tiger | 1 | 19€ |
| **TOTAL** | **7** | **64€** |

Services critiques upgradés:
- ✅ API Gateway (pas de mise en veille)
- ✅ Auth Service (pas de mise en veille)
- ✅ User Service (pas de mise en veille)
- ✅ Auth DB (backups automatiques)
- ✅ User DB (backups automatiques)

---

## 🔒 Sécurité

### Variables Sensibles

**Obligatoires**:
- `JWT_SECRET` - Secret pour signer les JWT (minimum 32 caractères)
- `RABBITMQ_URL` - URL CloudAMQP avec credentials
- `DB_PASSWORD` - Mots de passe bases de données (auto-générés par Render)

**Optionnelles**:
- `SMTP_PASSWORD` - Mot de passe email
- `GOOGLE_CLIENT_SECRET` - Secret OAuth Google

### Bonnes Pratiques

✅ **À FAIRE**:
- Utiliser des secrets forts (32+ caractères aléatoires)
- Ne JAMAIS commiter `.env` dans Git
- Utiliser HTTPS/amqps:// uniquement en production
- Activer 2FA sur Render et CloudAMQP
- Rotation des secrets tous les 90 jours

❌ **À NE PAS FAIRE**:
- Réutiliser les mêmes secrets entre dev et prod
- Partager les credentials publiquement
- Utiliser des secrets prévisibles
- Désactiver SSL/TLS

---

## 🧪 Tests Post-Déploiement

### 1. Vérifier les Services

```bash
# API Gateway
curl https://immo360-api-gateway.onrender.com/health

# Auth Service
curl https://immo360-auth-service.onrender.com/health

# User Service
curl https://immo360-user-service.onrender.com/health
```

### 2. Test d'Authentification

```bash
# Register
curl -X POST https://immo360-api-gateway.onrender.com/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "firstName": "Test",
    "lastName": "User"
  }'

# Login
curl -X POST https://immo360-api-gateway.onrender.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'
```

### 3. Vérifier RabbitMQ

- Dashboard CloudAMQP → Connections
- Vérifier que les services apparaissent connectés

### 4. Vérifier Redis

- Dashboard Render → Service Redis → Metrics
- Vérifier utilisation mémoire et connexions

---

## 📊 Monitoring

### Render Dashboard

Pour chaque service:
- **Logs**: Erreurs et événements en temps réel
- **Metrics**: CPU, Memory, Bandwidth
- **Events**: Déploiements, redémarrages

### CloudAMQP Dashboard

- **Messages/second**: Trafic RabbitMQ
- **Connections**: Nombre de services connectés
- **Queues**: Profondeur des files d'attente

### Alertes Recommandées

Configurer des alertes pour:
- ⚠️ Service down
- ⚠️ Erreurs critiques (500+)
- ⚠️ Memory > 80%
- ⚠️ Queue depth > 1000

---

## 🐛 Troubleshooting

### Service ne démarre pas

**Cause**: Variables d'environnement manquantes

**Solution**:
1. Vérifier les logs: Service → Logs
2. Vérifier variables: Service → Environment
3. Vérifier Environment Group lié

### Erreur de connexion DB

**Cause**: URL de base de données incorrecte

**Solution**:
- Utiliser l'**Internal Database URL** (pas External)
- Format: `postgresql://user:pass@host:5432/db`

### RabbitMQ connection failed

**Cause**: URL CloudAMQP incorrecte ou instance inactive

**Solution**:
1. Vérifier instance CloudAMQP active
2. Vérifier URL: doit commencer par `amqps://`
3. Tester depuis dashboard CloudAMQP

### Services lents (premier appel)

**Cause**: Mise en veille (plan Free)

**Solution**:
1. Upgrade au plan payant (7$/mois)
2. Utiliser UptimeRobot pour pinger
3. Accepter 30s de délai initial

---

## 📚 Ressources

### Documentation Officielle
- [Render Docs](https://render.com/docs)
- [CloudAMQP Docs](https://www.cloudamqp.com/docs/index.html)
- [NestJS Docs](https://docs.nestjs.com)

### Support
- Render: support@render.com
- CloudAMQP: support@cloudamqp.com
- GitHub Issues: [Votre repository]

---

## 🔄 Mises à Jour

### Déploiement Automatique

Render déploie automatiquement à chaque push sur `main`:

```bash
git add .
git commit -m "Update feature X"
git push origin main
# Render déploie automatiquement
```

### Déploiement Manuel

Dashboard Render → Service → **Manual Deploy** → **Deploy**

### Rollback

Dashboard Render → Service → **Events** → Sélectionner déploiement → **Rollback**

---

## ✅ Checklist Complète

### Avant Déploiement
- [ ] Compte Render créé
- [ ] Compte CloudAMQP créé
- [ ] Code sur Git
- [ ] `render.yaml` configuré
- [ ] `.env.example` documenté

### Déploiement
- [ ] Instance CloudAMQP créée
- [ ] URL AMQP copiée
- [ ] Blueprint appliqué
- [ ] Tous les services déployés
- [ ] Environment Group créé
- [ ] Variables configurées
- [ ] Services liés au groupe

### Vérification
- [ ] Logs sans erreurs
- [ ] API Gateway accessible
- [ ] Test auth réussi
- [ ] RabbitMQ connecté
- [ ] Redis fonctionnel

### Production
- [ ] JWT_SECRET sécurisé
- [ ] Services critiques upgradés
- [ ] Backups DB configurés
- [ ] Monitoring configuré
- [ ] Alertes configurées
- [ ] Documentation à jour

---

## 🎉 Félicitations!

Votre architecture microservices IMMO360 est maintenant déployée sur Render!

**URLs de production**:
- API Gateway: `https://immo360-api-gateway.onrender.com`
- Render Dashboard: `https://dashboard.render.com`
- CloudAMQP Dashboard: `https://customer.cloudamqp.com`

**Prochaines étapes**:
1. Configurer le frontend avec l'URL de l'API
2. Seed des données initiales
3. Tests de bout en bout
4. Monitoring et alertes
5. Documentation utilisateur

---

**Besoin d'aide?** Consultez les guides détaillés ci-dessus ou créez une issue sur GitHub.
