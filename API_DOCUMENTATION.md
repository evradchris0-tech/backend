# DOCUMENTATION API IMMO360

## TABLE DES MATIERES

- [1. INTRODUCTION](#1-introduction)
  - [1.1 Architecture](#11-architecture)
  - [1.2 Authentification](#12-authentification)
  - [1.3 Conventions](#13-conventions)
- [2. AUTHENTIFICATION (AUTH SERVICE)](#2-authentification-auth-service)
  - [2.1 Login](#21-login)
  - [2.2 Refresh Token](#22-refresh-token)
  - [2.3 Logout](#23-logout)
  - [2.4 Change Password](#24-change-password)
  - [2.5 Verify Email](#25-verify-email)
  - [2.6 Verify Email by Link](#26-verify-email-by-link)
  - [2.7 Get Profile](#27-get-profile)
  - [2.8 Google Login](#28-google-login)
  - [2.9 Health Check](#29-health-check)
- [3. GESTION DES UTILISATEURS (USER SERVICE)](#3-gestion-des-utilisateurs-user-service)
  - [3.1 Create User](#31-create-user)
  - [3.2 Get All Users](#32-get-all-users)
  - [3.3 Get User by ID](#33-get-user-by-id)
  - [3.4 Update User](#34-update-user)
  - [3.5 Delete User](#35-delete-user)
  - [3.6 Assign Room](#36-assign-room)
  - [3.7 Validate Excel](#37-validate-excel)
  - [3.8 Upload Excel](#38-upload-excel)
  - [3.9 Export Users](#39-export-users)
  - [3.10 Download Template](#310-download-template)
  - [3.11 Import Occupants](#311-import-occupants)
- [4. SYNCHRONISATION (SYNC SERVICE)](#4-synchronisation-sync-service)
  - [4.1 Get History](#41-get-history)
  - [4.2 Get Entity History](#42-get-entity-history)
  - [4.3 Get Event History](#43-get-event-history)
  - [4.4 Get Statistics](#44-get-statistics)
  - [4.5 Get Service Statistics](#45-get-service-statistics)
  - [4.6 Get Type Statistics](#46-get-type-statistics)
  - [4.7 Export History CSV](#47-export-history-csv)
  - [4.8 Purge Old Operations](#48-purge-old-operations)
  - [4.9 Health Check](#49-health-check)
- [5. API GATEWAY](#5-api-gateway)
  - [5.1 Endpoints Proxy](#51-endpoints-proxy)
  - [5.2 Cache Management](#52-cache-management)
  - [5.3 Rate Limiting](#53-rate-limiting)
- [6. SCHEMAS DE DONNEES](#6-schemas-de-donnees)
  - [6.1 User Schema](#61-user-schema)
  - [6.2 Auth Schema](#62-auth-schema)
  - [6.3 Pagination Schema](#63-pagination-schema)
  - [6.4 Error Schema](#64-error-schema)
- [7. CODES D'ERREUR](#7-codes-derreur)
  - [7.1 4xx Client Errors](#71-4xx-client-errors)
  - [7.2 5xx Server Errors](#72-5xx-server-errors)
- [8. EXEMPLES D'INTEGRATION](#8-exemples-dintegration)
  - [8.1 ReactJS Service](#81-reactjs-service)
  - [8.2 Flutter Service](#82-flutter-service)
  - [8.3 Python Client](#83-python-client)

---

## 1. INTRODUCTION

### 1.1 Architecture

IMMO360 est une plateforme de gestion immobiliere construite avec une architecture microservices.

**Architecture technique:**

| Composant | Technologie | Port | Description |
|-----------|-------------|------|-------------|
| API Gateway | NestJS | 4000 | Point d'entree unique, gestion cache et authentification |
| Auth Service | NestJS | 4001 | Authentification, gestion des sessions JWT |
| User Service | NestJS | 4002 | Gestion des utilisateurs, import/export Excel |
| Sync Service | NestJS | 4003 | Historique des operations, synchronisation |
| Base de donnees | PostgreSQL | 5432 | Stockage persistant |
| Cache | Redis | 6379 | Cache des reponses GET |
| Message Queue | RabbitMQ | 5672 | Communication asynchrone entre services |

**URLs des services:**

```
API Gateway:    http://127.0.0.1:4000
Auth Service:   http://127.0.0.1:4001
User Service:   http://127.0.0.1:4002
Sync Service:   http://127.0.0.1:4003
```

### 1.2 Authentification

Toutes les requetes protegees necessitent un header Authorization avec un token JWT Bearer.

**Format du header:**

```
Authorization: Bearer <accessToken>
```

**Flux d'authentification:**

1. Client appelle POST /auth/login avec email et password
2. Serveur retourne accessToken (expire 1h) et refreshToken (expire 7j)
3. Client stocke les tokens de maniere securisee
4. Client utilise accessToken dans le header Authorization
5. Quand accessToken expire, client utilise POST /auth/refresh
6. Client met a jour accessToken et continue

**Tokens JWT:**

| Token | Duree de vie | Usage |
|-------|--------------|-------|
| accessToken | 1 heure | Authentification des requetes API |
| refreshToken | 7 jours | Renouvellement de l'accessToken |
| sessionToken | Session | Identifiant de session utilisateur |

### 1.3 Conventions

**Format des reponses:**

Toutes les reponses API suivent un format JSON standard.

**Success Response:**
```json
{
  "status": "success",
  "data": {},
  "message": "Operation completed successfully"
}
```

**Error Response:**
```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Bad Request"
}
```

**Pagination:**

Les endpoints retournant des listes supportent la pagination:

```
GET /users?page=1&limit=10
```

**Formats de dates:**

Toutes les dates utilisent le format ISO 8601:

```
2024-12-14T10:30:00.000Z
```

---

## 2. AUTHENTIFICATION (AUTH SERVICE)

### 2.1 Login

#### Description
Authentifie un utilisateur avec email et mot de passe. Retourne un access token JWT, un refresh token et un session token.

#### Endpoint Direct (Auth Service)
```
POST http://127.0.0.1:4001/auth/login
```

#### Endpoint via Gateway
```
POST http://127.0.0.1:4000/auth/login
```

#### Headers
```
Content-Type: application/json
```

#### Request Body
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Request Schema
| Champ | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| email | string | Oui | Email valide | Adresse email de l'utilisateur |
| password | string | Oui | Min 5 caracteres | Mot de passe de l'utilisateur |

#### Response Success (200 OK)
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI5ZjE2YTMyZC00YjJhLTRhYzMtOGU3Yi0xMjM0NTY3ODkwYWIiLCJzZXNzaW9uSWQiOiJhYmNkZWYxMi0zNDU2LTc4OTAtYWJjZC0xMjM0NTY3ODkwYWIiLCJpYXQiOjE3MDI1NjI0MDAsImV4cCI6MTcwMjU2NjAwMH0.abc123",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZXNzaW9uSWQiOiJhYmNkZWYxMi0zNDU2LTc4OTAtYWJjZC0xMjM0NTY3ODkwYWIiLCJpYXQiOjE3MDI1NjI0MDAsImV4cCI6MTcwMzE2NzIwMH0.def456",
  "sessionToken": "abcdef12-3456-7890-abcd-1234567890ab",
  "expiresIn": 3600,
  "user": {
    "id": "9f16a32d-4b2a-4ac3-8e7b-1234567890ab",
    "email": "user@example.com"
  }
}
```

#### Response Schema
| Champ | Type | Description |
|-------|------|-------------|
| accessToken | string | JWT token pour authentification (expire 1h) |
| refreshToken | string | Token pour renouveler l'accessToken (expire 7j) |
| sessionToken | string | Identifiant unique de la session |
| expiresIn | number | Duree de vie de l'accessToken en secondes (3600 = 1h) |
| user | object | Informations de l'utilisateur connecte |
| user.id | string | UUID de l'utilisateur |
| user.email | string | Email de l'utilisateur |

#### Response Error (401 Unauthorized)
```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

#### Response Error (400 Bad Request)
```json
{
  "statusCode": 400,
  "message": [
    "Email must be a valid email address",
    "Password must be at least 5 characters long"
  ],
  "error": "Bad Request"
}
```

#### Response Error (423 Locked)
```json
{
  "statusCode": 423,
  "message": "Account is locked due to too many failed login attempts",
  "error": "Locked"
}
```

#### Response Error (500 Internal Server Error)
```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error"
}
```

#### Status Codes
| Code | Signification | Description |
|------|---------------|-------------|
| 200 | OK | Authentification reussie |
| 400 | Bad Request | Donnees invalides |
| 401 | Unauthorized | Identifiants incorrects |
| 423 | Locked | Compte verrouille (trop de tentatives) |
| 500 | Internal Server Error | Erreur serveur |

#### Exemple cURL
```bash
curl -X POST http://127.0.0.1:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

#### Exemple JavaScript (Fetch)
```javascript
const response = await fetch('http://127.0.0.1:4000/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

const data = await response.json();

if (response.ok) {
  // Stocker les tokens
  localStorage.setItem('accessToken', data.accessToken);
  localStorage.setItem('refreshToken', data.refreshToken);
  localStorage.setItem('sessionToken', data.sessionToken);
  console.log('Logged in:', data.user);
} else {
  console.error('Login failed:', data.message);
}
```

#### Exemple JavaScript (Axios)
```javascript
import axios from 'axios';

try {
  const response = await axios.post('http://127.0.0.1:4000/auth/login', {
    email: 'user@example.com',
    password: 'password123'
  });

  const { accessToken, refreshToken, sessionToken, user } = response.data;

  // Stocker les tokens
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
  localStorage.setItem('sessionToken', sessionToken);

  console.log('User logged in:', user);
} catch (error) {
  if (error.response) {
    console.error('Login error:', error.response.data.message);
  }
}
```

#### Exemple Python (requests)
```python
import requests
import json

url = "http://127.0.0.1:4000/auth/login"
headers = {
    "Content-Type": "application/json"
}
data = {
    "email": "user@example.com",
    "password": "password123"
}

response = requests.post(url, headers=headers, json=data)

if response.status_code == 200:
    result = response.json()
    access_token = result['accessToken']
    refresh_token = result['refreshToken']
    session_token = result['sessionToken']
    user = result['user']
    print(f"Logged in: {user['email']}")
    print(f"Access token: {access_token}")
else:
    print(f"Error {response.status_code}: {response.json()['message']}")
```

#### Exemple Flutter (Dart)
```dart
import 'package:http/http.dart' as http;
import 'dart:convert';

Future<Map<String, dynamic>> login(String email, String password) async {
  final url = Uri.parse('http://127.0.0.1:4000/auth/login');

  final response = await http.post(
    url,
    headers: {'Content-Type': 'application/json'},
    body: json.encode({
      'email': email,
      'password': password,
    }),
  );

  if (response.statusCode == 200) {
    final data = json.decode(response.body);
    // Stocker les tokens localement
    await storage.write(key: 'accessToken', value: data['accessToken']);
    await storage.write(key: 'refreshToken', value: data['refreshToken']);
    await storage.write(key: 'sessionToken', value: data['sessionToken']);
    return data;
  } else {
    final error = json.decode(response.body);
    throw Exception(error['message']);
  }
}
```

#### Notes importantes
- Le token d'acces expire apres 1 heure
- Le refresh token expire apres 7 jours
- Apres 5 tentatives de connexion echouees, le compte est verrouille temporairement
- Utiliser le refresh token pour obtenir un nouveau access token sans redemander le mot de passe
- Stocker les tokens de maniere securisee (httpOnly cookies en production)

#### Workflow typique
1. Client envoie email + password
2. Serveur verifie les identifiants
3. Serveur genere accessToken + refreshToken + sessionToken
4. Client stocke les tokens
5. Client utilise accessToken dans header Authorization pour les requetes suivantes
6. Quand accessToken expire, client utilise refreshToken pour en obtenir un nouveau

---

### 2.2 Refresh Token

#### Description
Renouvelle l'access token en utilisant le refresh token. Permet de maintenir la session utilisateur sans redemander les identifiants.

#### Endpoint Direct (Auth Service)
```
POST http://127.0.0.1:4001/auth/refresh
```

#### Endpoint via Gateway
```
POST http://127.0.0.1:4000/auth/refresh
```

#### Headers
```
Content-Type: application/json
```

#### Request Body
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Request Schema
| Champ | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| refreshToken | string | Oui | JWT valide | Token de rafraichissement obtenu lors du login |

#### Response Success (200 OK)
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.newtoken...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.newrefresh...",
  "sessionToken": "abcdef12-3456-7890-abcd-1234567890ab",
  "expiresIn": 3600,
  "user": {
    "id": "9f16a32d-4b2a-4ac3-8e7b-1234567890ab",
    "email": "user@example.com"
  }
}
```

#### Response Schema
| Champ | Type | Description |
|-------|------|-------------|
| accessToken | string | Nouveau JWT token pour authentification (expire 1h) |
| refreshToken | string | Nouveau refresh token (expire 7j) |
| sessionToken | string | Identifiant de session |
| expiresIn | number | Duree de vie en secondes (3600) |
| user | object | Informations utilisateur |
| user.id | string | UUID utilisateur |
| user.email | string | Email utilisateur |

#### Response Error (401 Unauthorized)
```json
{
  "statusCode": 401,
  "message": "Invalid refresh token",
  "error": "Unauthorized"
}
```

#### Response Error (400 Bad Request)
```json
{
  "statusCode": 400,
  "message": "Refresh token is required",
  "error": "Bad Request"
}
```

#### Status Codes
| Code | Signification | Description |
|------|---------------|-------------|
| 200 | OK | Token rafraichi avec succes |
| 400 | Bad Request | Refresh token manquant |
| 401 | Unauthorized | Refresh token invalide ou expire |
| 500 | Internal Server Error | Erreur serveur |

#### Exemple cURL
```bash
curl -X POST http://127.0.0.1:4000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

#### Exemple JavaScript (Fetch)
```javascript
const refreshToken = localStorage.getItem('refreshToken');

const response = await fetch('http://127.0.0.1:4000/auth/refresh', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ refreshToken })
});

const data = await response.json();

if (response.ok) {
  localStorage.setItem('accessToken', data.accessToken);
  localStorage.setItem('refreshToken', data.refreshToken);
  console.log('Token refreshed successfully');
} else {
  console.error('Refresh failed, redirect to login');
  window.location.href = '/login';
}
```

#### Exemple JavaScript (Axios)
```javascript
import axios from 'axios';

try {
  const refreshToken = localStorage.getItem('refreshToken');

  const response = await axios.post('http://127.0.0.1:4000/auth/refresh', {
    refreshToken
  });

  const { accessToken, refreshToken: newRefreshToken } = response.data;

  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', newRefreshToken);

  console.log('Token refreshed');
} catch (error) {
  console.error('Refresh failed:', error.response?.data.message);
  // Redirect to login
  window.location.href = '/login';
}
```

#### Exemple Python (requests)
```python
import requests

url = "http://127.0.0.1:4000/auth/refresh"
refresh_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

response = requests.post(url, json={"refreshToken": refresh_token})

if response.status_code == 200:
    result = response.json()
    new_access_token = result['accessToken']
    new_refresh_token = result['refreshToken']
    print("Token refreshed successfully")
else:
    print("Refresh failed, please login again")
```

#### Exemple Flutter (Dart)
```dart
import 'package:http/http.dart' as http;
import 'dart:convert';

Future<Map<String, dynamic>> refreshToken(String refreshToken) async {
  final url = Uri.parse('http://127.0.0.1:4000/auth/refresh');

  final response = await http.post(
    url,
    headers: {'Content-Type': 'application/json'},
    body: json.encode({'refreshToken': refreshToken}),
  );

  if (response.statusCode == 200) {
    final data = json.decode(response.body);
    await storage.write(key: 'accessToken', value: data['accessToken']);
    await storage.write(key: 'refreshToken', value: data['refreshToken']);
    return data;
  } else {
    throw Exception('Refresh failed, please login again');
  }
}
```

#### Notes importantes
- Le refresh token est a usage unique (rotation)
- Un nouveau refresh token est genere a chaque appel
- Si le refresh token expire, l'utilisateur doit se reconnecter
- Implementer un intercepteur pour rafraichir automatiquement lors d'une erreur 401

---

### 2.3 Logout

#### Description
Deconnecte l'utilisateur et invalide la session active. Le refresh token associe devient inutilisable.

#### Endpoint Direct (Auth Service)
```
POST http://127.0.0.1:4001/auth/logout
```

#### Endpoint via Gateway
```
POST http://127.0.0.1:4000/auth/logout
```

#### Headers
```
Content-Type: application/json
Authorization: Bearer <accessToken>
```

#### Request Body
Aucun body requis.

#### Request Schema
Aucun parametre requis. Le sessionId est extrait du JWT accessToken.

#### Response Success (200 OK)
```json
{
  "message": "Logged out successfully"
}
```

#### Response Schema
| Champ | Type | Description |
|-------|------|-------------|
| message | string | Message de confirmation |

#### Response Error (401 Unauthorized)
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

#### Response Error (400 Bad Request)
```json
{
  "statusCode": 400,
  "message": "Session ID not found in token",
  "error": "Bad Request"
}
```

#### Status Codes
| Code | Signification | Description |
|------|---------------|-------------|
| 200 | OK | Deconnexion reussie |
| 400 | Bad Request | Session ID manquant dans le token |
| 401 | Unauthorized | Token manquant ou invalide |
| 500 | Internal Server Error | Erreur serveur |

#### Exemple cURL
```bash
curl -X POST http://127.0.0.1:4000/auth/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### Exemple JavaScript (Fetch)
```javascript
const accessToken = localStorage.getItem('accessToken');

const response = await fetch('http://127.0.0.1:4000/auth/logout', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

const data = await response.json();

if (response.ok) {
  // Nettoyer les tokens locaux
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('sessionToken');
  console.log('Logged out successfully');
  window.location.href = '/login';
} else {
  console.error('Logout failed:', data.message);
}
```

#### Exemple JavaScript (Axios)
```javascript
import axios from 'axios';

try {
  const accessToken = localStorage.getItem('accessToken');

  await axios.post('http://127.0.0.1:4000/auth/logout', {}, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  // Nettoyer les tokens
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('sessionToken');

  console.log('Logged out');
  window.location.href = '/login';
} catch (error) {
  console.error('Logout error:', error.response?.data.message);
}
```

#### Exemple Python (requests)
```python
import requests

url = "http://127.0.0.1:4000/auth/logout"
access_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

headers = {
    "Authorization": f"Bearer {access_token}"
}

response = requests.post(url, headers=headers)

if response.status_code == 200:
    print("Logged out successfully")
else:
    print(f"Logout failed: {response.json()['message']}")
```

#### Exemple Flutter (Dart)
```dart
import 'package:http/http.dart' as http;
import 'dart:convert';

Future<void> logout() async {
  final url = Uri.parse('http://127.0.0.1:4000/auth/logout');
  final accessToken = await storage.read(key: 'accessToken');

  final response = await http.post(
    url,
    headers: {
      'Authorization': 'Bearer $accessToken'
    },
  );

  if (response.statusCode == 200) {
    // Nettoyer les tokens
    await storage.delete(key: 'accessToken');
    await storage.delete(key: 'refreshToken');
    await storage.delete(key: 'sessionToken');
    print('Logged out successfully');
  } else {
    throw Exception('Logout failed');
  }
}
```

#### Notes importantes
- La deconnexion invalide la session cote serveur
- Toujours nettoyer les tokens cote client apres deconnexion
- Le refresh token associe ne peut plus etre utilise
- Les autres sessions de l'utilisateur restent actives

---

### 2.4 Change Password

#### Description
Permet a un utilisateur authentifie de changer son mot de passe. Requiert l'ancien mot de passe et un nouveau mot de passe conforme aux regles de securite.

#### Endpoint Direct (Auth Service)
```
PATCH http://127.0.0.1:4001/auth/change-password
```

#### Endpoint via Gateway
```
PATCH http://127.0.0.1:4000/auth/change-password
```

#### Headers
```
Content-Type: application/json
Authorization: Bearer <accessToken>
```

#### Request Body
```json
{
  "oldPassword": "password123",
  "newPassword": "NewP@ssw0rd2024"
}
```

#### Request Schema
| Champ | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| oldPassword | string | Oui | - | Mot de passe actuel |
| newPassword | string | Oui | Min 8 chars, 1 majuscule, 1 minuscule, 1 chiffre, 1 special | Nouveau mot de passe |

#### Response Success (200 OK)
```json
{
  "message": "Password changed successfully"
}
```

#### Response Schema
| Champ | Type | Description |
|-------|------|-------------|
| message | string | Message de confirmation |

#### Response Error (401 Unauthorized)
```json
{
  "statusCode": 401,
  "message": "Old password is incorrect",
  "error": "Unauthorized"
}
```

#### Response Error (400 Bad Request)
```json
{
  "statusCode": 400,
  "message": [
    "New password must be at least 8 characters long",
    "New password must contain at least one uppercase letter, one lowercase letter, one number and one special character"
  ],
  "error": "Bad Request"
}
```

#### Status Codes
| Code | Signification | Description |
|------|---------------|-------------|
| 200 | OK | Mot de passe change avec succes |
| 400 | Bad Request | Validation echouee |
| 401 | Unauthorized | Ancien mot de passe incorrect ou token invalide |
| 500 | Internal Server Error | Erreur serveur |

#### Exemple cURL
```bash
curl -X PATCH http://127.0.0.1:4000/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "oldPassword": "password123",
    "newPassword": "NewP@ssw0rd2024"
  }'
```

#### Exemple JavaScript (Fetch)
```javascript
const accessToken = localStorage.getItem('accessToken');

const response = await fetch('http://127.0.0.1:4000/auth/change-password', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify({
    oldPassword: 'password123',
    newPassword: 'NewP@ssw0rd2024'
  })
});

const data = await response.json();

if (response.ok) {
  console.log('Password changed successfully');
  alert(data.message);
} else {
  console.error('Change password failed:', data.message);
}
```

#### Exemple JavaScript (Axios)
```javascript
import axios from 'axios';

try {
  const accessToken = localStorage.getItem('accessToken');

  const response = await axios.patch('http://127.0.0.1:4000/auth/change-password', {
    oldPassword: 'password123',
    newPassword: 'NewP@ssw0rd2024'
  }, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  console.log('Password changed:', response.data.message);
} catch (error) {
  if (error.response) {
    console.error('Error:', error.response.data.message);
  }
}
```

#### Exemple Python (requests)
```python
import requests

url = "http://127.0.0.1:4000/auth/change-password"
access_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {access_token}"
}

data = {
    "oldPassword": "password123",
    "newPassword": "NewP@ssw0rd2024"
}

response = requests.patch(url, headers=headers, json=data)

if response.status_code == 200:
    print("Password changed successfully")
else:
    print(f"Error: {response.json()['message']}")
```

#### Exemple Flutter (Dart)
```dart
import 'package:http/http.dart' as http;
import 'dart:convert';

Future<void> changePassword(String oldPassword, String newPassword) async {
  final url = Uri.parse('http://127.0.0.1:4000/auth/change-password');
  final accessToken = await storage.read(key: 'accessToken');

  final response = await http.patch(
    url,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $accessToken'
    },
    body: json.encode({
      'oldPassword': oldPassword,
      'newPassword': newPassword,
    }),
  );

  if (response.statusCode == 200) {
    print('Password changed successfully');
  } else {
    final error = json.decode(response.body);
    throw Exception(error['message']);
  }
}
```

#### Notes importantes
- Le nouveau mot de passe doit contenir au moins 8 caracteres
- Doit inclure au moins: 1 majuscule, 1 minuscule, 1 chiffre, 1 caractere special (@$!%*?&)
- L'ancien mot de passe est verifie avant d'accepter le changement
- Apres changement, tous les tokens restent valides (pas de deconnexion automatique)

#### Regles de validation du mot de passe
- Minimum 8 caracteres
- Au moins une lettre majuscule (A-Z)
- Au moins une lettre minuscule (a-z)
- Au moins un chiffre (0-9)
- Au moins un caractere special (@$!%*?&)

---

### 2.5 Verify Email

#### Description
Verifie l'adresse email d'un utilisateur en utilisant un code de verification a 6 caracteres envoye par email.

#### Endpoint Direct (Auth Service)
```
POST http://127.0.0.1:4001/auth/verify-email
```

#### Endpoint via Gateway
```
POST http://127.0.0.1:4000/auth/verify-email
```

#### Headers
```
Content-Type: application/json
```

#### Request Body
```json
{
  "email": "user@example.com",
  "code": "ABC123"
}
```

#### Request Schema
| Champ | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| email | string | Oui | Email valide | Adresse email a verifier |
| code | string | Oui | 6 caracteres alphanumeriques majuscules | Code de verification |

#### Response Success (200 OK)
```json
{
  "message": "Email verified successfully"
}
```

#### Response Schema
| Champ | Type | Description |
|-------|------|-------------|
| message | string | Message de confirmation |

#### Response Error (400 Bad Request)
```json
{
  "statusCode": 400,
  "message": [
    "Code must be exactly 6 characters",
    "Code must contain only uppercase letters and numbers"
  ],
  "error": "Bad Request"
}
```

#### Response Error (401 Unauthorized)
```json
{
  "statusCode": 401,
  "message": "Invalid or expired verification code",
  "error": "Unauthorized"
}
```

#### Status Codes
| Code | Signification | Description |
|------|---------------|-------------|
| 200 | OK | Email verifie avec succes |
| 400 | Bad Request | Format de code invalide |
| 401 | Unauthorized | Code invalide ou expire |
| 404 | Not Found | Utilisateur non trouve |
| 500 | Internal Server Error | Erreur serveur |

#### Exemple cURL
```bash
curl -X POST http://127.0.0.1:4000/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "code": "ABC123"
  }'
```

#### Exemple JavaScript (Fetch)
```javascript
const response = await fetch('http://127.0.0.1:4000/auth/verify-email', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    code: 'ABC123'
  })
});

const data = await response.json();

if (response.ok) {
  console.log('Email verified successfully');
  alert('Your email has been verified!');
} else {
  console.error('Verification failed:', data.message);
}
```

#### Exemple JavaScript (Axios)
```javascript
import axios from 'axios';

try {
  const response = await axios.post('http://127.0.0.1:4000/auth/verify-email', {
    email: 'user@example.com',
    code: 'ABC123'
  });

  console.log('Email verified:', response.data.message);
} catch (error) {
  console.error('Verification error:', error.response?.data.message);
}
```

#### Exemple Python (requests)
```python
import requests

url = "http://127.0.0.1:4000/auth/verify-email"

data = {
    "email": "user@example.com",
    "code": "ABC123"
}

response = requests.post(url, json=data)

if response.status_code == 200:
    print("Email verified successfully")
else:
    print(f"Error: {response.json()['message']}")
```

#### Exemple Flutter (Dart)
```dart
import 'package:http/http.dart' as http;
import 'dart:convert';

Future<void> verifyEmail(String email, String code) async {
  final url = Uri.parse('http://127.0.0.1:4000/auth/verify-email');

  final response = await http.post(
    url,
    headers: {'Content-Type': 'application/json'},
    body: json.encode({
      'email': email,
      'code': code,
    }),
  );

  if (response.statusCode == 200) {
    print('Email verified successfully');
  } else {
    final error = json.decode(response.body);
    throw Exception(error['message']);
  }
}
```

#### Notes importantes
- Le code de verification expire apres 24 heures
- Le code est compose de 6 caracteres alphanumeriques majuscules (A-Z, 0-9)
- Le code est envoye par email lors de la creation du compte
- Apres verification, le statut de l'utilisateur passe a ACTIVE si PENDING_EMAIL_VERIFICATION

---

### 2.6 Verify Email by Link

#### Description
Verifie l'adresse email d'un utilisateur via un lien cliquable contenant le code de verification. Affiche une page HTML de succes ou d'erreur.

#### Endpoint Direct (Auth Service)
```
GET http://127.0.0.1:4001/auth/verify-email?code=ABC123
```

#### Endpoint via Gateway
```
GET http://127.0.0.1:4000/auth/verify-email?code=ABC123
```

#### Headers
Aucun header requis.

#### Query Parameters
| Parametre | Type | Required | Description |
|-----------|------|----------|-------------|
| code | string | Oui | Code de verification a 6 caracteres |

#### Response Success (200 OK)
Retourne une page HTML affichant:
- Icone de succes
- Message de confirmation
- Email verifie
- Lien vers la page de connexion

```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8" />
    <title>Email Verifie - IMMO360</title>
</head>
<body>
    <div class="container">
        <div class="icon">✓</div>
        <h1>Email Verifie !</h1>
        <p>Votre adresse email a ete verifiee avec succes.</p>
        <a href="http://localhost:3000/auth/login">Se connecter a IMMO360</a>
    </div>
</body>
</html>
```

#### Response Error (400 Bad Request)
Retourne une page HTML d'erreur affichant:
- Icone d'erreur
- Message d'erreur
- Raison de l'echec
- Lien vers la page de connexion

#### Status Codes
| Code | Signification | Description |
|------|---------------|-------------|
| 200 | OK | Email verifie avec succes |
| 400 | Bad Request | Code manquant ou invalide |

#### Exemple cURL
```bash
curl -X GET "http://127.0.0.1:4000/auth/verify-email?code=ABC123"
```

#### Exemple JavaScript (Fetch)
```javascript
const verificationCode = 'ABC123';
const url = `http://127.0.0.1:4000/auth/verify-email?code=${verificationCode}`;

// Rediriger l'utilisateur vers le lien de verification
window.location.href = url;
```

#### Exemple Python (requests)
```python
import requests

code = "ABC123"
url = f"http://127.0.0.1:4000/auth/verify-email?code={code}"

response = requests.get(url)

if response.status_code == 200:
    print("Email verified successfully")
    # response.text contient la page HTML
else:
    print("Verification failed")
```

#### Exemple Flutter (Dart)
```dart
import 'package:url_launcher/url_launcher.dart';

Future<void> openVerificationLink(String code) async {
  final url = Uri.parse('http://127.0.0.1:4000/auth/verify-email?code=$code');

  if (await canLaunchUrl(url)) {
    await launchUrl(url);
  } else {
    throw Exception('Could not launch verification link');
  }
}
```

#### Notes importantes
- Utilise generalement dans les emails envoyes aux utilisateurs
- Affiche une page HTML stylisee (pas de JSON)
- Redirige vers le frontend apres succes
- L'URL du frontend est configurable via la variable d'environnement FRONTEND_URL

---

### 2.7 Get Profile

#### Description
Recupere les informations du profil de l'utilisateur actuellement connecte.

#### Endpoint Direct (Auth Service)
```
GET http://127.0.0.1:4001/auth/profile
```

#### Endpoint via Gateway
```
GET http://127.0.0.1:4000/auth/profile
```

#### Headers
```
Authorization: Bearer <accessToken>
```

#### Request Body
Aucun body requis.

#### Response Success (200 OK)
```json
{
  "id": "9f16a32d-4b2a-4ac3-8e7b-1234567890ab",
  "email": "user@example.com",
  "status": "ACTIVE",
  "emailVerified": true,
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

#### Response Schema
| Champ | Type | Description |
|-------|------|-------------|
| id | string | UUID de l'utilisateur |
| email | string | Adresse email |
| status | string | Statut du compte (ACTIVE, INACTIVE, LOCKED, PENDING_EMAIL_VERIFICATION) |
| emailVerified | boolean | Email verifie ou non |
| createdAt | string | Date de creation du compte (ISO 8601) |

#### Response Error (401 Unauthorized)
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

#### Response Error (404 Not Found)
```json
{
  "statusCode": 404,
  "message": "User not found",
  "error": "Not Found"
}
```

#### Status Codes
| Code | Signification | Description |
|------|---------------|-------------|
| 200 | OK | Profil recupere avec succes |
| 401 | Unauthorized | Token manquant ou invalide |
| 404 | Not Found | Utilisateur non trouve |
| 500 | Internal Server Error | Erreur serveur |

#### Exemple cURL
```bash
curl -X GET http://127.0.0.1:4000/auth/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### Exemple JavaScript (Fetch)
```javascript
const accessToken = localStorage.getItem('accessToken');

const response = await fetch('http://127.0.0.1:4000/auth/profile', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

const profile = await response.json();

if (response.ok) {
  console.log('User profile:', profile);
} else {
  console.error('Failed to fetch profile:', profile.message);
}
```

#### Exemple JavaScript (Axios)
```javascript
import axios from 'axios';

try {
  const accessToken = localStorage.getItem('accessToken');

  const response = await axios.get('http://127.0.0.1:4000/auth/profile', {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  console.log('Profile:', response.data);
} catch (error) {
  console.error('Error:', error.response?.data.message);
}
```

#### Exemple Python (requests)
```python
import requests

url = "http://127.0.0.1:4000/auth/profile"
access_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

headers = {
    "Authorization": f"Bearer {access_token}"
}

response = requests.get(url, headers=headers)

if response.status_code == 200:
    profile = response.json()
    print(f"User: {profile['email']}")
    print(f"Status: {profile['status']}")
else:
    print(f"Error: {response.json()['message']}")
```

#### Exemple Flutter (Dart)
```dart
import 'package:http/http.dart' as http;
import 'dart:convert';

Future<Map<String, dynamic>> getProfile() async {
  final url = Uri.parse('http://127.0.0.1:4000/auth/profile');
  final accessToken = await storage.read(key: 'accessToken');

  final response = await http.get(
    url,
    headers: {
      'Authorization': 'Bearer $accessToken'
    },
  );

  if (response.statusCode == 200) {
    return json.decode(response.body);
  } else {
    throw Exception('Failed to fetch profile');
  }
}
```

#### Notes importantes
- Retourne uniquement les informations basiques du profil d'authentification
- Pour obtenir le profil complet (firstName, lastName, role, etc.), appeler GET /users/:id
- Le userId est extrait du JWT accessToken

---

### 2.8 Google Login

#### Description
Authentifie un utilisateur via Google OAuth. Accepte un ID token Google et cree ou connecte l'utilisateur.

#### Endpoint Direct (Auth Service)
```
POST http://127.0.0.1:4001/auth/google-login
```

#### Endpoint via Gateway
```
POST http://127.0.0.1:4000/auth/google-login
```

#### Headers
```
Content-Type: application/json
```

#### Request Body
```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjE5ZmUyYTdiY..."
}
```

#### Request Schema
| Champ | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| idToken | string | Oui | JWT Google valide | ID token obtenu de Google OAuth |

#### Response Success (200 OK)
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "sessionToken": "abcdef12-3456-7890-abcd-1234567890ab",
  "expiresIn": 3600,
  "user": {
    "id": "9f16a32d-4b2a-4ac3-8e7b-1234567890ab",
    "email": "user@gmail.com"
  }
}
```

#### Response Schema
| Champ | Type | Description |
|-------|------|-------------|
| accessToken | string | JWT token pour authentification (expire 1h) |
| refreshToken | string | Token pour renouveler l'accessToken (expire 7j) |
| sessionToken | string | Identifiant unique de la session |
| expiresIn | number | Duree de vie de l'accessToken en secondes |
| user | object | Informations de l'utilisateur |
| user.id | string | UUID de l'utilisateur |
| user.email | string | Email Google |

#### Response Error (401 Unauthorized)
```json
{
  "statusCode": 401,
  "message": "Invalid Google token",
  "error": "Unauthorized"
}
```

#### Response Error (400 Bad Request)
```json
{
  "statusCode": 400,
  "message": "ID token is required",
  "error": "Bad Request"
}
```

#### Status Codes
| Code | Signification | Description |
|------|---------------|-------------|
| 200 | OK | Authentification Google reussie |
| 400 | Bad Request | ID token manquant |
| 401 | Unauthorized | ID token invalide |
| 500 | Internal Server Error | Erreur serveur |

#### Exemple cURL
```bash
curl -X POST http://127.0.0.1:4000/auth/google-login \
  -H "Content-Type: application/json" \
  -d '{
    "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjE5ZmUyYTdiY..."
  }'
```

#### Exemple JavaScript (Fetch)
```javascript
// Supposant que vous avez obtenu l'ID token de Google
const googleIdToken = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjE5ZmUyYTdiY...';

const response = await fetch('http://127.0.0.1:4000/auth/google-login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    idToken: googleIdToken
  })
});

const data = await response.json();

if (response.ok) {
  localStorage.setItem('accessToken', data.accessToken);
  localStorage.setItem('refreshToken', data.refreshToken);
  console.log('Logged in with Google:', data.user);
} else {
  console.error('Google login failed:', data.message);
}
```

#### Exemple JavaScript (Axios)
```javascript
import axios from 'axios';

try {
  const googleIdToken = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjE5ZmUyYTdiY...';

  const response = await axios.post('http://127.0.0.1:4000/auth/google-login', {
    idToken: googleIdToken
  });

  const { accessToken, refreshToken, user } = response.data;

  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);

  console.log('Google login success:', user);
} catch (error) {
  console.error('Error:', error.response?.data.message);
}
```

#### Exemple Python (requests)
```python
import requests

url = "http://127.0.0.1:4000/auth/google-login"
google_id_token = "eyJhbGciOiJSUzI1NiIsImtpZCI6IjE5ZmUyYTdiY..."

data = {
    "idToken": google_id_token
}

response = requests.post(url, json=data)

if response.status_code == 200:
    result = response.json()
    print(f"Logged in with Google: {result['user']['email']}")
else:
    print(f"Error: {response.json()['message']}")
```

#### Exemple Flutter (Dart)
```dart
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:google_sign_in/google_sign_in.dart';

Future<Map<String, dynamic>> loginWithGoogle() async {
  // Obtenir le token Google
  final GoogleSignIn googleSignIn = GoogleSignIn();
  final GoogleSignInAccount? account = await googleSignIn.signIn();
  final GoogleSignInAuthentication auth = await account!.authentication;

  final url = Uri.parse('http://127.0.0.1:4000/auth/google-login');

  final response = await http.post(
    url,
    headers: {'Content-Type': 'application/json'},
    body: json.encode({
      'idToken': auth.idToken,
    }),
  );

  if (response.statusCode == 200) {
    final data = json.decode(response.body);
    await storage.write(key: 'accessToken', value: data['accessToken']);
    await storage.write(key: 'refreshToken', value: data['refreshToken']);
    return data;
  } else {
    throw Exception('Google login failed');
  }
}
```

#### Notes importantes
- L'ID token Google doit etre obtenu cote client via Google Sign-In
- Si le compte Google n'existe pas, un nouvel utilisateur est cree automatiquement
- L'email est automatiquement verifie pour les comptes Google
- Le mot de passe n'est pas requis pour les utilisateurs Google

---

### 2.9 Health Check

#### Description
Verifie l'etat de sante du service d'authentification et de la connexion a la base de donnees.

#### Endpoint Direct (Auth Service)
```
GET http://127.0.0.1:4001/auth/health
```

#### Endpoint via Gateway
```
GET http://127.0.0.1:4000/auth/health
```

#### Headers
Aucun header requis.

#### Response Success (200 OK)
```json
{
  "status": "ok",
  "timestamp": "2024-12-14T10:30:00.000Z",
  "service": "auth-service",
  "database": "connected"
}
```

#### Response Schema
| Champ | Type | Description |
|-------|------|-------------|
| status | string | Statut du service (ok/error) |
| timestamp | string | Date et heure de la verification (ISO 8601) |
| service | string | Nom du service |
| database | string | Statut de la base de donnees (connected/disconnected) |

#### Response Error (503 Service Unavailable)
```json
{
  "status": "error",
  "timestamp": "2024-12-14T10:30:00.000Z",
  "service": "auth-service",
  "database": "disconnected"
}
```

#### Status Codes
| Code | Signification | Description |
|------|---------------|-------------|
| 200 | OK | Service operationnel |
| 503 | Service Unavailable | Service ou base de donnees indisponible |

#### Exemple cURL
```bash
curl -X GET http://127.0.0.1:4000/auth/health
```

#### Exemple JavaScript (Fetch)
```javascript
const response = await fetch('http://127.0.0.1:4000/auth/health');
const health = await response.json();

if (response.ok && health.status === 'ok') {
  console.log('Auth service is healthy');
} else {
  console.error('Auth service is down');
}
```

#### Exemple JavaScript (Axios)
```javascript
import axios from 'axios';

try {
  const response = await axios.get('http://127.0.0.1:4000/auth/health');

  if (response.data.status === 'ok') {
    console.log('Service healthy:', response.data);
  }
} catch (error) {
  console.error('Service unhealthy');
}
```

#### Exemple Python (requests)
```python
import requests

url = "http://127.0.0.1:4000/auth/health"

response = requests.get(url)

if response.status_code == 200:
    health = response.json()
    print(f"Status: {health['status']}")
    print(f"Database: {health['database']}")
else:
    print("Service unavailable")
```

#### Exemple Flutter (Dart)
```dart
import 'package:http/http.dart' as http;
import 'dart:convert';

Future<bool> checkHealth() async {
  final url = Uri.parse('http://127.0.0.1:4000/auth/health');

  final response = await http.get(url);

  if (response.statusCode == 200) {
    final data = json.decode(response.body);
    return data['status'] == 'ok';
  }

  return false;
}
```

#### Notes importantes
- Endpoint public, ne necessite pas d'authentification
- Utilise pour les health checks de monitoring (Kubernetes, Docker, etc.)
- Verifie la connexion a la base de donnees PostgreSQL

---

## 3. GESTION DES UTILISATEURS (USER SERVICE)

### 3.1 Create User

#### Description
Cree un nouvel utilisateur dans le systeme. Genere automatiquement un mot de passe temporaire et envoie un email avec les identifiants. Necessite les permissions ADMINISTRATOR ou SUPERADMIN.

#### Endpoint Direct (User Service)
```
POST http://127.0.0.1:4002/users
```

#### Endpoint via Gateway
```
POST http://127.0.0.1:4000/users
```

#### Headers
```
Content-Type: application/json
Authorization: Bearer <accessToken>
```

#### Request Body
```json
{
  "email": "newuser@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "OCCUPANT",
  "roomNumber": "101",
  "roomId": "RDC-101",
  "academicSessionId": "2024-2025"
}
```

#### Request Schema
| Champ | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| email | string | Oui | Email valide | Adresse email de l'utilisateur |
| firstName | string | Oui | Min 2 caracteres | Prenom |
| lastName | string | Oui | Min 2 caracteres | Nom |
| role | string | Oui | SUPERADMIN, ADMINISTRATOR, SUPERVISOR, AGENT_TERRAIN, OCCUPANT | Role de l'utilisateur |
| roomNumber | string | Non | - | Numero de chambre (pour OCCUPANT) |
| roomId | string | Non | Format: XXX-NNN (ex: RDC-101) | ID de la chambre |
| academicSessionId | string | Non | Format: YYYY-YYYY (ex: 2024-2025) | Session academique |

#### Response Success (201 Created)
```json
{
  "message": "User created successfully",
  "user": {
    "id": "9f16a32d-4b2a-4ac3-8e7b-1234567890ab",
    "email": "newuser@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "fullName": "John Doe",
    "role": "OCCUPANT",
    "status": "ACTIVE",
    "emailVerified": false,
    "currentRoomId": "RDC-101",
    "currentAcademicSessionId": "2024-2025",
    "createdAt": "2024-12-14T10:30:00.000Z",
    "updatedAt": "2024-12-14T10:30:00.000Z"
  },
  "temporaryPassword": "TempP@ss2024"
}
```

#### Response Schema
| Champ | Type | Description |
|-------|------|-------------|
| message | string | Message de confirmation |
| user | object | Utilisateur cree |
| user.id | string | UUID de l'utilisateur |
| user.email | string | Email |
| user.firstName | string | Prenom |
| user.lastName | string | Nom |
| user.fullName | string | Nom complet (prenom + nom) |
| user.role | string | Role |
| user.status | string | Statut du compte |
| user.emailVerified | boolean | Email verifie (false par defaut) |
| user.currentRoomId | string | ID de la chambre assignee |
| user.currentAcademicSessionId | string | Session academique |
| user.createdAt | string | Date de creation (ISO 8601) |
| user.updatedAt | string | Date de modification (ISO 8601) |
| temporaryPassword | string | Mot de passe temporaire genere |

#### Response Error (400 Bad Request)
```json
{
  "statusCode": 400,
  "message": [
    "Invalid email format",
    "First name must be at least 2 characters",
    "Invalid role. Must be SUPERADMIN, ADMINISTRATOR, SUPERVISOR, AGENT_TERRAIN, or OCCUPANT"
  ],
  "error": "Bad Request"
}
```

#### Response Error (401 Unauthorized)
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

#### Response Error (403 Forbidden)
```json
{
  "statusCode": 403,
  "message": "Insufficient permissions to create user",
  "error": "Forbidden"
}
```

#### Response Error (409 Conflict)
```json
{
  "statusCode": 409,
  "message": "User with this email already exists",
  "error": "Conflict"
}
```

#### Status Codes
| Code | Signification | Description |
|------|---------------|-------------|
| 201 | Created | Utilisateur cree avec succes |
| 400 | Bad Request | Donnees invalides |
| 401 | Unauthorized | Token manquant ou invalide |
| 403 | Forbidden | Permissions insuffisantes |
| 409 | Conflict | Email deja utilise |
| 500 | Internal Server Error | Erreur serveur |

#### Exemple cURL
```bash
curl -X POST http://127.0.0.1:4000/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "email": "newuser@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "OCCUPANT",
    "roomId": "RDC-101",
    "academicSessionId": "2024-2025"
  }'
```

#### Exemple JavaScript (Fetch)
```javascript
const accessToken = localStorage.getItem('accessToken');

const response = await fetch('http://127.0.0.1:4000/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify({
    email: 'newuser@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'OCCUPANT',
    roomId: 'RDC-101',
    academicSessionId: '2024-2025'
  })
});

const data = await response.json();

if (response.ok) {
  console.log('User created:', data.user);
  console.log('Temporary password:', data.temporaryPassword);
  alert(`User created! Temporary password: ${data.temporaryPassword}`);
} else {
  console.error('Creation failed:', data.message);
}
```

#### Exemple JavaScript (Axios)
```javascript
import axios from 'axios';

try {
  const accessToken = localStorage.getItem('accessToken');

  const response = await axios.post('http://127.0.0.1:4000/users', {
    email: 'newuser@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'OCCUPANT',
    roomId: 'RDC-101',
    academicSessionId: '2024-2025'
  }, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  console.log('User created:', response.data.user);
  console.log('Temp password:', response.data.temporaryPassword);
} catch (error) {
  console.error('Error:', error.response?.data.message);
}
```

#### Exemple Python (requests)
```python
import requests

url = "http://127.0.0.1:4000/users"
access_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {access_token}"
}

data = {
    "email": "newuser@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "OCCUPANT",
    "roomId": "RDC-101",
    "academicSessionId": "2024-2025"
}

response = requests.post(url, headers=headers, json=data)

if response.status_code == 201:
    result = response.json()
    print(f"User created: {result['user']['email']}")
    print(f"Temporary password: {result['temporaryPassword']}")
else:
    print(f"Error: {response.json()['message']}")
```

#### Exemple Flutter (Dart)
```dart
import 'package:http/http.dart' as http;
import 'dart:convert';

Future<Map<String, dynamic>> createUser(Map<String, dynamic> userData) async {
  final url = Uri.parse('http://127.0.0.1:4000/users');
  final accessToken = await storage.read(key: 'accessToken');

  final response = await http.post(
    url,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $accessToken'
    },
    body: json.encode(userData),
  );

  if (response.statusCode == 201) {
    final data = json.decode(response.body);
    print('User created: ${data['user']['email']}');
    print('Temp password: ${data['temporaryPassword']}');
    return data;
  } else {
    final error = json.decode(response.body);
    throw Exception(error['message']);
  }
}

// Usage
void main() async {
  await createUser({
    'email': 'newuser@example.com',
    'firstName': 'John',
    'lastName': 'Doe',
    'role': 'OCCUPANT',
    'roomId': 'RDC-101',
    'academicSessionId': '2024-2025'
  });
}
```

#### Notes importantes
- Un mot de passe temporaire est genere automatiquement
- Un email est envoye avec le mot de passe temporaire et un lien de verification
- L'utilisateur doit verifier son email pour activer son compte
- Seuls les ADMINISTRATOR et SUPERADMIN peuvent creer des utilisateurs
- Un ADMINISTRATOR ne peut pas creer de SUPERADMIN
- Le format de roomId doit etre XXX-NNN (ex: RDC-101, ETAGE1-205)
- Le format de academicSessionId doit etre YYYY-YYYY (ex: 2024-2025)

#### Roles disponibles
- SUPERADMIN: Acces complet au systeme
- ADMINISTRATOR: Gestion des utilisateurs et parametres
- SUPERVISOR: Supervision des operations
- AGENT_TERRAIN: Agent de terrain
- OCCUPANT: Occupant d'une chambre

---

### 3.2 Get All Users

#### Description
Recupere la liste paginee de tous les utilisateurs avec possibilite de filtrage et recherche.

#### Endpoint Direct (User Service)
```
GET http://127.0.0.1:4002/users
```

#### Endpoint via Gateway
```
GET http://127.0.0.1:4000/users
```

#### Headers
```
Authorization: Bearer <accessToken>
```

#### Query Parameters
| Parametre | Type | Default | Validation | Description |
|-----------|------|---------|------------|-------------|
| page | number | 1 | Min 1 | Numero de page |
| limit | number | 10 | Min 1, Max 100 | Nombre d'elements par page |
| role | string | - | UserRole enum | Filtrer par role |
| status | string | - | UserStatus enum | Filtrer par statut |
| search | string | - | - | Recherche sur email, firstName, lastName, username |

#### Exemple URL
```
GET http://127.0.0.1:4000/users?page=1&limit=20&role=OCCUPANT&status=ACTIVE&search=john
```

#### Response Success (200 OK)
```json
{
  "data": [
    {
      "id": "9f16a32d-4b2a-4ac3-8e7b-1234567890ab",
      "email": "john.doe@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "fullName": "John Doe",
      "role": "OCCUPANT",
      "status": "ACTIVE",
      "username": null,
      "googleId": null,
      "profilePicture": null,
      "emailVerified": true,
      "currentRoomId": "RDC-101",
      "currentAcademicSessionId": "2024-2025",
      "lastLoginAt": "2024-12-14T09:00:00.000Z",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-12-14T09:00:00.000Z"
    }
  ],
  "total": 156,
  "page": 1,
  "limit": 20,
  "totalPages": 8
}
```

#### Response Schema
| Champ | Type | Description |
|-------|------|-------------|
| data | array | Liste des utilisateurs |
| data[].id | string | UUID utilisateur |
| data[].email | string | Email |
| data[].firstName | string | Prenom |
| data[].lastName | string | Nom |
| data[].fullName | string | Nom complet |
| data[].role | string | Role utilisateur |
| data[].status | string | Statut du compte |
| data[].username | string | Nom d'utilisateur (optionnel) |
| data[].googleId | string | ID Google (si connexion Google) |
| data[].profilePicture | string | URL photo de profil |
| data[].emailVerified | boolean | Email verifie |
| data[].currentRoomId | string | ID chambre actuelle |
| data[].currentAcademicSessionId | string | Session academique actuelle |
| data[].lastLoginAt | string | Derniere connexion (ISO 8601) |
| data[].createdAt | string | Date de creation (ISO 8601) |
| data[].updatedAt | string | Date de modification (ISO 8601) |
| total | number | Nombre total d'utilisateurs |
| page | number | Page actuelle |
| limit | number | Elements par page |
| totalPages | number | Nombre total de pages |

#### Response Error (401 Unauthorized)
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

#### Response Error (400 Bad Request)
```json
{
  "statusCode": 400,
  "message": [
    "Page must be at least 1",
    "Limit cannot exceed 100"
  ],
  "error": "Bad Request"
}
```

#### Status Codes
| Code | Signification | Description |
|------|---------------|-------------|
| 200 | OK | Liste recuperee avec succes |
| 400 | Bad Request | Parametres de pagination invalides |
| 401 | Unauthorized | Token manquant ou invalide |
| 500 | Internal Server Error | Erreur serveur |

#### Exemple cURL
```bash
curl -X GET "http://127.0.0.1:4000/users?page=1&limit=20&role=OCCUPANT" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### Exemple JavaScript (Fetch)
```javascript
const accessToken = localStorage.getItem('accessToken');

const params = new URLSearchParams({
  page: '1',
  limit: '20',
  role: 'OCCUPANT',
  status: 'ACTIVE',
  search: 'john'
});

const response = await fetch(`http://127.0.0.1:4000/users?${params}`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

const data = await response.json();

if (response.ok) {
  console.log(`Total users: ${data.total}`);
  console.log(`Page ${data.page} of ${data.totalPages}`);
  data.data.forEach(user => {
    console.log(`- ${user.fullName} (${user.email})`);
  });
} else {
  console.error('Failed to fetch users:', data.message);
}
```

#### Exemple JavaScript (Axios)
```javascript
import axios from 'axios';

try {
  const accessToken = localStorage.getItem('accessToken');

  const response = await axios.get('http://127.0.0.1:4000/users', {
    params: {
      page: 1,
      limit: 20,
      role: 'OCCUPANT',
      status: 'ACTIVE',
      search: 'john'
    },
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  const { data, total, page, totalPages } = response.data;

  console.log(`Found ${total} users, showing page ${page}/${totalPages}`);
  data.forEach(user => console.log(user.fullName));
} catch (error) {
  console.error('Error:', error.response?.data.message);
}
```

#### Exemple Python (requests)
```python
import requests

url = "http://127.0.0.1:4000/users"
access_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

headers = {
    "Authorization": f"Bearer {access_token}"
}

params = {
    "page": 1,
    "limit": 20,
    "role": "OCCUPANT",
    "status": "ACTIVE",
    "search": "john"
}

response = requests.get(url, headers=headers, params=params)

if response.status_code == 200:
    result = response.json()
    print(f"Total: {result['total']}")
    print(f"Page {result['page']}/{result['totalPages']}")
    for user in result['data']:
        print(f"- {user['fullName']} ({user['email']})")
else:
    print(f"Error: {response.json()['message']}")
```

#### Exemple Flutter (Dart)
```dart
import 'package:http/http.dart' as http;
import 'dart:convert';

Future<Map<String, dynamic>> getUsers({
  int page = 1,
  int limit = 20,
  String? role,
  String? status,
  String? search
}) async {
  final queryParams = {
    'page': page.toString(),
    'limit': limit.toString(),
    if (role != null) 'role': role,
    if (status != null) 'status': status,
    if (search != null) 'search': search,
  };

  final url = Uri.parse('http://127.0.0.1:4000/users')
      .replace(queryParameters: queryParams);
  final accessToken = await storage.read(key: 'accessToken');

  final response = await http.get(
    url,
    headers: {
      'Authorization': 'Bearer $accessToken'
    },
  );

  if (response.statusCode == 200) {
    return json.decode(response.body);
  } else {
    throw Exception('Failed to fetch users');
  }
}

// Usage
void main() async {
  final result = await getUsers(
    page: 1,
    limit: 20,
    role: 'OCCUPANT',
    search: 'john'
  );

  print('Total: ${result['total']}');
  print('Users: ${result['data'].length}');
}
```

#### Notes importantes
- Les resultats sont mis en cache par l'API Gateway (TTL: 5 minutes)
- La recherche est insensible a la casse
- La recherche s'applique sur: email, firstName, lastName, username
- Les filtres peuvent etre combines
- La limite maximale par page est 100

#### Filtres disponibles

**Roles:**
- SUPERADMIN
- ADMINISTRATOR
- SUPERVISOR
- AGENT_TERRAIN
- OCCUPANT

**Statuts:**
- ACTIVE
- INACTIVE
- LOCKED
- PENDING_EMAIL_VERIFICATION

---

### 3.3 Get User by ID

#### Description
Recupere les informations detaillees d'un utilisateur specifique par son ID.

#### Endpoint Direct (User Service)
```
GET http://127.0.0.1:4002/users/:id
```

#### Endpoint via Gateway
```
GET http://127.0.0.1:4000/users/:id
```

#### Headers
```
Authorization: Bearer <accessToken>
```

#### URL Parameters
| Parametre | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Oui | UUID de l'utilisateur |

#### Exemple URL
```
GET http://127.0.0.1:4000/users/9f16a32d-4b2a-4ac3-8e7b-1234567890ab
```

#### Response Success (200 OK)
```json
{
  "id": "9f16a32d-4b2a-4ac3-8e7b-1234567890ab",
  "email": "john.doe@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "fullName": "John Doe",
  "role": "OCCUPANT",
  "status": "ACTIVE",
  "username": "johndoe",
  "googleId": null,
  "profilePicture": null,
  "emailVerified": true,
  "currentRoomId": "RDC-101",
  "currentAcademicSessionId": "2024-2025",
  "lastLoginAt": "2024-12-14T09:00:00.000Z",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-12-14T09:00:00.000Z"
}
```

#### Response Schema
| Champ | Type | Description |
|-------|------|-------------|
| id | string | UUID de l'utilisateur |
| email | string | Adresse email |
| firstName | string | Prenom |
| lastName | string | Nom |
| fullName | string | Nom complet (prenom + nom) |
| role | string | Role de l'utilisateur |
| status | string | Statut du compte |
| username | string | Nom d'utilisateur (optionnel) |
| googleId | string | ID Google si connexion Google |
| profilePicture | string | URL de la photo de profil |
| emailVerified | boolean | Email verifie ou non |
| currentRoomId | string | ID de la chambre actuelle |
| currentAcademicSessionId | string | Session academique actuelle |
| lastLoginAt | string | Date de derniere connexion (ISO 8601) |
| createdAt | string | Date de creation (ISO 8601) |
| updatedAt | string | Date de modification (ISO 8601) |

#### Response Error (401 Unauthorized)
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

#### Response Error (404 Not Found)
```json
{
  "statusCode": 404,
  "message": "User not found",
  "error": "Not Found"
}
```

#### Response Error (400 Bad Request)
```json
{
  "statusCode": 400,
  "message": "Invalid UUID format",
  "error": "Bad Request"
}
```

#### Status Codes
| Code | Signification | Description |
|------|---------------|-------------|
| 200 | OK | Utilisateur recupere avec succes |
| 400 | Bad Request | Format UUID invalide |
| 401 | Unauthorized | Token manquant ou invalide |
| 404 | Not Found | Utilisateur non trouve |
| 500 | Internal Server Error | Erreur serveur |

#### Exemple cURL
```bash
curl -X GET http://127.0.0.1:4000/users/9f16a32d-4b2a-4ac3-8e7b-1234567890ab \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### Exemple JavaScript (Fetch)
```javascript
const accessToken = localStorage.getItem('accessToken');
const userId = '9f16a32d-4b2a-4ac3-8e7b-1234567890ab';

const response = await fetch(`http://127.0.0.1:4000/users/${userId}`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

const user = await response.json();

if (response.ok) {
  console.log('User:', user.fullName);
  console.log('Email:', user.email);
  console.log('Role:', user.role);
  console.log('Room:', user.currentRoomId);
} else {
  console.error('Failed to fetch user:', user.message);
}
```

#### Exemple JavaScript (Axios)
```javascript
import axios from 'axios';

try {
  const accessToken = localStorage.getItem('accessToken');
  const userId = '9f16a32d-4b2a-4ac3-8e7b-1234567890ab';

  const response = await axios.get(`http://127.0.0.1:4000/users/${userId}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  const user = response.data;
  console.log(`User: ${user.fullName} (${user.email})`);
  console.log(`Role: ${user.role}, Status: ${user.status}`);
} catch (error) {
  if (error.response?.status === 404) {
    console.error('User not found');
  } else {
    console.error('Error:', error.response?.data.message);
  }
}
```

#### Exemple Python (requests)
```python
import requests

user_id = "9f16a32d-4b2a-4ac3-8e7b-1234567890ab"
url = f"http://127.0.0.1:4000/users/{user_id}"
access_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

headers = {
    "Authorization": f"Bearer {access_token}"
}

response = requests.get(url, headers=headers)

if response.status_code == 200:
    user = response.json()
    print(f"User: {user['fullName']}")
    print(f"Email: {user['email']}")
    print(f"Role: {user['role']}")
    print(f"Room: {user['currentRoomId']}")
elif response.status_code == 404:
    print("User not found")
else:
    print(f"Error: {response.json()['message']}")
```

#### Exemple Flutter (Dart)
```dart
import 'package:http/http.dart' as http;
import 'dart:convert';

Future<Map<String, dynamic>> getUserById(String userId) async {
  final url = Uri.parse('http://127.0.0.1:4000/users/$userId');
  final accessToken = await storage.read(key: 'accessToken');

  final response = await http.get(
    url,
    headers: {
      'Authorization': 'Bearer $accessToken'
    },
  );

  if (response.statusCode == 200) {
    return json.decode(response.body);
  } else if (response.statusCode == 404) {
    throw Exception('User not found');
  } else {
    final error = json.decode(response.body);
    throw Exception(error['message']);
  }
}

// Usage
void main() async {
  try {
    final user = await getUserById('9f16a32d-4b2a-4ac3-8e7b-1234567890ab');
    print('User: ${user['fullName']}');
    print('Email: ${user['email']}');
  } catch (e) {
    print('Error: $e');
  }
}
```

#### Notes importantes
- Les reponses sont mises en cache par l'API Gateway (TTL: 10 minutes)
- L'ID doit etre un UUID v4 valide
- Tous les utilisateurs authentifies peuvent consulter les profils
- Le mot de passe n'est jamais retourne dans la reponse

---

### 3.4 Update User

#### Description
Met a jour les informations d'un utilisateur existant. Seuls les champs fournis sont modifies.

#### Endpoint Direct (User Service)
```
PATCH http://127.0.0.1:4002/users/:id
```

#### Endpoint via Gateway
```
PATCH http://127.0.0.1:4000/users/:id
```

#### Headers
```
Content-Type: application/json
Authorization: Bearer <accessToken>
```

#### URL Parameters
| Parametre | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Oui | UUID de l'utilisateur a modifier |

#### Request Body
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "ADMINISTRATOR",
  "status": "ACTIVE",
  "roomId": "ETAGE1-205",
  "academicSessionId": "2024-2025"
}
```

#### Request Schema
| Champ | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| email | string | Non | Email valide | Nouvelle adresse email |
| firstName | string | Non | Min 2 caracteres | Nouveau prenom |
| lastName | string | Non | Min 2 caracteres | Nouveau nom |
| role | string | Non | UserRole enum | Nouveau role |
| status | string | Non | UserStatus enum | Nouveau statut |
| roomId | string | Non | - | Nouvel ID de chambre |
| roomNumber | string | Non | - | Nouveau numero de chambre |
| academicSessionId | string | Non | Format YYYY-YYYY | Nouvelle session academique |

#### Response Success (200 OK)
```json
{
  "message": "User updated successfully",
  "user": {
    "id": "9f16a32d-4b2a-4ac3-8e7b-1234567890ab",
    "email": "jane.smith@example.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "fullName": "Jane Smith",
    "role": "ADMINISTRATOR",
    "status": "ACTIVE",
    "username": null,
    "googleId": null,
    "profilePicture": null,
    "emailVerified": true,
    "currentRoomId": "ETAGE1-205",
    "currentAcademicSessionId": "2024-2025",
    "lastLoginAt": "2024-12-14T09:00:00.000Z",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-12-14T11:00:00.000Z"
  }
}
```

#### Response Schema
| Champ | Type | Description |
|-------|------|-------------|
| message | string | Message de confirmation |
| user | object | Utilisateur mis a jour |

#### Response Error (400 Bad Request)
```json
{
  "statusCode": 400,
  "message": [
    "First name must be at least 2 characters",
    "Invalid role"
  ],
  "error": "Bad Request"
}
```

#### Response Error (401 Unauthorized)
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

#### Response Error (403 Forbidden)
```json
{
  "statusCode": 403,
  "message": "Insufficient permissions to update this user",
  "error": "Forbidden"
}
```

#### Response Error (404 Not Found)
```json
{
  "statusCode": 404,
  "message": "User not found",
  "error": "Not Found"
}
```

#### Response Error (409 Conflict)
```json
{
  "statusCode": 409,
  "message": "Email already in use",
  "error": "Conflict"
}
```

#### Status Codes
| Code | Signification | Description |
|------|---------------|-------------|
| 200 | OK | Utilisateur mis a jour avec succes |
| 400 | Bad Request | Donnees invalides |
| 401 | Unauthorized | Token manquant ou invalide |
| 403 | Forbidden | Permissions insuffisantes |
| 404 | Not Found | Utilisateur non trouve |
| 409 | Conflict | Email deja utilise |
| 500 | Internal Server Error | Erreur serveur |

#### Exemple cURL
```bash
curl -X PATCH http://127.0.0.1:4000/users/9f16a32d-4b2a-4ac3-8e7b-1234567890ab \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith",
    "role": "ADMINISTRATOR"
  }'
```

#### Exemple JavaScript (Fetch)
```javascript
const accessToken = localStorage.getItem('accessToken');
const userId = '9f16a32d-4b2a-4ac3-8e7b-1234567890ab';

const response = await fetch(`http://127.0.0.1:4000/users/${userId}`, {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify({
    firstName: 'Jane',
    lastName: 'Smith',
    role: 'ADMINISTRATOR'
  })
});

const data = await response.json();

if (response.ok) {
  console.log('User updated:', data.user.fullName);
} else {
  console.error('Update failed:', data.message);
}
```

#### Exemple JavaScript (Axios)
```javascript
import axios from 'axios';

try {
  const accessToken = localStorage.getItem('accessToken');
  const userId = '9f16a32d-4b2a-4ac3-8e7b-1234567890ab';

  const response = await axios.patch(`http://127.0.0.1:4000/users/${userId}`, {
    firstName: 'Jane',
    lastName: 'Smith',
    role: 'ADMINISTRATOR'
  }, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  console.log('User updated:', response.data.user);
} catch (error) {
  console.error('Error:', error.response?.data.message);
}
```

#### Exemple Python (requests)
```python
import requests

user_id = "9f16a32d-4b2a-4ac3-8e7b-1234567890ab"
url = f"http://127.0.0.1:4000/users/{user_id}"
access_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {access_token}"
}

data = {
    "firstName": "Jane",
    "lastName": "Smith",
    "role": "ADMINISTRATOR"
}

response = requests.patch(url, headers=headers, json=data)

if response.status_code == 200:
    result = response.json()
    print(f"User updated: {result['user']['fullName']}")
else:
    print(f"Error: {response.json()['message']}")
```

#### Exemple Flutter (Dart)
```dart
import 'package:http/http.dart' as http;
import 'dart:convert';

Future<Map<String, dynamic>> updateUser(
  String userId,
  Map<String, dynamic> updates
) async {
  final url = Uri.parse('http://127.0.0.1:4000/users/$userId');
  final accessToken = await storage.read(key: 'accessToken');

  final response = await http.patch(
    url,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $accessToken'
    },
    body: json.encode(updates),
  );

  if (response.statusCode == 200) {
    final data = json.decode(response.body);
    print('User updated: ${data['user']['fullName']}');
    return data;
  } else {
    final error = json.decode(response.body);
    throw Exception(error['message']);
  }
}

// Usage
void main() async {
  await updateUser('9f16a32d-4b2a-4ac3-8e7b-1234567890ab', {
    'firstName': 'Jane',
    'lastName': 'Smith',
    'role': 'ADMINISTRATOR'
  });
}
```

#### Notes importantes
- Seuls les champs fournis dans le body sont modifies (partial update)
- Un ADMINISTRATOR ne peut pas promouvoir un utilisateur au role SUPERADMIN
- Un ADMINISTRATOR ne peut pas modifier un SUPERADMIN
- Le changement d'email genere un nouvel email de verification
- La modification invalide le cache de cet utilisateur

---

### 3.5 Delete User

#### Description
Supprime definitivement un utilisateur du systeme. Cette action est irreversible.

#### Endpoint Direct (User Service)
```
DELETE http://127.0.0.1:4002/users/:id
```

#### Endpoint via Gateway
```
DELETE http://127.0.0.1:4000/users/:id
```

#### Headers
```
Authorization: Bearer <accessToken>
```

#### URL Parameters
| Parametre | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Oui | UUID de l'utilisateur a supprimer |

#### Exemple URL
```
DELETE http://127.0.0.1:4000/users/9f16a32d-4b2a-4ac3-8e7b-1234567890ab
```

#### Response Success (200 OK)
```json
{
  "message": "User deleted successfully"
}
```

#### Response Schema
| Champ | Type | Description |
|-------|------|-------------|
| message | string | Message de confirmation |

#### Response Error (401 Unauthorized)
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

#### Response Error (403 Forbidden)
```json
{
  "statusCode": 403,
  "message": "Insufficient permissions to delete this user",
  "error": "Forbidden"
}
```

#### Response Error (404 Not Found)
```json
{
  "statusCode": 404,
  "message": "User not found",
  "error": "Not Found"
}
```

#### Status Codes
| Code | Signification | Description |
|------|---------------|-------------|
| 200 | OK | Utilisateur supprime avec succes |
| 401 | Unauthorized | Token manquant ou invalide |
| 403 | Forbidden | Permissions insuffisantes |
| 404 | Not Found | Utilisateur non trouve |
| 500 | Internal Server Error | Erreur serveur |

#### Exemple cURL
```bash
curl -X DELETE http://127.0.0.1:4000/users/9f16a32d-4b2a-4ac3-8e7b-1234567890ab \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### Exemple JavaScript (Fetch)
```javascript
const accessToken = localStorage.getItem('accessToken');
const userId = '9f16a32d-4b2a-4ac3-8e7b-1234567890ab';

const confirmDelete = confirm('Are you sure you want to delete this user?');

if (confirmDelete) {
  const response = await fetch(`http://127.0.0.1:4000/users/${userId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  const data = await response.json();

  if (response.ok) {
    console.log('User deleted successfully');
    alert(data.message);
  } else {
    console.error('Delete failed:', data.message);
  }
}
```

#### Exemple JavaScript (Axios)
```javascript
import axios from 'axios';

try {
  const accessToken = localStorage.getItem('accessToken');
  const userId = '9f16a32d-4b2a-4ac3-8e7b-1234567890ab';

  const confirmDelete = window.confirm('Delete this user?');

  if (confirmDelete) {
    const response = await axios.delete(`http://127.0.0.1:4000/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    console.log('User deleted:', response.data.message);
  }
} catch (error) {
  console.error('Error:', error.response?.data.message);
}
```

#### Exemple Python (requests)
```python
import requests

user_id = "9f16a32d-4b2a-4ac3-8e7b-1234567890ab"
url = f"http://127.0.0.1:4000/users/{user_id}"
access_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

headers = {
    "Authorization": f"Bearer {access_token}"
}

# Confirmation
confirm = input(f"Delete user {user_id}? (yes/no): ")

if confirm.lower() == 'yes':
    response = requests.delete(url, headers=headers)

    if response.status_code == 200:
        print("User deleted successfully")
    elif response.status_code == 404:
        print("User not found")
    else:
        print(f"Error: {response.json()['message']}")
```

#### Exemple Flutter (Dart)
```dart
import 'package:http/http.dart' as http;
import 'dart:convert';

Future<void> deleteUser(String userId) async {
  final url = Uri.parse('http://127.0.0.1:4000/users/$userId');
  final accessToken = await storage.read(key: 'accessToken');

  // Confirmation dialog
  final confirm = await showDialog<bool>(
    context: context,
    builder: (context) => AlertDialog(
      title: Text('Delete User'),
      content: Text('Are you sure you want to delete this user?'),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(false),
          child: Text('Cancel'),
        ),
        TextButton(
          onPressed: () => Navigator.of(context).pop(true),
          child: Text('Delete'),
        ),
      ],
    ),
  );

  if (confirm == true) {
    final response = await http.delete(
      url,
      headers: {
        'Authorization': 'Bearer $accessToken'
      },
    );

    if (response.statusCode == 200) {
      print('User deleted successfully');
    } else {
      final error = json.decode(response.body);
      throw Exception(error['message']);
    }
  }
}
```

#### Notes importantes
- Cette action est IRREVERSIBLE
- Toujours demander confirmation avant de supprimer
- Un ADMINISTRATOR ne peut pas supprimer un SUPERADMIN
- La suppression invalide tous les tokens de l'utilisateur
- Les donnees associees (historique, logs) peuvent etre conservees selon la configuration

#### Permissions requises
- SUPERADMIN: Peut supprimer tous les utilisateurs
- ADMINISTRATOR: Peut supprimer tous sauf SUPERADMIN

---

### 3.6 Assign Room

#### Description
Assigne une chambre a un utilisateur pour une session academique specifique. Utilise principalement pour les occupants.

#### Endpoint Direct (User Service)
```
PATCH http://127.0.0.1:4002/users/:id/assign-room
```

#### Endpoint via Gateway
```
PATCH http://127.0.0.1:4000/users/:id/assign-room
```

#### Headers
```
Content-Type: application/json
Authorization: Bearer <accessToken>
```

#### URL Parameters
| Parametre | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Oui | UUID de l'utilisateur |

#### Request Body
```json
{
  "roomId": "RDC-101",
  "roomNumber": "101",
  "academicSessionId": "2024-2025"
}
```

#### Request Schema
| Champ | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| roomId | string | Oui | Non vide | Identifiant de la chambre |
| roomNumber | string | Oui | Non vide | Numero de la chambre |
| academicSessionId | string | Oui | Format YYYY-YYYY | Session academique (ex: 2024-2025) |

#### Response Success (200 OK)
```json
{
  "message": "Room assigned successfully",
  "user": {
    "id": "9f16a32d-4b2a-4ac3-8e7b-1234567890ab",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "fullName": "John Doe",
    "role": "OCCUPANT",
    "status": "ACTIVE",
    "username": null,
    "googleId": null,
    "profilePicture": null,
    "emailVerified": true,
    "currentRoomId": "RDC-101",
    "currentAcademicSessionId": "2024-2025",
    "lastLoginAt": "2024-12-14T09:00:00.000Z",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-12-14T11:30:00.000Z"
  }
}
```

#### Response Schema
| Champ | Type | Description |
|-------|------|-------------|
| message | string | Message de confirmation |
| user | object | Utilisateur avec chambre assignee |
| user.currentRoomId | string | ID de la chambre assignee |
| user.currentAcademicSessionId | string | Session academique |

#### Response Error (400 Bad Request)
```json
{
  "statusCode": 400,
  "message": [
    "Room ID is required",
    "Academic session must be in format YYYY-YYYY (ex: 2025-2026)"
  ],
  "error": "Bad Request"
}
```

#### Response Error (401 Unauthorized)
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

#### Response Error (404 Not Found)
```json
{
  "statusCode": 404,
  "message": "User not found",
  "error": "Not Found"
}
```

#### Status Codes
| Code | Signification | Description |
|------|---------------|-------------|
| 200 | OK | Chambre assignee avec succes |
| 400 | Bad Request | Donnees invalides |
| 401 | Unauthorized | Token manquant ou invalide |
| 404 | Not Found | Utilisateur non trouve |
| 500 | Internal Server Error | Erreur serveur |

#### Exemple cURL
```bash
curl -X PATCH http://127.0.0.1:4000/users/9f16a32d-4b2a-4ac3-8e7b-1234567890ab/assign-room \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "roomId": "RDC-101",
    "roomNumber": "101",
    "academicSessionId": "2024-2025"
  }'
```

#### Exemple JavaScript (Fetch)
```javascript
const accessToken = localStorage.getItem('accessToken');
const userId = '9f16a32d-4b2a-4ac3-8e7b-1234567890ab';

const response = await fetch(`http://127.0.0.1:4000/users/${userId}/assign-room`, {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify({
    roomId: 'RDC-101',
    roomNumber: '101',
    academicSessionId: '2024-2025'
  })
});

const data = await response.json();

if (response.ok) {
  console.log('Room assigned:', data.user.currentRoomId);
} else {
  console.error('Assignment failed:', data.message);
}
```

#### Exemple JavaScript (Axios)
```javascript
import axios from 'axios';

try {
  const accessToken = localStorage.getItem('accessToken');
  const userId = '9f16a32d-4b2a-4ac3-8e7b-1234567890ab';

  const response = await axios.patch(
    `http://127.0.0.1:4000/users/${userId}/assign-room`,
    {
      roomId: 'RDC-101',
      roomNumber: '101',
      academicSessionId: '2024-2025'
    },
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    }
  );

  console.log('Room assigned:', response.data.user.currentRoomId);
} catch (error) {
  console.error('Error:', error.response?.data.message);
}
```

#### Exemple Python (requests)
```python
import requests

user_id = "9f16a32d-4b2a-4ac3-8e7b-1234567890ab"
url = f"http://127.0.0.1:4000/users/{user_id}/assign-room"
access_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {access_token}"
}

data = {
    "roomId": "RDC-101",
    "roomNumber": "101",
    "academicSessionId": "2024-2025"
}

response = requests.patch(url, headers=headers, json=data)

if response.status_code == 200:
    result = response.json()
    print(f"Room assigned: {result['user']['currentRoomId']}")
else:
    print(f"Error: {response.json()['message']}")
```

#### Exemple Flutter (Dart)
```dart
import 'package:http/http.dart' as http;
import 'dart:convert';

Future<Map<String, dynamic>> assignRoom(
  String userId,
  String roomId,
  String roomNumber,
  String academicSessionId
) async {
  final url = Uri.parse('http://127.0.0.1:4000/users/$userId/assign-room');
  final accessToken = await storage.read(key: 'accessToken');

  final response = await http.patch(
    url,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $accessToken'
    },
    body: json.encode({
      'roomId': roomId,
      'roomNumber': roomNumber,
      'academicSessionId': academicSessionId,
    }),
  );

  if (response.statusCode == 200) {
    final data = json.decode(response.body);
    print('Room assigned: ${data['user']['currentRoomId']}');
    return data;
  } else {
    final error = json.decode(response.body);
    throw Exception(error['message']);
  }
}

// Usage
void main() async {
  await assignRoom(
    '9f16a32d-4b2a-4ac3-8e7b-1234567890ab',
    'RDC-101',
    '101',
    '2024-2025'
  );
}
```

#### Notes importantes
- Le format de academicSessionId doit etre YYYY-YYYY (ex: 2024-2025)
- Une chambre peut etre assignee a plusieurs occupants
- L'assignation ecrase la chambre precedente si existante
- Cette operation est tracee dans le service de synchronisation

---

### 3.7 Validate Excel

#### Description
Valide un fichier Excel avant l'import des utilisateurs. Retourne les erreurs et avertissements sans creer les utilisateurs.

#### Endpoint Direct (User Service)
```
POST http://127.0.0.1:4002/users/import/validate
```

#### Endpoint via Gateway
```
POST http://127.0.0.1:4000/users/import/validate
```

#### Headers
```
Content-Type: multipart/form-data
Authorization: Bearer <accessToken>
```

#### Request Body (FormData)
| Champ | Type | Required | Description |
|-------|------|----------|-------------|
| file | File | Oui | Fichier Excel (.xlsx ou .xls) |

#### Formats acceptes
- application/vnd.openxmlformats-officedocument.spreadsheetml.sheet (.xlsx)
- application/vnd.ms-excel (.xls)

#### Taille maximale
5 MB

#### Response Success (200 OK)
```json
{
  "success": true,
  "rowCount": 45,
  "errors": [],
  "warnings": [
    "Row 12: Email already exists, will be skipped",
    "Row 23: Room RDC-105 already assigned to another user"
  ],
  "message": "45 lignes valides, pretes a importer"
}
```

#### Response Schema
| Champ | Type | Description |
|-------|------|-------------|
| success | boolean | Validation reussie ou non |
| rowCount | number | Nombre de lignes valides |
| errors | array | Liste des erreurs bloquantes |
| warnings | array | Liste des avertissements non bloquants |
| message | string | Message de synthese |

#### Response Error (400 Bad Request)
```json
{
  "statusCode": 400,
  "message": "Format invalide. Utilisez un fichier Excel (.xlsx ou .xls)",
  "error": "Bad Request"
}
```

#### Response avec erreurs de validation
```json
{
  "success": false,
  "rowCount": 45,
  "errors": [
    "Row 5: Email invalide 'notanemail'",
    "Row 8: Colonne 'firstName' manquante",
    "Row 15: Role invalide 'INVALID_ROLE'"
  ],
  "warnings": [
    "Row 12: Email deja existant"
  ],
  "message": "3 erreurs trouvees"
}
```

#### Status Codes
| Code | Signification | Description |
|------|---------------|-------------|
| 200 | OK | Validation terminee (avec ou sans erreurs) |
| 400 | Bad Request | Fichier manquant ou format invalide |
| 401 | Unauthorized | Token manquant ou invalide |
| 413 | Payload Too Large | Fichier trop volumineux (> 5MB) |
| 500 | Internal Server Error | Erreur serveur |

#### Exemple cURL
```bash
curl -X POST http://127.0.0.1:4000/users/import/validate \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -F "file=@/path/to/users.xlsx"
```

#### Exemple JavaScript (Fetch)
```javascript
const accessToken = localStorage.getItem('accessToken');
const fileInput = document.querySelector('input[type="file"]');
const file = fileInput.files[0];

const formData = new FormData();
formData.append('file', file);

const response = await fetch('http://127.0.0.1:4000/users/import/validate', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  },
  body: formData
});

const data = await response.json();

if (response.ok) {
  if (data.success) {
    console.log(`Validation OK: ${data.rowCount} rows`);
    if (data.warnings.length > 0) {
      console.warn('Warnings:', data.warnings);
    }
  } else {
    console.error('Validation failed:', data.errors);
  }
} else {
  console.error('Error:', data.message);
}
```

#### Exemple JavaScript (Axios)
```javascript
import axios from 'axios';

try {
  const accessToken = localStorage.getItem('accessToken');
  const fileInput = document.querySelector('input[type="file"]');
  const file = fileInput.files[0];

  const formData = new FormData();
  formData.append('file', file);

  const response = await axios.post(
    'http://127.0.0.1:4000/users/import/validate',
    formData,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'multipart/form-data'
      }
    }
  );

  if (response.data.success) {
    console.log(`${response.data.rowCount} rows valid`);
  } else {
    console.error('Errors:', response.data.errors);
  }
} catch (error) {
  console.error('Error:', error.response?.data.message);
}
```

#### Exemple Python (requests)
```python
import requests

url = "http://127.0.0.1:4000/users/import/validate"
access_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

headers = {
    "Authorization": f"Bearer {access_token}"
}

files = {
    'file': open('users.xlsx', 'rb')
}

response = requests.post(url, headers=headers, files=files)

if response.status_code == 200:
    result = response.json()
    if result['success']:
        print(f"Validation OK: {result['rowCount']} rows")
        if result['warnings']:
            print(f"Warnings: {len(result['warnings'])}")
    else:
        print(f"Errors: {len(result['errors'])}")
        for error in result['errors']:
            print(f"  - {error}")
else:
    print(f"Error: {response.json()['message']}")
```

#### Exemple Flutter (Dart)
```dart
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:file_picker/file_picker.dart';

Future<Map<String, dynamic>> validateExcel(PlatformFile file) async {
  final url = Uri.parse('http://127.0.0.1:4000/users/import/validate');
  final accessToken = await storage.read(key: 'accessToken');

  final request = http.MultipartRequest('POST', url);
  request.headers['Authorization'] = 'Bearer $accessToken';
  request.files.add(
    http.MultipartFile.fromBytes(
      'file',
      file.bytes!,
      filename: file.name,
    ),
  );

  final streamedResponse = await request.send();
  final response = await http.Response.fromStream(streamedResponse);

  if (response.statusCode == 200) {
    final data = json.decode(response.body);
    if (data['success']) {
      print('Validation OK: ${data['rowCount']} rows');
    } else {
      print('Errors found: ${data['errors'].length}');
    }
    return data;
  } else {
    final error = json.decode(response.body);
    throw Exception(error['message']);
  }
}
```

#### Notes importantes
- La validation ne cree aucun utilisateur
- Permet de verifier le fichier avant l'import reel
- Les erreurs bloquantes doivent etre corrigees avant import
- Les avertissements sont informatifs mais n'empechent pas l'import
- Taille maximale: 5 MB
- Formats acceptes: .xlsx, .xls

#### Erreurs courantes detectees
- Email invalide ou manquant
- Colonnes requises manquantes (firstName, lastName, email)
- Role invalide
- Format academicSessionId incorrect
- Email en double dans le fichier
- Format de donnees incorrect

---

### 3.8 Upload Excel

#### Description
Importe les utilisateurs depuis un fichier Excel valide. Cree les comptes avec mot de passe genere automatiquement et emailVerified a true.

#### Endpoint Direct (User Service)
```
POST http://127.0.0.1:4002/users/import/upload
```

#### Endpoint via Gateway
```
POST http://127.0.0.1:4000/users/import/upload
```

#### Headers
```
Content-Type: multipart/form-data
Authorization: Bearer <accessToken>
```

#### Request Body (FormData)
| Champ | Type | Required | Description |
|-------|------|----------|-------------|
| file | File | Oui | Fichier Excel (.xlsx ou .xls) |

#### Response Success (200 OK)
```json
{
  "success": true,
  "imported": 42,
  "errors": [
    "Row 5: Email already exists, skipped",
    "Row 12: Invalid role, skipped"
  ],
  "warnings": [],
  "message": "42 utilisateurs importes avec succes (isVerified = true)"
}
```

#### Response Schema
| Champ | Type | Description |
|-------|------|-------------|
| success | boolean | Au moins un utilisateur importe |
| imported | number | Nombre d'utilisateurs crees |
| errors | array | Liste des lignes en erreur |
| warnings | array | Liste des avertissements |
| message | string | Message de synthese |

#### Response Error (400 Bad Request)
```json
{
  "statusCode": 400,
  "message": "Format invalide. Utilisez un fichier Excel (.xlsx ou .xls)",
  "error": "Bad Request"
}
```

#### Response avec echec total
```json
{
  "success": false,
  "imported": 0,
  "errors": [
    "Row 1: Email invalide",
    "Row 2: Colonne firstName manquante",
    "Row 3: Email deja existant"
  ],
  "warnings": [],
  "message": "Aucun utilisateur importe"
}
```

#### Status Codes
| Code | Signification | Description |
|------|---------------|-------------|
| 200 | OK | Import termine (avec ou sans erreurs) |
| 400 | Bad Request | Fichier manquant ou format invalide |
| 401 | Unauthorized | Token manquant ou invalide |
| 413 | Payload Too Large | Fichier trop volumineux (> 5MB) |
| 500 | Internal Server Error | Erreur serveur |

#### Exemple cURL
```bash
curl -X POST http://127.0.0.1:4000/users/import/upload \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -F "file=@/path/to/users.xlsx"
```

#### Exemple JavaScript (Fetch)
```javascript
const accessToken = localStorage.getItem('accessToken');
const fileInput = document.querySelector('input[type="file"]');
const file = fileInput.files[0];

const formData = new FormData();
formData.append('file', file);

const response = await fetch('http://127.0.0.1:4000/users/import/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  },
  body: formData
});

const data = await response.json();

if (response.ok) {
  console.log(`Imported ${data.imported} users`);
  if (data.errors.length > 0) {
    console.warn('Errors:', data.errors);
  }
  alert(`${data.imported} users imported successfully!`);
} else {
  console.error('Import failed:', data.message);
}
```

#### Exemple JavaScript (Axios)
```javascript
import axios from 'axios';

try {
  const accessToken = localStorage.getItem('accessToken');
  const fileInput = document.querySelector('input[type="file"]');
  const file = fileInput.files[0];

  const formData = new FormData();
  formData.append('file', file);

  const response = await axios.post(
    'http://127.0.0.1:4000/users/import/upload',
    formData,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'multipart/form-data'
      }
    }
  );

  console.log(`Imported: ${response.data.imported} users`);
  if (response.data.errors.length > 0) {
    console.warn('Some rows failed:', response.data.errors);
  }
} catch (error) {
  console.error('Error:', error.response?.data.message);
}
```

#### Exemple Python (requests)
```python
import requests

url = "http://127.0.0.1:4000/users/import/upload"
access_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

headers = {
    "Authorization": f"Bearer {access_token}"
}

files = {
    'file': open('users.xlsx', 'rb')
}

response = requests.post(url, headers=headers, files=files)

if response.status_code == 200:
    result = response.json()
    print(f"Imported: {result['imported']} users")
    if result['errors']:
        print(f"Errors: {len(result['errors'])}")
        for error in result['errors']:
            print(f"  - {error}")
else:
    print(f"Error: {response.json()['message']}")
```

#### Exemple Flutter (Dart)
```dart
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:file_picker/file_picker.dart';

Future<Map<String, dynamic>> uploadExcel(PlatformFile file) async {
  final url = Uri.parse('http://127.0.0.1:4000/users/import/upload');
  final accessToken = await storage.read(key: 'accessToken');

  final request = http.MultipartRequest('POST', url);
  request.headers['Authorization'] = 'Bearer $accessToken';
  request.files.add(
    http.MultipartFile.fromBytes(
      'file',
      file.bytes!,
      filename: file.name,
    ),
  );

  final streamedResponse = await request.send();
  final response = await http.Response.fromStream(streamedResponse);

  if (response.statusCode == 200) {
    final data = json.decode(response.body);
    print('Imported: ${data['imported']} users');
    if (data['errors'].isNotEmpty) {
      print('Errors: ${data['errors'].length}');
    }
    return data;
  } else {
    final error = json.decode(response.body);
    throw Exception(error['message']);
  }
}
```

#### Notes importantes
- TOUS les utilisateurs importes ont emailVerified = true automatiquement
- Un mot de passe aleatoire securise est genere pour chaque utilisateur
- Un email avec les identifiants est envoye a chaque utilisateur cree
- Les lignes en erreur sont ignorees, les autres sont importees
- L'import declenche des evenements RabbitMQ pour synchronisation
- Taille maximale: 5 MB

#### Colonnes Excel requises
- email (obligatoire)
- firstName (obligatoire)
- lastName (obligatoire)
- role (obligatoire: OCCUPANT, ADMINISTRATOR, etc.)
- roomId (optionnel)
- roomNumber (optionnel)
- academicSessionId (optionnel, format YYYY-YYYY)

#### Workflow recommande
1. Telecharger le template avec GET /users/import/template
2. Remplir le fichier Excel
3. Valider avec POST /users/import/validate
4. Corriger les erreurs si necessaire
5. Importer avec POST /users/import/upload

---

### 3.9 Export Users

#### Description
Exporte tous les utilisateurs existants dans un fichier Excel (.xlsx). Le fichier inclut toutes les informations utilisateur.

#### Endpoint Direct (User Service)
```
GET http://127.0.0.1:4002/users/import/export
```

#### Endpoint via Gateway
```
GET http://127.0.0.1:4000/users/import/export
```

#### Headers
```
Authorization: Bearer <accessToken>
```

#### Response Success (200 OK)
Retourne un fichier Excel binaire (.xlsx).

**Headers de reponse:**
```
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="utilisateurs-export-2024-12-14.xlsx"
Content-Length: 25634
```

#### Response Error (401 Unauthorized)
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

#### Response Error (400 Bad Request)
```json
{
  "statusCode": 400,
  "message": "Erreur export",
  "error": "Bad Request"
}
```

#### Status Codes
| Code | Signification | Description |
|------|---------------|-------------|
| 200 | OK | Fichier genere avec succes |
| 401 | Unauthorized | Token manquant ou invalide |
| 400 | Bad Request | Erreur lors de la generation |
| 500 | Internal Server Error | Erreur serveur |

#### Exemple cURL
```bash
curl -X GET http://127.0.0.1:4000/users/import/export \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -o users-export.xlsx
```

#### Exemple JavaScript (Fetch)
```javascript
const accessToken = localStorage.getItem('accessToken');

const response = await fetch('http://127.0.0.1:4000/users/import/export', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

if (response.ok) {
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'users-export.xlsx';
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
  console.log('Export downloaded successfully');
} else {
  console.error('Export failed');
}
```

#### Exemple JavaScript (Axios)
```javascript
import axios from 'axios';

try {
  const accessToken = localStorage.getItem('accessToken');

  const response = await axios.get('http://127.0.0.1:4000/users/import/export', {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    },
    responseType: 'blob'
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'users-export.xlsx');
  document.body.appendChild(link);
  link.click();
  link.remove();

  console.log('Export downloaded');
} catch (error) {
  console.error('Error:', error.response?.data);
}
```

#### Exemple Python (requests)
```python
import requests

url = "http://127.0.0.1:4000/users/import/export"
access_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

headers = {
    "Authorization": f"Bearer {access_token}"
}

response = requests.get(url, headers=headers)

if response.status_code == 200:
    # Sauvegarder le fichier
    with open('users-export.xlsx', 'wb') as f:
        f.write(response.content)
    print("Export saved: users-export.xlsx")
else:
    print(f"Error: {response.status_code}")
```

#### Exemple Flutter (Dart)
```dart
import 'package:http/http.dart' as http;
import 'dart:io';
import 'package:path_provider/path_provider.dart';

Future<void> exportUsers() async {
  final url = Uri.parse('http://127.0.0.1:4000/users/import/export');
  final accessToken = await storage.read(key: 'accessToken');

  final response = await http.get(
    url,
    headers: {
      'Authorization': 'Bearer $accessToken'
    },
  );

  if (response.statusCode == 200) {
    final directory = await getApplicationDocumentsDirectory();
    final file = File('${directory.path}/users-export.xlsx');
    await file.writeAsBytes(response.bodyBytes);
    print('Export saved: ${file.path}');
  } else {
    throw Exception('Export failed');
  }
}
```

#### Notes importantes
- Le nom du fichier inclut la date d'export (YYYY-MM-DD)
- Tous les utilisateurs sont exportes (pas de pagination)
- Le mot de passe n'est pas inclus dans l'export (securite)
- Format compatible avec Excel, Google Sheets, LibreOffice

#### Colonnes exportees
- id
- email
- firstName
- lastName
- role
- status
- emailVerified
- currentRoomId
- currentAcademicSessionId
- createdAt
- updatedAt
- lastLoginAt

---

### 3.10 Download Template

#### Description
Telecharge un fichier Excel template vierge pour l'import d'utilisateurs. Le template contient les colonnes requises et des exemples.

#### Endpoint Direct (User Service)
```
GET http://127.0.0.1:4002/users/import/template
```

#### Endpoint via Gateway
```
GET http://127.0.0.1:4000/users/import/template
```

#### Headers
Aucun header requis (endpoint public).

#### Response Success (200 OK)
Retourne un fichier Excel binaire (.xlsx).

**Headers de reponse:**
```
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="template-utilisateurs.xlsx"
```

#### Response Error (400 Bad Request)
```json
{
  "statusCode": 400,
  "message": "Erreur generation template",
  "error": "Bad Request"
}
```

#### Status Codes
| Code | Signification | Description |
|------|---------------|-------------|
| 200 | OK | Template genere avec succes |
| 400 | Bad Request | Erreur lors de la generation |
| 500 | Internal Server Error | Erreur serveur |

#### Exemple cURL
```bash
curl -X GET http://127.0.0.1:4000/users/import/template \
  -o template-users.xlsx
```

#### Exemple JavaScript (Fetch)
```javascript
const response = await fetch('http://127.0.0.1:4000/users/import/template', {
  method: 'GET'
});

if (response.ok) {
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'template-users.xlsx';
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
  console.log('Template downloaded');
} else {
  console.error('Download failed');
}
```

#### Exemple JavaScript (Axios)
```javascript
import axios from 'axios';

try {
  const response = await axios.get('http://127.0.0.1:4000/users/import/template', {
    responseType: 'blob'
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'template-users.xlsx');
  document.body.appendChild(link);
  link.click();
  link.remove();

  console.log('Template downloaded');
} catch (error) {
  console.error('Error:', error);
}
```

#### Exemple Python (requests)
```python
import requests

url = "http://127.0.0.1:4000/users/import/template"

response = requests.get(url)

if response.status_code == 200:
    with open('template-users.xlsx', 'wb') as f:
        f.write(response.content)
    print("Template saved: template-users.xlsx")
else:
    print(f"Error: {response.status_code}")
```

#### Exemple Flutter (Dart)
```dart
import 'package:http/http.dart' as http;
import 'dart:io';
import 'package:path_provider/path_provider.dart';

Future<void> downloadTemplate() async {
  final url = Uri.parse('http://127.0.0.1:4000/users/import/template');

  final response = await http.get(url);

  if (response.statusCode == 200) {
    final directory = await getApplicationDocumentsDirectory();
    final file = File('${directory.path}/template-users.xlsx');
    await file.writeAsBytes(response.bodyBytes);
    print('Template saved: ${file.path}');
  } else {
    throw Exception('Download failed');
  }
}
```

#### Notes importantes
- Endpoint public, pas d'authentification requise
- Le template contient des en-tetes de colonnes et des lignes d'exemple
- Supprimer les lignes d'exemple avant l'import
- Compatible avec Excel, Google Sheets, LibreOffice

#### Colonnes du template
1. **email** (obligatoire) - Adresse email unique
2. **firstName** (obligatoire) - Prenom (min 2 caracteres)
3. **lastName** (obligatoire) - Nom (min 2 caracteres)
4. **role** (obligatoire) - OCCUPANT, ADMINISTRATOR, SUPERVISOR, AGENT_TERRAIN, SUPERADMIN
5. **roomId** (optionnel) - Format: XXX-NNN (ex: RDC-101)
6. **roomNumber** (optionnel) - Numero de chambre
7. **academicSessionId** (optionnel) - Format: YYYY-YYYY (ex: 2024-2025)

---

### 3.11 Import Occupants

#### Description
Importe des occupants depuis un fichier Excel avec assignation de session academique. Version simplifiee de l'import avec academ icSessionId obligatoire.

#### Endpoint Direct (User Service)
```
POST http://127.0.0.1:4002/users/import/occupants
```

#### Endpoint via Gateway
```
POST http://127.0.0.1:4000/users/import/occupants
```

#### Headers
```
Content-Type: multipart/form-data
Authorization: Bearer <accessToken>
```

#### Request Body (FormData)
| Champ | Type | Required | Description |
|-------|------|----------|-------------|
| file | File | Oui | Fichier Excel (.xlsx ou .xls) |
| academicSessionId | string | Oui | Session academique (ex: 2024-2025) |

#### Response Success (200 OK)
```json
{
  "message": "Import completed",
  "summary": {
    "totalProcessed": 50,
    "successCount": 48,
    "failedCount": 2
  },
  "errors": [
    "Row 5: Email already exists",
    "Row 12: Invalid email format"
  ],
  "createdUsers": [
    {
      "id": "uuid-1",
      "email": "user1@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "OCCUPANT"
    }
  ]
}
```

#### Response Schema
| Champ | Type | Description |
|-------|------|-------------|
| message | string | Message de statut |
| summary | object | Resume de l'import |
| summary.totalProcessed | number | Nombre total de lignes traitees |
| summary.successCount | number | Nombre d'utilisateurs crees |
| summary.failedCount | number | Nombre d'echecs |
| errors | array | Liste des erreurs rencontrees |
| createdUsers | array | Liste des utilisateurs crees |

#### Response Error (400 Bad Request)
```json
{
  "statusCode": 400,
  "message": "Academic session ID is required",
  "error": "Bad Request"
}
```

#### Response Error (400 Bad Request - Format)
```json
{
  "statusCode": 400,
  "message": "Only Excel files (.xlsx, .xls) are allowed",
  "error": "Bad Request"
}
```

#### Status Codes
| Code | Signification | Description |
|------|---------------|-------------|
| 200 | OK | Import termine (avec ou sans erreurs) |
| 400 | Bad Request | Fichier ou session academique manquant |
| 401 | Unauthorized | Token manquant ou invalide |
| 413 | Payload Too Large | Fichier trop volumineux |
| 500 | Internal Server Error | Erreur serveur |

#### Exemple cURL
```bash
curl -X POST http://127.0.0.1:4000/users/import/occupants \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -F "file=@/path/to/occupants.xlsx" \
  -F "academicSessionId=2024-2025"
```

#### Exemple JavaScript (Fetch)
```javascript
const accessToken = localStorage.getItem('accessToken');
const fileInput = document.querySelector('input[type="file"]');
const file = fileInput.files[0];
const academicSessionId = '2024-2025';

const formData = new FormData();
formData.append('file', file);
formData.append('academicSessionId', academicSessionId);

const response = await fetch('http://127.0.0.1:4000/users/import/occupants', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  },
  body: formData
});

const data = await response.json();

if (response.ok) {
  console.log(`Success: ${data.summary.successCount}/${data.summary.totalProcessed}`);
  if (data.errors.length > 0) {
    console.warn('Errors:', data.errors);
  }
} else {
  console.error('Import failed:', data.message);
}
```

#### Exemple JavaScript (Axios)
```javascript
import axios from 'axios';

try {
  const accessToken = localStorage.getItem('accessToken');
  const fileInput = document.querySelector('input[type="file"]');
  const file = fileInput.files[0];

  const formData = new FormData();
  formData.append('file', file);
  formData.append('academicSessionId', '2024-2025');

  const response = await axios.post(
    'http://127.0.0.1:4000/users/import/occupants',
    formData,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'multipart/form-data'
      }
    }
  );

  const { summary, errors, createdUsers } = response.data;
  console.log(`Imported: ${summary.successCount} users`);
  console.log(`Failed: ${summary.failedCount} users`);
} catch (error) {
  console.error('Error:', error.response?.data.message);
}
```

#### Exemple Python (requests)
```python
import requests

url = "http://127.0.0.1:4000/users/import/occupants"
access_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

headers = {
    "Authorization": f"Bearer {access_token}"
}

files = {
    'file': open('occupants.xlsx', 'rb')
}

data = {
    'academicSessionId': '2024-2025'
}

response = requests.post(url, headers=headers, files=files, data=data)

if response.status_code == 200:
    result = response.json()
    summary = result['summary']
    print(f"Processed: {summary['totalProcessed']}")
    print(f"Success: {summary['successCount']}")
    print(f"Failed: {summary['failedCount']}")
    if result['errors']:
        print("Errors:")
        for error in result['errors']:
            print(f"  - {error}")
else:
    print(f"Error: {response.json()['message']}")
```

#### Exemple Flutter (Dart)
```dart
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:file_picker/file_picker.dart';

Future<Map<String, dynamic>> importOccupants(
  PlatformFile file,
  String academicSessionId
) async {
  final url = Uri.parse('http://127.0.0.1:4000/users/import/occupants');
  final accessToken = await storage.read(key: 'accessToken');

  final request = http.MultipartRequest('POST', url);
  request.headers['Authorization'] = 'Bearer $accessToken';
  request.files.add(
    http.MultipartFile.fromBytes(
      'file',
      file.bytes!,
      filename: file.name,
    ),
  );
  request.fields['academicSessionId'] = academicSessionId;

  final streamedResponse = await request.send();
  final response = await http.Response.fromStream(streamedResponse);

  if (response.statusCode == 200) {
    final data = json.decode(response.body);
    final summary = data['summary'];
    print('Success: ${summary['successCount']}');
    print('Failed: ${summary['failedCount']}');
    return data;
  } else {
    final error = json.decode(response.body);
    throw Exception(error['message']);
  }
}
```

#### Notes importantes
- La session academique est obligatoire
- Tous les occupants importes seront associes a cette session
- Les utilisateurs crees ont le role OCCUPANT par defaut
- Un mot de passe est genere automatiquement
- Un email de bienvenue est envoye avec les identifiants
- Les lignes en erreur sont ignorees, les autres sont importees

---

## 4. SYNCHRONISATION (SYNC SERVICE)

### 4.1 Get History

#### Description
Recupere l'historique des operations de synchronisation avec filtres et pagination.

#### Endpoint Direct (Sync Service)
```
GET http://127.0.0.1:4003/history
```

#### Endpoint via Gateway
```
GET http://127.0.0.1:4000/history
```

#### Headers
```
Authorization: Bearer <accessToken>
```

#### Query Parameters
| Parametre | Type | Default | Description |
|-----------|------|---------|-------------|
| eventType | string | - | Type d'evenement |
| operationType | string | - | CREATED, UPDATED, DELETED, SYNCED, FAILED, RETRIED |
| status | string | - | SUCCESS, FAILED, PENDING |
| startDate | string | - | Date de debut (ISO 8601) |
| endDate | string | - | Date de fin (ISO 8601) |
| entityId | string | - | ID de l'entite |
| sourceService | string | - | Service source |
| targetService | string | - | Service cible |
| limit | number | 50 | Limite de resultats (max 500) |
| offset | number | 0 | Decalage pour pagination |

#### Exemple URL
```
GET http://127.0.0.1:4000/history?operationType=CREATED&status=SUCCESS&limit=20&offset=0
```

#### Response Success (200 OK)
```json
{
  "status": "success",
  "data": [
    {
      "id": "op-uuid-1",
      "eventId": "event-uuid-1",
      "eventType": "user.created",
      "operationType": "CREATED",
      "status": "SUCCESS",
      "entityId": "9f16a32d-4b2a-4ac3-8e7b-1234567890ab",
      "sourceService": "user-service",
      "targetServices": ["auth-service"],
      "payload": {
        "email": "user@example.com",
        "firstName": "John",
        "lastName": "Doe"
      },
      "errorMessage": null,
      "timestamp": "2024-12-14T10:30:00.000Z",
      "duration": 125
    }
  ],
  "pagination": {
    "total": 1523,
    "limit": 20,
    "offset": 0,
    "hasMore": true,
    "totalPages": 77
  }
}
```

#### Response Schema
| Champ | Type | Description |
|-------|------|-------------|
| status | string | Statut de la reponse |
| data | array | Liste des operations |
| data[].id | string | ID de l'operation |
| data[].eventId | string | ID de l'evenement |
| data[].eventType | string | Type d'evenement (user.created, etc.) |
| data[].operationType | string | Type d'operation |
| data[].status | string | Statut (SUCCESS, FAILED, PENDING) |
| data[].entityId | string | ID de l'entite concernee |
| data[].sourceService | string | Service source |
| data[].targetServices | array | Services cibles |
| data[].payload | object | Donnees de l'operation |
| data[].errorMessage | string | Message d'erreur si echec |
| data[].timestamp | string | Date de l'operation (ISO 8601) |
| data[].duration | number | Duree en millisecondes |
| pagination | object | Informations de pagination |

#### Response Error (401 Unauthorized)
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

#### Response Error (400 Bad Request)
```json
{
  "statusCode": 400,
  "message": "Failed to retrieve history",
  "error": "Bad Request"
}
```

#### Status Codes
| Code | Signification | Description |
|------|---------------|-------------|
| 200 | OK | Historique recupere avec succes |
| 400 | Bad Request | Parametres invalides |
| 401 | Unauthorized | Token manquant ou invalide |
| 500 | Internal Server Error | Erreur serveur |

#### Exemple cURL
```bash
curl -X GET "http://127.0.0.1:4000/history?operationType=CREATED&limit=20" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### Exemple JavaScript (Fetch)
```javascript
const accessToken = localStorage.getItem('accessToken');

const params = new URLSearchParams({
  operationType: 'CREATED',
  status: 'SUCCESS',
  limit: '20',
  offset: '0'
});

const response = await fetch(`http://127.0.0.1:4000/history?${params}`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

const data = await response.json();

if (response.ok) {
  console.log(`Total operations: ${data.pagination.total}`);
  data.data.forEach(op => {
    console.log(`- ${op.eventType}: ${op.status}`);
  });
} else {
  console.error('Failed to fetch history:', data.message);
}
```

#### Exemple JavaScript (Axios)
```javascript
import axios from 'axios';

try {
  const accessToken = localStorage.getItem('accessToken');

  const response = await axios.get('http://127.0.0.1:4000/history', {
    params: {
      operationType: 'CREATED',
      status: 'SUCCESS',
      limit: 20,
      offset: 0
    },
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  const { data, pagination } = response.data;
  console.log(`Found ${pagination.total} operations`);
  data.forEach(op => console.log(`${op.eventType}: ${op.status}`));
} catch (error) {
  console.error('Error:', error.response?.data.message);
}
```

#### Exemple Python (requests)
```python
import requests

url = "http://127.0.0.1:4000/history"
access_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

headers = {
    "Authorization": f"Bearer {access_token}"
}

params = {
    "operationType": "CREATED",
    "status": "SUCCESS",
    "limit": 20,
    "offset": 0
}

response = requests.get(url, headers=headers, params=params)

if response.status_code == 200:
    result = response.json()
    print(f"Total: {result['pagination']['total']}")
    for operation in result['data']:
        print(f"- {operation['eventType']}: {operation['status']}")
else:
    print(f"Error: {response.json()['message']}")
```

#### Exemple Flutter (Dart)
```dart
import 'package:http/http.dart' as http;
import 'dart:convert';

Future<Map<String, dynamic>> getHistory({
  String? operationType,
  String? status,
  int limit = 50,
  int offset = 0
}) async {
  final queryParams = {
    'limit': limit.toString(),
    'offset': offset.toString(),
    if (operationType != null) 'operationType': operationType,
    if (status != null) 'status': status,
  };

  final url = Uri.parse('http://127.0.0.1:4000/history')
      .replace(queryParameters: queryParams);
  final accessToken = await storage.read(key: 'accessToken');

  final response = await http.get(
    url,
    headers: {
      'Authorization': 'Bearer $accessToken'
    },
  );

  if (response.statusCode == 200) {
    return json.decode(response.body);
  } else {
    throw Exception('Failed to fetch history');
  }
}
```

#### Notes importantes
- Les resultats sont stockes dans Redis pour performance
- La limite maximale par requete est 500
- Les dates doivent etre au format ISO 8601
- Les filtres peuvent etre combines

#### Types d'operations disponibles
- CREATED: Creation d'entite
- UPDATED: Mise a jour d'entite
- DELETED: Suppression d'entite
- SYNCED: Synchronisation entre services
- FAILED: Operation echouee
- RETRIED: Nouvelle tentative apres echec

#### Statuts disponibles
- SUCCESS: Operation reussie
- FAILED: Operation echouee
- PENDING: En attente

---
---

## CONCLUSION

Cette documentation couvre l'ensemble des endpoints de l'API IMMO360 avec:

- **9 endpoints d'authentification** (Auth Service)
- **11 endpoints de gestion utilisateurs** (User Service)
- **9 endpoints de synchronisation** (Sync Service)
- **Schemas de donnees detailles** (User, Auth, Pagination, Error)
- **Gestion complete des erreurs** (4xx et 5xx)
- **Exemples d'integration complets** (ReactJS, Flutter, Python)

### Points Cles

1. **Architecture Microservices**
   - Auth Service (Port 4001)
   - User Service (Port 4002)
   - Sync Service (Port 4003)
   - API Gateway (Port 4000)

2. **Authentification JWT**
   - Access Token: 1 heure
   - Refresh Token: 7 jours
   - Rotation automatique des tokens

3. **Cache Redis**
   - GET /users: 5 minutes
   - GET /users/:id: 10 minutes
   - Invalidation automatique

4. **Rate Limiting**
   - Protection contre les abus
   - Headers informatifs
   - Retry avec backoff

5. **Gestion des Erreurs**
   - Codes HTTP standards
   - Messages descriptifs
   - Retry automatique pour 5xx

### Ressources Supplementaires

- Code source: Consulter les controllers et DTOs dans le projet
- Tests: Fichier COMPLETE_TESTING_GUIDE.http
- Postman Collection: IMMO360-Complete-Collection.json

### Support

Pour toute question ou probleme:
- Verifier la documentation ci-dessus
- Consulter les logs des services
- Utiliser les health check endpoints
- Contacter l'equipe de developpement

---

**Version:** 1.0.0
**Date:** 14 Decembre 2024
**Genere avec:** Claude Code
