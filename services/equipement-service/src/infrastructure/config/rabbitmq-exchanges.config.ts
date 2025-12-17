/**
 * Configuration des Exchanges et Queues RabbitMQ
 * Pattern: Topic Exchange pour routage flexible
 */

export const RABBITMQ_EXCHANGES = {
  // Exchange pour les événements équipements
  EQUIPEMENT_EVENTS: 'equipement.events',

  // Exchange pour les événements utilisateurs
  USER_EVENTS: 'user.events',

  // Exchange pour les événements infrastructure
  INFRASTRUCTURE_EVENTS: 'infrastructure.events',
};

export const RABBITMQ_QUEUES = {
  // Queues pour equipement-service
  EQUIPEMENT_STOCK_ALERTS: 'equipement.stock.alerts',
  EQUIPEMENT_MAINTENANCE: 'equipement.maintenance',
  EQUIPEMENT_AFFECTATIONS: 'equipement.affectations',

  // Queue pour recevoir les événements user
  EQUIPEMENT_USER_EVENTS: 'equipement.user.events',

  // Queue pour recevoir les événements infrastructure
  EQUIPEMENT_INFRASTRUCTURE_EVENTS: 'equipement.infrastructure.events',

  // Queue pour communication avec infrastructure-service
  INFRASTRUCTURE_QUEUE: 'infrastructure_queue',
};

export const RABBITMQ_ROUTING_KEYS = {
  // Équipement events
  EQUIPEMENT_CREATED: 'equipement.created',
  EQUIPEMENT_UPDATED: 'equipement.updated',
  EQUIPEMENT_DELETED: 'equipement.deleted',

  // Stock events
  STOCK_FAIBLE: 'stock.faible',
  STOCK_CRITIQUE: 'stock.critique',
  STOCK_EPUISE: 'stock.epuise',
  STOCK_REAPPROVISIONNE: 'stock.reapprovisionne',

  // Mouvement events
  MOUVEMENT_ENTREE: 'mouvement.entree',
  MOUVEMENT_SORTIE: 'mouvement.sortie',

  // Affectation events
  AFFECTATION_CREATED: 'affectation.created',
  AFFECTATION_RETOUR: 'affectation.retour',
  AFFECTATION_RETARD: 'affectation.retard',
  EQUIPEMENT_PERDU: 'equipement.perdu',
  EQUIPEMENT_ENDOMMAGE: 'equipement.endommage',

  // Affectation vers espace (pour infrastructure-service)
  AFFECTATION_VERS_ESPACE: 'affectation.vers.espace',
  RETOUR_DEPUIS_ESPACE: 'retour.depuis.espace',

  // Maintenance events
  PANNE_ENREGISTREE: 'panne.enregistree',
  MAINTENANCE_TERMINEE: 'maintenance.terminee',
  MAINTENANCE_NECESSAIRE: 'maintenance.necessaire',

  // User events (received)
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  USER_DELETED: 'user.deleted',

  // Infrastructure events (received)
  BATIMENT_CREATED: 'batiment.created',
  BATIMENT_UPDATED: 'batiment.updated',
  ESPACE_CREATED: 'espace.created',
  ESPACE_UPDATED: 'espace.updated',
  ESPACE_DELETED: 'espace.deleted',
  EQUIPEMENT_STATUS_CHANGED_INFRA: 'equipement.status.changed.infra',
};

/**
 * Patterns de messages pour RPC avec infrastructure-service
 */
export const MESSAGE_PATTERNS = {
  // Requêtes RPC vers infrastructure-service
  VALIDATE_ESPACE_EXISTS: 'infrastructure.espace.validate',
  GET_ESPACE_BY_ID: 'infrastructure.espace.get',
  GET_LOCALISATION_COMPLETE: 'infrastructure.localisation.get',

  // Événements envoyés vers infrastructure-service
  EQUIPEMENT_AFFECTE_VERS_ESPACE: 'equipement.affecte.depuis.stock',
  EQUIPEMENT_RETOURNE_DU_ESPACE: 'equipement.retourne.au.stock',
  EQUIPEMENT_PANNE: 'equipement.panne.enregistree',
  EQUIPEMENT_MAINTENANCE_FIN: 'equipement.maintenance.terminee',
  STOCK_FAIBLE_ALERTE: 'equipement.stock.faible',
} as const;

/**
 * Bindings entre queues et exchanges
 */
export const QUEUE_BINDINGS = [
  // Alertes stock -> notification service
  {
    queue: RABBITMQ_QUEUES.EQUIPEMENT_STOCK_ALERTS,
    exchange: RABBITMQ_EXCHANGES.EQUIPEMENT_EVENTS,
    routingKeys: [
      RABBITMQ_ROUTING_KEYS.STOCK_FAIBLE,
      RABBITMQ_ROUTING_KEYS.STOCK_CRITIQUE,
      RABBITMQ_ROUTING_KEYS.STOCK_EPUISE,
    ],
  },

  // Maintenance -> notification service
  {
    queue: RABBITMQ_QUEUES.EQUIPEMENT_MAINTENANCE,
    exchange: RABBITMQ_EXCHANGES.EQUIPEMENT_EVENTS,
    routingKeys: [
      RABBITMQ_ROUTING_KEYS.PANNE_ENREGISTREE,
      RABBITMQ_ROUTING_KEYS.MAINTENANCE_NECESSAIRE,
    ],
  },

  // Affectations -> notification service
  {
    queue: RABBITMQ_QUEUES.EQUIPEMENT_AFFECTATIONS,
    exchange: RABBITMQ_EXCHANGES.EQUIPEMENT_EVENTS,
    routingKeys: [
      RABBITMQ_ROUTING_KEYS.AFFECTATION_CREATED,
      RABBITMQ_ROUTING_KEYS.AFFECTATION_RETARD,
      RABBITMQ_ROUTING_KEYS.EQUIPEMENT_PERDU,
    ],
  },

  // Recevoir événements utilisateurs
  {
    queue: RABBITMQ_QUEUES.EQUIPEMENT_USER_EVENTS,
    exchange: RABBITMQ_EXCHANGES.USER_EVENTS,
    routingKeys: ['user.*'], // Wildcard pour tous les events user
  },

  // Recevoir événements infrastructure
  {
    queue: RABBITMQ_QUEUES.EQUIPEMENT_INFRASTRUCTURE_EVENTS,
    exchange: RABBITMQ_EXCHANGES.INFRASTRUCTURE_EVENTS,
    routingKeys: ['batiment.*', 'espace.*'],
  },
];
