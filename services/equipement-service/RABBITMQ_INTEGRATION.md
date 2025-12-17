# RabbitMQ Integration - Equipement Service

## 📋 Vue d'ensemble

Le service **equipement-service** communique de manière asynchrone avec les autres microservices via **RabbitMQ** en utilisant le pattern **Topic Exchange** pour un routage flexible.

---

## 🏗️ Architecture RabbitMQ

### Exchanges

| Exchange | Type | Description |
|----------|------|-------------|
| `equipement.events` | Topic | Événements publiés par equipement-service |
| `user.events` | Topic | Événements user-service (consommés) |
| `infrastructure.events` | Topic | Événements infrastructure-service (consommés) |

### Queues

| Queue | Exchange | Routing Keys | Consommateur |
|-------|----------|--------------|--------------|
| `equipement.stock.alerts` | `equipement.events` | `stock.*` | notification-service |
| `equipement.maintenance` | `equipement.events` | `panne.*`, `maintenance.*` | notification-service |
| `equipement.affectations` | `equipement.events` | `affectation.*` | notification-service |
| `equipement.user.events` | `user.events` | `user.*` | equipement-service |
| `equipement.infrastructure.events` | `infrastructure.events` | `batiment.*`, `espace.*` | equipement-service |

---

## 📤 Événements Publiés

### Stock Events

#### `stock.faible`
**Publié quand:** Le stock d'un équipement atteint le seuil minimal

```json
{
  "eventName": "equipement.stock.faible",
  "occurredOn": "2024-01-15T10:30:00Z",
  "aggregateId": "uuid-equipement",
  "payload": {
    "designation": "Ordinateur Dell",
    "reference": "EQ-2024-001",
    "quantiteActuelle": 2,
    "quantiteMinimale": 5,
    "categorieId": "uuid-categorie"
  },
  "metadata": {
    "service": "equipement-service",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

#### `stock.critique`
**Publié quand:** Le stock est inférieur à la moitié du seuil minimal

#### `stock.epuise`
**Publié quand:** Le stock atteint zéro

#### `stock.reapprovisionne`
**Publié quand:** Du stock est ajouté

### Equipement Events

#### `equipement.created`
**Publié quand:** Un nouvel équipement est créé

```json
{
  "eventName": "equipement.created",
  "occurredOn": "2024-01-15T10:30:00Z",
  "aggregateId": "uuid-equipement",
  "payload": {
    "designation": "Ordinateur Dell Latitude",
    "reference": "EQ-2024-001",
    "typeEquipement": "INFORMATIQUE",
    "categorieId": "uuid-categorie",
    "quantiteStock": 10,
    "valeurUnitaire": 500000
  }
}
```

#### `equipement.updated`
**Publié quand:** Un équipement est modifié

#### `equipement.deleted`
**Publié quand:** Un équipement est supprimé

### Affectation Events

#### `affectation.created`
**Publié quand:** Un équipement est affecté à un utilisateur

```json
{
  "eventName": "equipement.affecte",
  "aggregateId": "uuid-equipement",
  "payload": {
    "affectationId": "uuid-affectation",
    "designation": "Ordinateur Dell",
    "reference": "EQ-2024-001",
    "quantite": 1,
    "serviceBeneficiaire": "Service IT",
    "utilisateurBeneficiaire": "Jean Dupont",
    "dateAffectation": "2024-01-15",
    "dateRetourPrevu": "2024-12-31"
  }
}
```

#### `affectation.retour`
**Publié quand:** Un équipement est retourné

#### `affectation.retard`
**Publié quand:** Une affectation dépasse la date prévue de retour

#### `equipement.perdu`
**Publié quand:** Un équipement affecté est déclaré perdu

#### `equipement.endommage`
**Publié quand:** Un équipement est retourné endommagé

### Maintenance Events

#### `panne.enregistree`
**Publié quand:** Une panne est enregistrée

#### `maintenance.terminee`
**Publié quand:** Une maintenance est terminée

#### `maintenance.necessaire`
**Publié quand:** Le seuil de pannes est atteint

---

## 📥 Événements Consommés

### User Events

#### `user.created`
**Action:** Créer un profil équipement utilisateur (optionnel)

#### `user.updated`
**Action:** Mettre à jour les affectations si changement de service

#### `user.deleted`
**Action:** Gérer les équipements encore affectés (retour auto ou notification admin)

### Infrastructure Events

#### `batiment.created` / `espace.created`
**Action:** Synchroniser les espaces de stockage disponibles pour les équipements

---

## 🔧 Configuration

### Variables d'environnement

```env
RABBITMQ_ENABLED=true
RABBITMQ_URL=amqp://guest:guest@localhost:5672
```

### Setup automatique

Au démarrage, le service:
1. ✅ Crée automatiquement les exchanges
2. ✅ Crée automatiquement les queues
3. ✅ Configure tous les bindings

---

## 💻 Utilisation dans le code

### Publier un événement

```typescript
import { RabbitMQPublisherService } from '@infrastructure/messaging';
import { RABBITMQ_ROUTING_KEYS } from '@infrastructure/config';

