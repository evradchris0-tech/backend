# Configuration des Environment Groups dans Render

Ce guide explique comment configurer les variables d'environnement partagées pour vos microservices IMMO360 sur Render.

## Qu'est-ce qu'un Environment Group?

Un **Environment Group** dans Render permet de:
- ✅ Partager des variables entre plusieurs services
- ✅ Mettre à jour une variable une seule fois pour tous les services
- ✅ Gérer les secrets de manière centralisée
- ✅ Séparer les configurations dev/staging/prod

---

## Création d'un Environment Group

### Étape 1: Accéder à Environment Groups

1. Aller sur [dashboard.render.com](https://dashboard.render.com)
2. Cliquer sur **"Environment Groups"** dans le menu de gauche
3. Cliquer sur **"New Environment Group"**

### Étape 2: Créer le groupe

1. **Name**: `immo360-shared`
2. Cliquer sur **"Create Environment Group"**

---

## Variables à Configurer

### Variables Obligatoires

Ajouter ces variables dans le groupe `immo360-shared`:

```env
# RabbitMQ CloudAMQP
RABBITMQ_URL=amqps://username:password@hostname.cloudamqp.com/vhost

# JWT Secret (générer une valeur forte)
JWT_SECRET=votre-secret-jwt-super-securise-minimum-32-caracteres

# Frontend URL (URL de votre frontend déployé)
FRONTEND_URL=https://votre-frontend.vercel.app
```

### Comment obtenir RABBITMQ_URL

1. Suivre le guide [RABBITMQ_CLOUDAMQP_SETUP.md](RABBITMQ_CLOUDAMQP_SETUP.md)
2. Créer une instance CloudAMQP
3. Copier l'URL au format: `amqps://user:pass@host.cloudamqp.com/vhost`
4. Coller dans la variable `RABBITMQ_URL`

### Comment générer JWT_SECRET

**Option 1: Via Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Option 2: Via OpenSSL**
```bash
openssl rand -hex 32
```

**Option 3: Online** (déconseillé pour production)
- [RandomKeygen.com](https://randomkeygen.com/)

---

## Lier les Services au Environment Group

### Méthode Automatique (via render.yaml)

Si vous utilisez le Blueprint `render.yaml`, les variables marquées `sync: false` seront automatiquement liées au Environment Group.

**Important**: Après le déploiement initial via Blueprint:
1. Créer le Environment Group `immo360-shared`
2. Ajouter les variables (RABBITMQ_URL, etc.)
3. Aller dans chaque service → **Environment** → **Link Environment Group**
4. Sélectionner `immo360-shared`
5. Cliquer sur **"Save Changes"**

### Méthode Manuelle

Pour chaque service qui nécessite les variables partagées:

1. **Dashboard** → Sélectionner un service
2. **Environment** (onglet)
3. Cliquer sur **"Link Environment Group"**
4. Sélectionner `immo360-shared` dans la liste
5. Cliquer sur **"Save Changes"**
6. Le service redémarrera automatiquement

**Services à lier**:
- ✅ immo360-api-gateway
- ✅ immo360-auth-service
- ✅ immo360-user-service
- ✅ immo360-infrastructure-service
- ✅ immo360-equipment-service
- ✅ immo360-incidents-service
- ✅ immo360-audit-service
- ✅ immo360-analytics-service
- ✅ immo360-notifications-service
- ✅ immo360-file-storage-service
- ✅ immo360-import-export-service
- ✅ immo360-sync-service
- ✅ immo360-predictions-service

---

## Variables Optionnelles

### Configuration Email (Notifications)

Pour activer les notifications par email:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@immo360.com
```

**Pour Gmail**:
1. Activer l'authentification à 2 facteurs
2. Générer un "App Password" dans Google Account
3. Utiliser ce mot de passe dans `SMTP_PASSWORD`

### Configuration Google OAuth

Pour activer la connexion via Google:

```env
GOOGLE_CLIENT_ID=votre-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=votre-client-secret
GOOGLE_CALLBACK_URL=https://immo360-auth-service.onrender.com/auth/google/callback
```

**Obtenir les credentials**:
1. Aller sur [Google Cloud Console](https://console.cloud.google.com)
2. Créer un projet
3. Activer "Google+ API"
4. Créer des credentials OAuth 2.0
5. Ajouter les URLs de redirection autorisées

### Configuration Stockage Fichiers

```env
UPLOAD_DIR=/tmp/uploads
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
```

⚠️ **Important**: Sur Render, utiliser `/tmp` pour les fichiers temporaires car le filesystem est éphémère.

---

## Variables Spécifiques par Service

Certaines variables ne doivent PAS être dans le groupe partagé car elles sont spécifiques à chaque service.

### Exemples

**Auth Service uniquement**:
```env
BCRYPT_SALT_ROUNDS=12
MAX_LOGIN_ATTEMPTS=5
ACCOUNT_LOCK_DURATION_MS=900000
SESSION_CLEANUP_INTERVAL=3600000
SESSION_MAX_INACTIVE_DURATION=2592000000
JWT_ACCESS_TOKEN_EXPIRATION=2h
JWT_REFRESH_TOKEN_EXPIRATION=7d
```

**Notifications Service uniquement**:
```env
NOTIFICATION_BATCH_SIZE=100
NOTIFICATION_RETRY_ATTEMPTS=3
EMAIL_QUEUE_CONCURRENCY=5
```

Ces variables doivent être ajoutées directement dans l'onglet **Environment** de chaque service concerné.

---

## Mise à Jour des Variables

### Modifier une variable du groupe

1. **Dashboard** → **Environment Groups** → `immo360-shared`
2. Modifier la valeur de la variable
3. Cliquer sur **"Save Changes"**
4. **Tous les services liés** redémarreront automatiquement

⚠️ **Attention**: Modifier une variable redémarre tous les services (downtime de ~30s)

### Ajouter une nouvelle variable

1. **Dashboard** → **Environment Groups** → `immo360-shared`
2. Cliquer sur **"Add Environment Variable"**
3. Entrer la clé et la valeur
4. Cliquer sur **"Save Changes"**

### Supprimer une variable

1. **Dashboard** → **Environment Groups** → `immo360-shared`
2. Cliquer sur l'icône poubelle à côté de la variable
3. Confirmer la suppression
4. Cliquer sur **"Save Changes"**

---

## Environnements Multiples

Pour gérer plusieurs environnements (dev, staging, prod):

### Approche 1: Plusieurs Environment Groups

Créer des groupes séparés:
- `immo360-dev`
- `immo360-staging`
- `immo360-prod`

Chacun avec ses propres valeurs de:
- `RABBITMQ_URL` (instances CloudAMQP différentes)
- `JWT_SECRET` (secrets différents)
- `FRONTEND_URL` (URLs différentes)

### Approche 2: Plusieurs Blueprints

Créer des fichiers:
- `render.dev.yaml`
- `render.staging.yaml`
- `render.prod.yaml`

Avec des configurations différentes pour chaque environnement.

---

## Sécurité

### Bonnes Pratiques

✅ **À FAIRE**:
- Utiliser des secrets forts (minimum 32 caractères)
- Générer un JWT_SECRET unique pour chaque environnement
- Ne JAMAIS commiter les secrets dans Git
- Utiliser HTTPS uniquement en production (amqps://, https://)
- Activer l'authentification 2FA sur Render
- Limiter l'accès au Environment Group (Team settings)

❌ **À NE PAS FAIRE**:
- Partager les mêmes secrets entre dev et prod
- Utiliser des secrets faibles ou prévisibles
- Commiter le fichier `.env` dans Git
- Utiliser HTTP en production
- Partager les credentials publiquement

### Rotation des Secrets

Planifier la rotation des secrets tous les 90 jours:

1. Générer un nouveau `JWT_SECRET`
2. Mettre à jour dans le Environment Group
3. Les services redémarrent automatiquement
4. Les anciennes sessions utilisateurs seront invalidées

---

## Vérification

### Checklist de configuration

- [ ] Environment Group `immo360-shared` créé
- [ ] Variable `RABBITMQ_URL` ajoutée avec URL CloudAMQP
- [ ] Variable `JWT_SECRET` ajoutée (32+ caractères)
- [ ] Variable `FRONTEND_URL` ajoutée avec URL du frontend
- [ ] Tous les 13 services liés au groupe
- [ ] Services redémarrés et fonctionnels
- [ ] Logs vérifiés (pas d'erreurs de variables manquantes)
- [ ] Test de connexion RabbitMQ réussi
- [ ] Test d'authentification réussi

### Commandes de vérification

Dans le Shell d'un service:

```bash
# Vérifier que les variables sont bien définies
printenv | grep RABBITMQ_URL
printenv | grep JWT_SECRET
printenv | grep FRONTEND_URL

# Tester la connexion RabbitMQ
node -e "console.log(process.env.RABBITMQ_URL ? '✅ RABBITMQ_URL défini' : '❌ RABBITMQ_URL manquant')"

# Vérifier le format de RABBITMQ_URL
node -e "const url = process.env.RABBITMQ_URL; console.log(url?.startsWith('amqps://') ? '✅ URL sécurisée' : '⚠️ URL non sécurisée')"
```

---

## Troubleshooting

### Erreur: Variable undefined

**Symptôme**: Service crash au démarrage avec `process.env.RABBITMQ_URL is undefined`

**Solution**:
1. Vérifier que le service est lié au Environment Group
2. Vérifier que la variable existe dans le groupe
3. Redémarrer manuellement le service

### Erreur: Cannot connect to RabbitMQ

**Symptôme**: `ECONNREFUSED` ou `Authentication failed`

**Solution**:
1. Vérifier que l'URL CloudAMQP est correcte
2. Vérifier que l'instance CloudAMQP est active
3. Vérifier le format: `amqps://` (pas `amqp://` en prod)
4. Tester la connexion depuis le dashboard CloudAMQP

### Services ne redémarrent pas après modification

**Solution**:
1. Attendre 1-2 minutes (délai normal)
2. Redémarrer manuellement: Service → **Manual Deploy** → **Deploy**
3. Vérifier les logs pour voir les erreurs

---

## Résumé

### Configuration Minimale Requise

```env
# Environment Group: immo360-shared
RABBITMQ_URL=amqps://user:pass@host.cloudamqp.com/vhost
JWT_SECRET=<généré avec crypto.randomBytes(32).toString('hex')>
FRONTEND_URL=https://votre-frontend.com
```

### Commandes Rapides

```bash
# Générer JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Vérifier les variables dans un service
printenv | grep -E '(RABBITMQ|JWT|FRONTEND)'

# Tester la connexion RabbitMQ
node -e "require('amqplib').connect(process.env.RABBITMQ_URL).then(() => console.log('✅ OK')).catch(e => console.error('❌', e.message))"
```

---

**Votre configuration des Environment Groups est prête!** 🎉

Pour plus d'informations:
- [Documentation Render Environment Groups](https://render.com/docs/environment-variables#environment-groups)
- [Guide RabbitMQ CloudAMQP](RABBITMQ_CLOUDAMQP_SETUP.md)
- [Guide Déploiement Render](RENDER_DEPLOYMENT.md)
