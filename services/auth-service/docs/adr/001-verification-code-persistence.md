# ADR-001: Persistance des codes de vérification

**Date**: 2024-12-12  
**Statut**: Accepté  
**Auteur**: Claude-Architect-Ω

## Contexte

Le service `VerificationCodeService` utilisait un stockage en mémoire (`Map<string, VerificationCodeData>`) pour gérer les codes de vérification d'email et de réinitialisation de mot de passe.

### Problèmes identifiés

1. **Perte des codes au redémarrage** : Tout redéploiement ou crash du service supprimait les codes en attente
2. **Incompatibilité avec le scaling horizontal** : Chaque instance maintenait sa propre Map, rendant impossible la vérification d'un code généré par une autre instance
3. **Fuite mémoire potentielle** : Le cleanup des codes expirés dépendait d'appels sporadiques

## Décision

Implémenter un repository PostgreSQL pour persister les codes de vérification avec les caractéristiques suivantes :

- Table `verification_codes` avec colonnes : `code` (PK), `email`, `expires_at`, `type`, `created_at`
- Index sur `email` et `expires_at` pour les requêtes fréquentes
- Interface `IVerificationCodeRepository` dans la couche Domain (Port)
- Implémentation `TypeOrmVerificationCodeRepository` dans Infrastructure (Adapter)

## Alternatives considérées

### Redis avec TTL natif
- **Avantages** : TTL automatique, performances élevées
- **Inconvénients** : Nouvelle dépendance d'infrastructure, complexité DevOps accrue
- **Rejet** : Le projet utilise déjà PostgreSQL, pas de justification pour ajouter Redis

### Stockage en base avec table dédiée (choisi)
- **Avantages** : Réutilise l'infrastructure existante, transactionnel, persistant
- **Inconvénients** : Nécessite un job de cleanup périodique

## Conséquences

### Positives
- Codes persistés entre redémarrages
- Compatible avec N instances (scale-out)
- Traçabilité via les timestamps

### Négatives
- Légère latence additionnelle (négligeable)
- Nécessité d'un cron job pour nettoyer les codes expirés

## Migration

- Migration TypeORM : `1734000000000-CreateVerificationCodesTable.ts`
- Commande : `npm run typeorm migration:run`

## Rollback

```bash
npm run typeorm migration:revert
git revert <commit-sha>
```