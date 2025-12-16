# 🚀 IMMO360 - Récapitulatif Complet des Endpoints

**Version:** 1.0.0  
**Date:** 29 Novembre 2025  
**Base URL:** `http://localhost:3001`

---

## 📋 TABLE DES MATIÈRES

1. [Auth Service Endpoints](#1-auth-service-endpoints)
2. [User Management Endpoints](#2-user-management-endpoints)
3. [Codes d'erreur HTTP](#3-codes-derreur-http)
4. [Variables d'environnement](#4-variables-denvironnement)

---

## 1. AUTH SERVICE ENDPOINTS

### 1.1 Login (Email/Password)

**Endpoint:** `POST /auth/login`  
**Accès:** Public  
**Description:** Connexion avec email et mot de passe

**Payload d'entrée:**
```json
{
  "email": "superadmin@immo360.cm",
  "password": "SuperAdmin123!"
}
```

**Réponse succès (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "sessionToken": "uuid-session",
  "expiresIn": 7200,
  "user": {
    "id": "uuid-user",
    "email": "superadmin@immo360.cm",
    "role": "SUPERADMIN",
    "status": "ACTIVE"
  }
}
```

**Erreurs possibles:**
- `401 Unauthorized` - Identifiants invalides
- `401 Unauthorized` - Compte verrouillé
- `401 Unauthorized` - Compte inactif
- `400 Bad Request` - Validation échouée

**Statut:** ✅ Implémenté

---

### 1.2 Refresh Token

**Endpoint:** `POST /auth/refresh`
**Accès:** Public
**Description:** Rafraîchir l'access token

**Payload d'entrée:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Réponse succès (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "sessionToken": "uuid-session",
  "expiresIn": 7200
}
```

**Erreurs possibles:**
- `401 Unauthorized` - Refresh token invalide ou expiré
- `404 Not Found` - Refresh token non trouvé

**Statut:** ✅ Implémenté

---

### 1.3 Logout

**Endpoint:** `POST /auth/logout`
**Accès:** Authentifié (JWT requis)  
**Description:** Déconnexion et révocation de la session

**Headers requis:**
```
Authorization: Bearer {accessToken}
```

**Payload d'entrée:** Aucun

**Réponse succès (204 No Content):** Pas de body

**Erreurs possibles:**
- `401 Unauthorized` - Token invalide ou expiré
- `404 Not Found` - Session non trouvée

**Statut:** ✅ Implémenté

---

### 1.4 Get Current User

**Endpoint:** `GET /auth/me`  
**Accès:** Authentifié (JWT requis)  
**Description:** Récupérer les informations de l'utilisateur connecté

**Headers requis:**
```
Authorization: Bearer {accessToken}
```

**Réponse succès (200 OK):**
```json
{
  "userId": "uuid-user",
  "email": "superadmin@immo360.cm",
  "role": "SUPERADMIN"
}
```

**Erreurs possibles:**
- `401 Unauthorized` - Token invalide ou expiré

**Statut:** ✅ Implémenté

---

### 1.5 Change Password

**Endpoint:** `POST /auth/change-password`  
**Accès:** Authentifié (JWT requis)  
**Description:** Changer le mot de passe de l'utilisateur connecté

**Headers requis:**
```
Authorization: Bearer {accessToken}
```

**Payload d'entrée:**
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword456!"
}
```

**Réponse succès (200 OK):**
```json
{
  "message": "Password changed successfully. All sessions have been terminated."
}
```

**Erreurs possibles:**
- `401 Unauthorized` - Mot de passe actuel incorrect
- `400 Bad Request` - Nouveau mot de passe trop faible
- `400 Bad Request` - Nouveau mot de passe identique à l'ancien

**Statut:** ✅ Implémenté

---

### 1.6 Verify Email

**Endpoint:** `POST /auth/verify-email`  
**Accès:** Public  
**Description:** Vérifier l'email avec le code à 6 caractères

**Payload d'entrée:**
```json
{
  "email": "admin@immo360.cm",
  "code": "ABC123"
}
```

**Réponse succès (200 OK):**
```json
{
  "message": "Email verified successfully. You can now login."
}
```

**Erreurs possibles:**
- `404 Not Found` - Utilisateur non trouvé
- `400 Bad Request` - Code invalide ou expiré

**Statut:** ✅ Implémenté

---

### 1.7 Resend Verification Code

**Endpoint:** `POST /auth/resend-verification-code`  
**Accès:** Public  
**Description:** Renvoyer le code de vérification email

**Payload d'entrée:**
```json
{
  "email": "admin@immo360.cm"
}
```

**Réponse succès (200 OK):**
```json
{
  "message": "Verification code sent successfully. Check your email."
}
```

**Erreurs possibles:**
- `404 Not Found` - Utilisateur non trouvé
- `400 Bad Request` - Email déjà vérifié

**Statut:** ✅ Implémenté

---

### 1.8 Google Token Login

**Endpoint:** `POST /auth/google/token-login`  
**Accès:** Public  
**Description:** Connexion via Google ID Token (sans redirection)

**Payload d'entrée:**
```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjE5ZmUyYT..."
}
```

**Réponse succès (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "sessionToken": "uuid-session",
  "expiresIn": 7200,
  "user": {
    "id": "uuid-user",
    "email": "user@gmail.com",
    "role": "ADMINISTRATOR",
    "status": "ACTIVE"
  }
}
```

**Erreurs possibles:**
- `401 Unauthorized` - Token Google invalide
- `401 Unauthorized` - Aucun compte trouvé avec cet email (l'utilisateur doit être créé par un admin d'abord)
- `400 Bad Request` - Email Google non vérifié

**Statut:** ✅ Implémenté

---

## 2. USER MANAGEMENT ENDPOINTS

### 2.1 Create User

**Endpoint:** `POST /users`  
**Accès:** SUPERADMIN, ADMINISTRATOR  
**Description:** Créer un nouvel utilisateur

**Headers requis:**
```
Authorization: Bearer {accessToken}
```

**Payload d'entrée (Admin):**
```json
{
  "email": "admin@immo360.cm",
  "firstName": "Admin",
  "lastName": "Principal",
  "role": "ADMINISTRATOR"
}
```

**Payload d'entrée (Agent):**
```json
{
  "email": "agent@immo360.cm",
  "firstName": "Pierre",
  "lastName": "Dupont",
  "role": "AGENT_TERRAIN"
}
```

**Payload d'entrée (Occupant avec chambre):**
```json
{
  "email": "occupant@immo360.cm",
  "firstName": "Jean",
  "lastName": "Martin",
  "role": "OCCUPANT",
  "roomId": "uuid-room",
  "roomNumber": "205",
  "academicSessionId": "uuid-session"
}
```

**Réponse succès (201 Created):**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "uuid-user",
    "email": "admin@immo360.cm",
    "firstName": "Admin",
    "lastName": "Principal",
    "fullName": "Admin Principal",
    "role": "ADMINISTRATOR",
    "status": "PENDING_EMAIL_VERIFICATION",
    "emailVerified": false,
    "googleId": null,
    "profilePicture": null,
    "username": null,
    "currentRoomId": null,
    "currentAcademicSessionId": null,
    "lastLoginAt": null,
    "createdAt": "2025-11-29T12:00:00.000Z",
    "updatedAt": "2025-11-29T12:00:00.000Z"
  },
  "temporaryPassword": "Abc123!XyZ789$Def"
}
```

**Erreurs possibles:**
- `403 Forbidden` - Permissions insuffisantes
- `409 Conflict` - Email déjà existant
- `400 Bad Request` - OCCUPANT sans chambre assignée

**Statut:** ✅ Implémenté

---

### 2.2 Get Users (Paginated)

**Endpoint:** `GET /users?page=1&limit=10&role=ADMINISTRATOR&status=ACTIVE&search=admin`  
**Accès:** SUPERADMIN, ADMINISTRATOR  
**Description:** Liste paginée des utilisateurs avec filtres

**Headers requis:**
```
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `page` (optional, default: 1) - Numéro de page
- `limit` (optional, default: 10, max: 100) - Nombre d'éléments par page
- `role` (optional) - Filtre par rôle (SUPERADMIN, ADMINISTRATOR, SUPERVISOR, AGENT_TERRAIN, OCCUPANT)
- `status` (optional) - Filtre par statut (ACTIVE, INACTIVE, LOCKED, PENDING_EMAIL_VERIFICATION)
- `search` (optional) - Recherche textuelle (email, firstName, lastName, username)