// Dans un Event Handler
@OnEvent('equipement.stock.faible')
async handleStockFaible(event: StockFaibleEvent) {
  await this.rabbitMQPublisher.publishDomainEvent(
    RABBITMQ_ROUTING_KEYS.STOCK_FAIBLE,
    event
  );
}
```

### Consommer un événement

Les événements sont automatiquement consommés par le `RabbitMQConsumerService`.

Pour ajouter un nouveau handler:

```typescript
// Dans rabbitmq-consumer.service.ts
private async handleUserEvent(msg: amqp.ConsumeMessage) {
  const event = JSON.parse(msg.content.toString());

  switch (event.eventName) {
    case 'user.new_event':
      await this.onNewEvent(event);
      break;
  }
}
```

---

## 🔍 Monitoring

### Logs

Tous les événements publiés/consommés sont loggés:

```
📤 Event published: [equipement.events] stock.faible
📥 User event received: user.created
```

### RabbitMQ Management UI

Accessible sur: `http://localhost:15672`
- Username: `guest`
- Password: `guest`

---

## 🚀 Démarrage

### Avec Docker Compose

```bash
docker-compose up -d
```

Le RabbitMQ est automatiquement démarré avec:
- Port AMQP: `5672`
- Management UI: `15672`

### Tests

```bash
# Publier un événement de test
curl -X POST http://localhost:3004/api/equipements \
  -H "Content-Type: application/json" \
  -d '{
    "designation": "Test Equipment",
    "quantiteStock": 1,
    "quantiteMinimale": 5
  }'

# Vérifier dans les logs
docker-compose logs -f equipement-service
```

---

## 🔗 Intégration avec autres services

### notification-service (à implémenter)

Doit consommer:
- `equipement.stock.alerts` → Envoyer email/SMS pour stock faible
- `equipement.maintenance` → Notifier responsable maintenance
- `equipement.affectations` → Rappels utilisateurs

### user-service

Doit publier sur `user.events`:
- `user.created`
- `user.updated`
- `user.deleted`

### infrastructure-service

Doit publier sur `infrastructure.events`:
- `batiment.created`
- `espace.created`

---

## 📝 Best Practices

1. ✅ **Idempotence**: Gérer les doublons (même événement reçu 2x)
2. ✅ **Dead Letter Queue**: Configurer une DLQ pour les messages en échec
3. ✅ **Retry Policy**: Implémenter une stratégie de retry
4. ✅ **Monitoring**: Surveiller les queues (taille, messages non-ACK)
5. ✅ **Versioning**: Inclure la version d'événement dans le payload

---

## ⚠️ TODO

- [ ] Implémenter Dead Letter Queue
- [ ] Ajouter retry policy avec backoff exponentiel
- [ ] Ajouter métriques Prometheus
- [ ] Implémenter circuit breaker pour RabbitMQ
- [ ] Ajouter tests d'intégration RabbitMQ
