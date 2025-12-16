# Configuration RabbitMQ avec CloudAMQP pour IMMO360

Ce guide explique comment configurer RabbitMQ pour vos microservices IMMO360 en utilisant CloudAMQP.

## Table des Matières
- [Pourquoi CloudAMQP?](#pourquoi-cloudamqp)
- [Création du compte CloudAMQP](#création-du-compte-cloudamqp)
- [Configuration de l'instance RabbitMQ](#configuration-de-linstance-rabbitmq)
- [Intégration avec Render](#intégration-avec-render)
- [Configuration des Services](#configuration-des-services)
- [Alternative: RabbitMQ auto-hébergé](#alternative-rabbitmq-auto-hébergé)
- [Vérification et Tests](#vérification-et-tests)

---

## Pourquoi CloudAMQP?

Render ne propose pas RabbitMQ en service managé. CloudAMQP est la solution recommandée car:

✅ **Gratuit** - Plan gratuit avec 1 million de messages/mois
✅ **Managé** - Pas de maintenance serveur
✅ **Fiable** - 99.9% uptime SLA
✅ **Facile** - Intégration en 5 minutes
✅ **Compatible** - Fonctionne avec toutes les bibliothèques RabbitMQ

---

## Création du compte CloudAMQP

### Étape 1: S'inscrire

1. Aller sur [cloudamqp.com](https://www.cloudamqp.com/)
2. Cliquer sur **"Sign Up"** ou **"Get Started"**
3. Options d'inscription:
   - Email + mot de passe
   - GitHub (recommandé si vous utilisez GitHub)
   - Google

### Étape 2: Vérifier l'email

- Vérifier votre boîte email
- Cliquer sur le lien de confirmation

---

## Configuration de l'instance RabbitMQ

### Étape 1: Créer une nouvelle instance

1. **Dashboard CloudAMQP** → **"Create New Instance"**

2. **Choisir le plan**:
   - **Plan**: `Lemur` (FREE)
   - **Name**: `immo360-rabbitmq`
   - **Tags**: `production` ou `development`

3. **Choisir la région**:
   - **Cloud Provider**: `Amazon Web Services (AWS)`
   - **Region**: `EU-West-1 (Ireland)` ou `EU-Central-1 (Frankfurt)`
   - ⚠️ Choisir une région proche de vos services Render (Frankfurt recommandé)

4. **Créer l'instance**:
   - Cliquer sur **"Create instance"**
   - Attendre 1-2 minutes pour la création

### Étape 2: Récupérer les informations de connexion

1. **Dashboard** → Cliquer sur votre instance `immo360-rabbitmq`

2. **Informations importantes**:
   ```
   URL: amqps://user:password@host.cloudamqp.com/vhost
   Host: host.cloudamqp.com
   Virtual Host: /vhost
   Username: user
   Password: password
   Port: 5671 (SSL) ou 5672 (non-SSL)
   ```

3. **Copier l'URL AMQP**:
   - Format: `amqps://username:password@hostname.cloudamqp.com/vhostname`
   - Cette URL sera utilisée dans vos services

### Étape 3: Configuration optionnelle

Dans l'interface CloudAMQP:

1. **Queues**: Créer des queues prédéfinies si nécessaire
   - `auth.events`
   - `user.events`
   - `notifications.queue`
   - etc.

2. **Alarms**: Configurer des alertes
   - Memory usage > 80%
   - Disk space < 20%
   - Connection failures

3. **Access Control**: Gérer les permissions (optionnel pour démarrer)

---

## Intégration avec Render

### Option 1: Via Variables d'Environnement (Recommandé)

1. **Dashboard Render** → Sélectionner un service
2. **Environment** → **Add Environment Variable**
3. Ajouter:
   ```
   RABBITMQ_URL=amqps://user:password@host.cloudamqp.com/vhost
   ```

**Pour tous les services utilisant RabbitMQ**:
- Auth Service
- User Service
- Notifications Service
- Audit Service
- Autres services concernés

### Option 2: Via render.yaml (Automatique)

Le fichier `render.yaml` a été mis à jour pour inclure `RABBITMQ_URL` comme variable d'environnement.

**Important**: Vous devrez définir `RABBITMQ_URL` comme **Environment Group** dans Render:

1. **Dashboard Render** → **Environment Groups**
2. **Create Environment Group** → `immo360-shared`
3. Ajouter:
   ```
   RABBITMQ_URL=amqps://user:password@host.cloudamqp.com/vhost
   ```
4. Lier ce groupe à tous vos services

---

## Configuration des Services

### Services concernés par RabbitMQ

Les services suivants utilisent RabbitMQ pour la communication inter-services:

1. **Auth Service** - Événements d'authentification
2. **User Service** - Événements utilisateur
3. **Notifications Service** - Notifications asynchrones
4. **Audit Service** - Logs d'audit
5. **Analytics Service** - Événements analytiques
6. **Infrastructure Service** - Événements de biens
7. **Equipment Service** - Événements d'équipements
8. **Incidents Service** - Événements d'incidents

### Vérifier la configuration NestJS

Chaque service doit avoir la configuration RabbitMQ dans son module:

```typescript
// app.module.ts
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';

@Module({
  imports: [
    RabbitMQModule.forRootAsync(RabbitMQModule, {
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('RABBITMQ_URL'),
        exchanges: [
          {
            name: 'immo360.events',
            type: 'topic',
          },
        ],
        connectionInitOptions: { wait: false },
        enableControllerDiscovery: true,
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

### Variables d'environnement requises

Chaque service doit avoir dans Render:

```env
# RabbitMQ
RABBITMQ_URL=amqps://user:password@host.cloudamqp.com/vhost

# Optionnel: Configuration avancée
RABBITMQ_EXCHANGE=immo360.events
RABBITMQ_QUEUE_PREFIX=immo360
RABBITMQ_PREFETCH_COUNT=10
```

---

## Alternative: RabbitMQ auto-hébergé

Si vous ne voulez pas utiliser CloudAMQP, vous pouvez héberger RabbitMQ vous-même:

### Option A: Render Background Worker

Render ne supporte pas directement RabbitMQ, mais vous pouvez utiliser un Background Worker:

```yaml
# render.yaml
services:
  - type: worker
    name: immo360-rabbitmq
    runtime: docker
    dockerfilePath: ./infrastructure/rabbitmq/Dockerfile
    plan: starter
    envVars:
      - key: RABBITMQ_DEFAULT_USER
        value: immo360
      - key: RABBITMQ_DEFAULT_PASS
        generateValue: true
```

**Inconvénients**:
- Coût: 7$/mois minimum (plan Starter)
- Pas de persistence garantie
- Configuration plus complexe

### Option B: Service externe

Autres alternatives à CloudAMQP:

1. **RabbitMQ Cloud** (officiel) - [rabbitmq.com](https://www.rabbitmq.com/cloud.html)
2. **AWS MQ** - Si vous utilisez AWS
3. **Heroku CloudAMQP** - Add-on Heroku
4. **DigitalOcean** - VPS avec RabbitMQ installé

### Option C: Supprimer RabbitMQ

Si RabbitMQ n'est pas critique, vous pouvez:

1. **Passer à Redis Pub/Sub** pour les événements
2. **Communication directe HTTP** entre services
3. **Désactiver** les fonctionnalités asynchrones

---

## Vérification et Tests

### Test 1: Connexion depuis un service

```bash
# Dans le Shell d'un service Render
node -e "
const amqp = require('amqplib');
amqp.connect(process.env.RABBITMQ_URL)
  .then(() => console.log('✅ Connected to RabbitMQ'))
  .catch(err => console.error('❌ Error:', err.message));
"
```

### Test 2: Dashboard CloudAMQP

1. **Dashboard CloudAMQP** → Votre instance
2. **RabbitMQ Manager** (bouton)
3. Vérifier:
   - **Connections**: Les services connectés apparaissent
   - **Queues**: Les queues créées
   - **Messages**: Le trafic de messages

### Test 3: Publier un message de test

```bash
# Dans le Shell d'un service
node -e "
const amqp = require('amqplib');
amqp.connect(process.env.RABBITMQ_URL)
  .then(conn => conn.createChannel())
  .then(ch => {
    const exchange = 'immo360.events';
    const msg = JSON.stringify({ test: 'Hello from Render!' });
    ch.assertExchange(exchange, 'topic', { durable: true });
    ch.publish(exchange, 'test.event', Buffer.from(msg));
    console.log('✅ Message published');
    setTimeout(() => process.exit(0), 500);
  })
  .catch(err => console.error('❌ Error:', err.message));
"
```

### Test 4: Logs des services

Vérifier dans les logs Render que les services se connectent à RabbitMQ:

```
✅ Connected to RabbitMQ: immo360-rabbitmq
✅ Subscribed to queue: user.events
✅ Ready to process messages
```

---

## Monitoring CloudAMQP

### Métriques disponibles

Dans le dashboard CloudAMQP:

1. **Overview**:
   - Messages/second
   - Connections
   - Queues depth

2. **Monitoring**:
   - CPU usage
   - Memory usage
   - Disk space
   - Network I/O

3. **Logs**:
   - Connection logs
   - Error logs
   - Publish/Consume logs

### Alertes recommandées

Configurer des alertes pour:
- ⚠️ Queue depth > 1000 messages
- ⚠️ Memory usage > 80%
- ⚠️ Connection failures
- ⚠️ Message rate spike

---

## Limites du Plan Gratuit

### CloudAMQP Lemur (Free)

**Inclus**:
- ✅ 1 million de messages/mois
- ✅ 20 connexions simultanées
- ✅ 100 queues max
- ✅ Shared cluster
- ✅ Support communautaire

**Limites**:
- ❌ Pas de backups automatiques
- ❌ Pas de clustering
- ❌ Pas de support prioritaire
- ❌ Région limitée

**Quand upgrader?**

Passer au plan **Tiger (19$/mois)** si:
- Plus de 1M messages/mois
- Besoin de backups automatiques
- Plus de 20 connexions
- Support prioritaire requis

---

## Configuration Finale

### Checklist de déploiement

- [ ] Compte CloudAMQP créé
- [ ] Instance RabbitMQ créée (plan Lemur)
- [ ] URL AMQP copiée
- [ ] Variable `RABBITMQ_URL` ajoutée à tous les services Render
- [ ] Services redéployés avec la nouvelle variable
- [ ] Connexions vérifiées dans le dashboard CloudAMQP
- [ ] Queues créées automatiquement par les services
- [ ] Messages de test envoyés et reçus
- [ ] Logs vérifiés (pas d'erreurs RabbitMQ)
- [ ] Alertes configurées dans CloudAMQP

---

## Résumé des URLs

Après configuration, vous aurez:

- **CloudAMQP Dashboard**: https://customer.cloudamqp.com/instance/[instance-id]
- **RabbitMQ Manager**: https://[hostname].cloudamqp.com/ (login avec credentials)
- **AMQP URL**: `amqps://user:password@hostname.cloudamqp.com/vhost`

---

## Support

- **CloudAMQP Docs**: https://www.cloudamqp.com/docs/index.html
- **RabbitMQ Docs**: https://www.rabbitmq.com/documentation.html
- **Support CloudAMQP**: support@cloudamqp.com

---

**Votre configuration RabbitMQ est prête!** 🐰