**Réponse succès (200 OK):**
```json
{
  "data": [
    {
      "id": "uuid-user-1",
      "email": "admin@immo360.cm",
      "firstName": "Admin",
      "lastName": "Principal",
      "fullName": "Admin Principal",
      "role": "ADMINISTRATOR",
      "status": "ACTIVE",
      "emailVerified": true,
      "googleId": null,
      "profilePicture": null,
      "username": null,
      "currentRoomId": null,
      "currentAcademicSessionId": null,
      "lastLoginAt": "2025-11-29T12:00:00.000Z",
      "createdAt": "2025-11-29T11:00:00.000Z",
      "updatedAt": "2025-11-29T12:00:00.000Z"
    },
    {
      "id": "uuid-user-2",
      "email": "superadmin@immo360.cm",
      "firstName": "Super",
      "lastName": "Admin",
      "fullName": "Super Admin",
      "role": "SUPERADMIN",
      "status": "ACTIVE",
      "emailVerified": true,
      "googleId": null,
      "profilePicture": null,
      "username": null,
      "currentRoomId": null,
      "currentAcademicSessionId": null,
      "lastLoginAt": "2025-11-29T11:30:00.000Z",
      "createdAt": "2025-11-29T10:00:00.000Z",
      "updatedAt": "2025-11-29T11:30:00.000Z"
    }
  ],
  "total": 2,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

**Erreurs possibles:**
- `403 Forbidden` - Permissions insuffisantes
- `400 Bad Request` - Paramètres invalides

**Statut:** ✅ Implémenté

---

### 2.3 Get User By ID

**Endpoint:** `GET /users/:id`  
**Accès:** SUPERADMIN, ADMINISTRATOR  
**Description:** Récupérer les détails d'un utilisateur

**Headers requis:**
```
Authorization: Bearer {accessToken}
```

**Réponse succès (200 OK):**
```json
{
  "id": "uuid-user",
  "email": "admin@immo360.cm",
  "firstName": "Admin",
  "lastName": "Principal",
  "fullName": "Admin Principal",
  "role": "ADMINISTRATOR",
  "status": "ACTIVE",
  "emailVerified": true,
  "googleId": null,
  "profilePicture": null,
  "username": null,
  "currentRoomId": null,
  "currentAcademicSessionId": null,
  "lastLoginAt": "2025-11-29T12:00:00.000Z",
  "createdAt": "2025-11-29T11:00:00.000Z",
  "updatedAt": "2025-11-29T12:00:00.000Z"
}
```

**Erreurs possibles:**
- `404 Not Found` - Utilisateur non trouvé
- `403 Forbidden` - Permissions insuffisantes

**Statut:** ✅ Implémenté

---

### 2.4 Update User

**Endpoint:** `PATCH /users/:id`  
**Accès:** SUPERADMIN, ADMINISTRATOR  
**Description:** Mettre à jour un utilisateur

**Headers requis:**
```
Authorization: Bearer {accessToken}
```

**Payload d'entrée (tous les champs sont optionnels):**
```json
{
  "email": "newemail@immo360.cm",
  "firstName": "NewFirstName",
  "lastName": "NewLastName",
  "role": "SUPERVISOR",
  "status": "ACTIVE",
  "roomId": "uuid-room",
  "roomNumber": "206",
  "academicSessionId": "uuid-session"
}
```

**Réponse succès (200 OK):**
```json
{
  "message": "User updated successfully",
  "user": {
    "id": "uuid-user",
    "email": "newemail@immo360.cm",
    "firstName": "NewFirstName",
    "lastName": "NewLastName",
    "fullName": "NewFirstName NewLastName",
    "role": "SUPERVISOR",
    "status": "ACTIVE",
    "emailVerified": true,
    "googleId": null,
    "profilePicture": null,
    "username": null,
    "currentRoomId": null,
    "currentAcademicSessionId": null,
    "lastLoginAt": "2025-11-29T12:00:00.000Z",
    "createdAt": "2025-11-29T11:00:00.000Z",
    "updatedAt": "2025-11-29T13:00:00.000Z"
  }
}
```

**Erreurs possibles:**
- `404 Not Found` - Utilisateur non trouvé
- `403 Forbidden` - Permissions insuffisantes
- `403 Forbidden` - Tentative de modifier son propre rôle
- `409 Conflict` - Email déjà utilisé
- `400 Bad Request` - Assignation chambre pour non-OCCUPANT

**Statut:** ✅ Implémenté

---

### 2.5 Delete User

**Endpoint:** `DELETE /users/:id`  
**Accès:** SUPERADMIN, ADMINISTRATOR  
**Description:** Supprimer (désactiver) un utilisateur

**Headers requis:**
```
Authorization: Bearer {accessToken}
```

**Réponse succès (204 No Content):** Pas de body

**Erreurs possibles:**
- `404 Not Found` - Utilisateur non trouvé
- `403 Forbidden` - Permissions insuffisantes
- `400 Bad Request` - Tentative de se supprimer soi-même

**Statut:** ✅ Implémenté

---

### 2.6 Assign Room to Occupant

**Endpoint:** `PATCH /users/:id/assign-room`  
**Accès:** SUPERADMIN, ADMINISTRATOR  
**Description:** Assigner une chambre à un OCCUPANT

**Headers requis:**
```
Authorization: Bearer {accessToken}
```

**Payload d'entrée:**
```json
{
  "roomId": "uuid-room",
  "roomNumber": "205",
  "academicSessionId": "uuid-session"
}
```

**Réponse succès (200 OK):**
```json
{
  "message": "Room assigned successfully",
  "user": {
    "id": "uuid-user",
    "email": "occupant@immo360.cm",
    "firstName": "Jean",
    "lastName": "Martin",
    "fullName": "Jean Martin",
    "role": "OCCUPANT",
    "status": "ACTIVE",
    "emailVerified": true,
    "googleId": null,
    "profilePicture": null,
    "username": "Jean205",
    "currentRoomId": "uuid-room",
    "currentAcademicSessionId": "uuid-session",
    "lastLoginAt": null,
    "createdAt": "2025-11-29T11:00:00.000Z",
    "updatedAt": "2025-11-29T13:00:00.000Z"
  }
}
```

**Erreurs possibles:**
- `404 Not Found` - Utilisateur non trouvé
- `400 Bad Request` - Utilisateur n'est pas un OCCUPANT
- `403 Forbidden` - Permissions insuffisantes

**Statut:** ✅ Implémenté

---

### 2.7 Import Occupants (Excel)

**Endpoint:** `POST /users/import/occupants`  
**Accès:** SUPERADMIN, ADMINISTRATOR  
**Description:** Importer des occupants en masse via fichier Excel

**Headers requis:**
```
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data
```

**Form Data:**
- `file` (File) - Fichier Excel (.xlsx ou .xls)
- `academicSessionId` (String) - UUID de la session académique

**Format Excel attendu:**

| Prénom | Nom | Email | Numéro Chambre |
|--------|-----|-------|----------------|
| Jean | Dupont | jean.dupont@example.com | 205 |
| Marie | Martin | marie.martin@example.com | 206 |

**Réponse succès (200 OK):**
```json
{
  "message": "Import completed",
  "summary": {
    "totalProcessed": 2,
    "successCount": 2,
    "failedCount": 0
  },
  "errors": [],
  "createdUsers": [
    {
      "email": "jean.dupont@example.com",
      "username": "Jean205",
      "roomNumber": "205",
      "temporaryPassword": "Abc123!XyZ789$"
    },
    {
      "email": "marie.martin@example.com",
      "username": "Marie206",
      "roomNumber": "206",
      "temporaryPassword": "Def456!Ghi012$"
    }
  ]
}
```

**Réponse avec erreurs (200 OK):**
```json
{
  "message": "Import completed",
  "summary": {
    "totalProcessed": 3,
    "successCount": 2,
    "failedCount": 1
  },
  "errors": [
    {
      "row": 3,
      "email": "duplicate@example.com",
      "error": "Email already exists in database"
    }
  ],
  "createdUsers": [...]
}
```

**Erreurs possibles:**
- `400 Bad Request` - Fichier manquant
- `400 Bad Request` - academicSessionId manquant
- `400 Bad Request` - Format de fichier invalide (doit être .xlsx ou .xls)
- `400 Bad Request` - Erreurs de validation dans le fichier Excel

**Statut:** ✅ Implémenté

---

### 2.8 Download Import Template

**Endpoint:** `GET /users/import/template`  
**Accès:** SUPERADMIN, ADMINISTRATOR  
**Description:** Télécharger le template Excel pour l'import

**Headers requis:**
```
Authorization: Bearer {accessToken}
```

**Réponse succès (200 OK):**
- Content-Type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- Content-Disposition: `attachment; filename=occupants_import_template.xlsx`
- Body: Fichier Excel binaire

**Statut:** ✅ Implémenté

---

## 3. CODES D'ERREUR HTTP

| Code | Signification | Description |
|------|---------------|-------------|
| 200 | OK | Requête réussie |
| 201 | Created | Ressource créée |
| 204 | No Content | Requête réussie sans contenu |
| 400 | Bad Request | Données invalides |
| 401 | Unauthorized | Non authentifié |
| 403 | Forbidden | Permissions insuffisantes |
| 404 | Not Found | Ressource non trouvée |
| 409 | Conflict | Conflit (ex: email existant) |
| 500 | Internal Server Error | Erreur serveur |

---

## 4. VARIABLES D'ENVIRONNEMENT
```bash
# Server
NODE_ENV=development
PORT=3001
HOST=0.0.0.0

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=immo360_auth
DB_SYNCHRONIZE=false
DB_LOGGING=true

# JWT
JWT_SECRET=immo360-super-secret-jwt-key
JWT_ACCESS_TOKEN_EXPIRATION=2h
JWT_REFRESH_TOKEN_EXPIRATION=7d

# Password
BCRYPT_SALT_ROUNDS=12
PASSWORD_ENCRYPTION_KEY=immo360-password-encryption-key

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@immo360.cm

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-secret
GOOGLE_REDIRECT_URI=http://localhost:3001/auth/google/redirect

# Frontend
FRONTEND_URL=http://localhost:3000

# Security
MAX_LOGIN_ATTEMPTS=5
ACCOUNT_LOCK_DURATION_MS=900000
SESSION_CLEANUP_INTERVAL=3600000
SESSION_MAX_INACTIVE_DURATION=2592000000
```

---

**📅 Dernière mise à jour:** 29 Novembre 2025
**📧 Support:** chrisomgba04@gmail.com