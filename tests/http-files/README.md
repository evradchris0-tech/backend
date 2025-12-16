# IMMO360 - Guide de Tests HTTP

## Prérequis

1. **VS Code** avec extension **REST Client** installée
2. Tous les microservices démarrés
3. Base de données PostgreSQL avec utilisateurs créés

## Ordre d'Exécution

### Étape 1 : Vérifier l'infrastructure
```bash
# Vérifier que tous les services sont UP
curl http://localhost:4000/health
curl http://localhost:4001/auth/health
curl http://localhost:4002/users
curl http://localhost:4003/history/health
```

### Étape 2 : Login et récupération du token

1. Ouvre `01-auth-service-direct.http`
2. Exécute "2. Login Super Admin"
3. Copie le `accessToken` de la réponse
4. Colle-le dans `@accessToken` du fichier `00-variables.http`

### Étape 3 : Tests Auth Service

Exécute dans l'ordre :
- Health Check
- Login (différents rôles)
- Profile
- Refresh Token
- Change Password

### Étape 4 : Tests User Service

Exécute dans l'ordre :
- Créer utilisateur
- Lister utilisateurs
- Filtrer/Rechercher
- Mettre à jour
- Supprimer

### Étape 5 : Tests Sync Service

Exécute dans l'ordre :
- Health Check
- Historique global
- Filtres (type, service, statut)
- Statistiques

### Étape 6 : Tests via Gateway

Répète les tests précédents mais via le port 4000 (gateway).
Vérifie que le cache fonctionne correctement.

## Variables Dynamiques

Les fichiers utilisent la syntaxe REST Client pour extraire automatiquement les valeurs des réponses :
```http
# @name loginRequest
POST http://localhost:4001/auth/login
...

@accessToken = {{loginRequest.response.body.$.accessToken}}
```

## Notes Importantes

- **Les tokens expirent après 2h** - Refais un login si nécessaire
- **Remplace `{{userId}}` par un vrai UUID** après création d'utilisateur
- **Pour les uploads Excel** : Utilise Postman (voir section suivante)

## Codes HTTP Attendus

- `200` : OK
- `201` : Créé
- `401` : Non authentifié
- `403` : Non autorisé (permissions)
- `404` : Ressource introuvable
- `422` : Validation échouée
- `500` : Erreur serveur
```

---

## 📦 POSTMAN - Upload Fichier Excel

### **Structure du Fichier Excel à Uploader**

**Créer le fichier :** `tests/sample-data/occupants-template.xlsx`

**Colonnes obligatoires :**

| Colonne | Type | Exemple | Requis |
|---------|------|---------|--------|
| email | String | occupant1@example.com | ✅ |
| firstName | String | Jean | ✅ |
| lastName | String | Dupont | ✅ |
| phoneNumber | String | +237690123456 | ❌ |
| roomNumber | String | A101 | ❌ |
| cin | String | 123456789 | ❌ |

**Exemple de données :**
```
email,firstName,lastName,phoneNumber,roomNumber,cin
occupant1@test.cm,Jean,Dupont,+237690001111,A101,123456789
occupant2@test.cm,Marie,Martin,+237690002222,A102,987654321
occupant3@test.cm,Paul,Bernard,+237690003333,B201,456789123
```

### **Requête Postman pour Upload**
```
METHOD: POST
URL: http://localhost:4002/users/import/upload

Headers:
  Authorization: Bearer YOUR_ACCESS_TOKEN

Body (form-data):
  Key: file
  Type: File
  Value: [Sélectionne ton fichier .xlsx]