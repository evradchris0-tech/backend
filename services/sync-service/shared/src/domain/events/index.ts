/**
 * Domain Events - Shared Interfaces
 * 
 * IMPORTANT: Ces interfaces définissent le CONTRAT entre les microservices.
 * 
 * ⚠️ AUCUNE DÉPENDANCE entre microservices!
 * 
 * Comment ça fonctionne:
 * 1. User-Service: Publie l'événement JSON sur RabbitMQ
 * 2. RabbitMQ: Route le JSON aux queues
 * 3. Auth-Service/Sync-Service: Reçoivent le JSON
 * 4. NestJS/RabbitMQ: Désérialise automatiquement en interface
 * 5. Handlers: Traitent l'événement
 * 
 * Le lien: Seulement le JSON sur RabbitMQ. Pas d'imports directes!
 */

export * from './users-imported.event';
export * from './passwords-generated.event';
