# 🚀 IMMO360 - Documentation API pour Intégration Frontend

**Version** : 1.0.0  
**Date** : 13 Décembre 2025  
**Base URL** : `http://localhost:4000` (API Gateway)

---

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Authentification](#authentification)
3. [Gestion des Utilisateurs](#gestion-des-utilisateurs)
4. [Historique & Synchronisation](#historique--synchronisation)
5. [Codes de Statut HTTP](#codes-de-statut-http)
6. [Gestion des Erreurs](#gestion-des-erreurs)
7. [Exemples d'Intégration](#exemples-dintégration)

---

## 🌐 Vue d'Ensemble

### Architecture
```
Frontend (Vue/React/Angular)
    ↓
API Gateway (Port 4000)
    ↓
┌─────────────┬─────────────┬─────────────┐
│ Auth-Service│ User-Service│ Sync-Service│
│  Port 4001  │  Port 4002  │  Port 4003  │
└─────────────┴─────────────┴─────────────┘
```

### Points d'Entrée

| Service | URL Directe | URL via Gateway |
|---------|-------------|-----------------|
| Auth | `http://localhost:4001` | `http://localhost:4000/auth` |
| Users | `http://localhost:4002` | `http://localhost:4000/users` |
| Sync | `http://localhost:4003` | `http://localhost:4000/sync` |

### Headers Requis
```http
Content-Type: application/json
Authorization: Bearer {accessToken}  # Pour les routes protégées
```

---

## 🔐 Authentification

### 1. Login (Connexion)

**Endpoint** : `POST /auth/login`

**Description** : Authentifie un utilisateur et retourne les tokens JWT.

**Headers**
```http
Content-Type: application/json
```

**Request Body**
```typescript
interface LoginRequest {
  email: string;      // Format email valide
  password: string;   // Min 8 caractères
}
```

**Exemple**
```json
{
  "email": "chrisomgba04@gmail.com",
  "password": "Password@123"
}
```

**Response (200 OK)**
```typescript
interface LoginResponse {
  status: string;
  message: string;
  accessToken: string;   // Expire après 2h
  refreshToken: string;  // Expire après 7 jours
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;      // SUPER_ADMIN | ADMIN | SUPERVISOR | FIELD_AGENT
    status: string;
    emailVerified: boolean;
  };
}
```

**Exemple de Réponse**
```json
{
  "status": "success",
  "message": "Login successful",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "00000000-0000-0000-0000-000000000001",
    "email": "chrisomgba04@gmail.com",
    "firstName": "Chris",
    "lastName": "Omgba",
    "role": "SUPER_ADMIN",
    "status": "ACTIVE",
    "emailVerified": true
  }
}
```

**Codes de Statut**
- `200` : Connexion réussie
- `401` : Email ou mot de passe incorrect
- `403` : Compte verrouillé ou inactif
- `422` : Données de validation invalides

**Erreurs Possibles**
```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

---

### 2. Refresh Token (Renouvellement)

**Endpoint** : `POST /auth/refresh`

**Description** : Génère un nouveau accessToken sans redemander le mot de passe.

**Request Body**
```typescript
interface RefreshTokenRequest {
  refreshToken: string;
}
```

**Exemple**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK)**
```json
{
  "status": "success",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Codes de Statut**
- `200` : Token renouvelé
- `401` : Refresh token invalide ou expiré

---

### 3. Logout (Déconnexion)

**Endpoint** : `POST /auth/logout`

**Headers**
```http
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request Body**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK)**
```json
{
  "status": "success",
  "message": "Logout successful"
}
```

---

### 4. Profil Utilisateur

**Endpoint** : `GET /auth/profile`

**Headers**
```http
Authorization: Bearer {accessToken}
```

**Response (200 OK)**
```json
{
  "id": "00000000-0000-0000-0000-000000000001",
  "email": "chrisomgba04@gmail.com",
  "firstName": "Chris",
  "lastName": "Omgba",
  "role": "SUPER_ADMIN",
  "status": "ACTIVE",
  "emailVerified": true,
  "createdAt": "2025-12-13T10:00:00.000Z"
}
```

---

### 5. Changement de Mot de Passe

**Endpoint** : `PATCH /auth/change-password`

**Headers**
```http
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request Body**
```typescript
interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;  // Min 8 caractères, 1 majuscule, 1 chiffre, 1 caractère spécial
}
```

**Exemple**
```json
{
  "currentPassword": "Password@123",
  "newPassword": "NewPassword@456"
}
```

**Response (200 OK)**
```json
{
  "status": "success",
  "message": "Password changed successfully"
}
```

**Codes de Statut**
- `200` : Mot de passe changé
- `401` : Mot de passe actuel incorrect
- `422` : Nouveau mot de passe non conforme

---

### 6. Google OAuth (SSO)

**Endpoint** : `GET /auth/google`

**Description** : Redirige vers la page de connexion Google.

**Usage Frontend**
```javascript
window.location.href = 'http://localhost:4000/auth/google';
```

**Callback** : `GET /auth/google/redirect`

Google redirige vers cette URL avec un code d'autorisation qui est automatiquement traité par le backend.

---

## 👥 Gestion des Utilisateurs

### 1. Lister les Utilisateurs

**Endpoint** : `GET /users`

**Headers**
```http
Authorization: Bearer {accessToken}
```

**Query Parameters**
```typescript
interface UsersQueryParams {
  page?: number;        // Default: 1
  limit?: number;       // Default: 10, Max: 100
  search?: string;      // Recherche dans email, firstName, lastName
  role?: UserRole;      // SUPER_ADMIN | ADMIN | SUPERVISOR | FIELD_AGENT
  status?: string;      // ACTIVE | PENDING_EMAIL_VERIFICATION | LOCKED
  sortBy?: string;      // createdAt | email | firstName
  sortOrder?: 'ASC' | 'DESC';  // Default: DESC
}
```

**Exemples d'URLs**
```
GET /users
GET /users?page=1&limit=20
GET /users?role=ADMIN
GET /users?search=chris
GET /users?status=ACTIVE&sortBy=createdAt&sortOrder=DESC
```

**Response (200 OK)**
```typescript
interface UsersListResponse {
  status: string;
  data: User[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
```

**Exemple de Réponse**
```json
{
  "status": "success",
  "data": [
    {
      "id": "00000000-0000-0000-0000-000000000001",
      "email": "chrisomgba04@gmail.com",
      "firstName": "Chris",
      "lastName": "Omgba",
      "role": "SUPER_ADMIN",
      "status": "ACTIVE",
      "emailVerified": true,
      "profilePicture": null,
      "currentRoomId": null,
      "createdAt": "2025-12-13T10:00:00.000Z",
      "updatedAt": "2025-12-13T10:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 7,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

**Permissions** : Tous les utilisateurs authentifiés

---

### 2. Récupérer un Utilisateur Spécifique

**Endpoint** : `GET /users/:id`

**Headers**
```http
Authorization: Bearer {accessToken}
```

**Exemple**
```
GET /users/00000000-0000-0000-0000-000000000001
```

**Response (200 OK)**
```json
{
  "id": "00000000-0000-0000-0000-000000000001",
  "email": "chrisomgba04@gmail.com",
  "firstName": "Chris",
  "lastName": "Omgba",
  "role": "SUPER_ADMIN",
  "status": "ACTIVE",
  "emailVerified": true,
  "createdAt": "2025-12-13T10:00:00.000Z"
}
```

**Codes de Statut**
- `200` : Utilisateur trouvé
- `404` : Utilisateur introuvable

---

### 3. Créer un Utilisateur

**Endpoint** : `POST /users`

**Headers**
```http
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request Body**
```typescript
interface CreateUserRequest {
  email: string;           // Requis, format email
  firstName: string;       // Requis, min 2 caractères
  lastName: string;        // Requis, min 2 caractères
  role: UserRole;          // Requis
  phoneNumber?: string;    // Optionnel, format international
  username?: string;       // Optionnel, unique
  currentRoomId?: string;  // Optionnel, UUID
}
```

**Exemple**
```json
{
  "email": "newuser@immo360.cm",
  "firstName": "Nouveau",
  "lastName": "Utilisateur",
  "role": "FIELD_AGENT",
  "phoneNumber": "+237690000001"
}
```

**Response (201 Created)**
```json
{
  "status": "success",
  "message": "User created successfully",
  "data": {
    "id": "uuid-generated",
    "email": "newuser@immo360.cm",
    "firstName": "Nouveau",
    "lastName": "Utilisateur",
    "role": "FIELD_AGENT",
    "status": "PENDING_EMAIL_VERIFICATION",
    "emailVerified": false,
    "createdAt": "2025-12-13T11:00:00.000Z"
  }
}
```

**Codes de Statut**
- `201` : Utilisateur créé
- `409` : Email déjà existant
- `422` : Données de validation invalides

**Permissions** : SUPER_ADMIN, ADMIN

---

### 4. Mettre à Jour un Utilisateur

**Endpoint** : `PATCH /users/:id`

**Headers**
```http
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request Body** (tous les champs optionnels)
```typescript
interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  username?: string;
  currentRoomId?: string;
  status?: string;     // SUPER_ADMIN seulement
  role?: UserRole;     // SUPER_ADMIN seulement
}
```

**Exemple**
```json
{
  "firstName": "Chris Updated",
  "phoneNumber": "+237699999999"
}
```

**Response (200 OK)**
```json
{
  "status": "success",
  "message": "User updated successfully",
  "data": {
    "id": "00000000-0000-0000-0000-000000000001",
    "email": "chrisomgba04@gmail.com",
    "firstName": "Chris Updated",
    "lastName": "Omgba",
    "phoneNumber": "+237699999999"
  }
}
```

**Permissions** : Utilisateur lui-même, ou SUPER_ADMIN/ADMIN

---

### 5. Supprimer un Utilisateur (Soft Delete)

**Endpoint** : `DELETE /users/:id`

**Headers**
```http
Authorization: Bearer {accessToken}
```

**Response (200 OK)**
```json
{
  "status": "success",
  "message": "User deleted successfully"
}
```

**Codes de Statut**
- `200` : Suppression réussie
- `404` : Utilisateur introuvable

**Permissions** : SUPER_ADMIN seulement

---

### 6. Assigner une Chambre à un Occupant

**Endpoint** : `PATCH /users/:id/assign-room`

**Headers**
```http
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request Body**
```typescript
interface AssignRoomRequest {
  roomId: string;        // UUID de la chambre
  startDate?: string;    // ISO 8601 date (optionnel)
}
```

**Exemple**
```json
{
  "roomId": "room-uuid-here",
  "startDate": "2025-01-01T00:00:00.000Z"
}
```

**Response (200 OK)**
```json
{
  "status": "success",
  "message": "Room assigned successfully",
  "data": {
    "userId": "00000000-0000-0000-0000-000000000001",
    "currentRoomId": "room-uuid-here"
  }
}
```

---

### 7. Import Excel - Télécharger le Template

**Endpoint** : `GET /users/import/template`

**Headers**
```http
Authorization: Bearer {accessToken}
```

**Response** : Fichier Excel (.xlsx)

**Structure du fichier**

| Colonne | Type | Requis | Exemple |
|---------|------|--------|---------|
| email | String | ✅ | occupant@test.cm |
| firstName | String | ✅ | Jean |
| lastName | String | ✅ | Dupont |
| phoneNumber | String | ❌ | +237690123456 |
| roomNumber | String | ❌ | A101 |
| cin | String | ❌ | 123456789 |

---

### 8. Import Excel - Upload et Validation

**⚠️ CETTE REQUÊTE NÉCESSITE POSTMAN (multipart/form-data)**

**Endpoint** : `POST /users/import/upload`

**Headers**
```http
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data
```

**Body (Postman)**
```
Type: form-data
Key: file
Value: [Sélectionner fichier .xlsx]
```

**Response (200 OK)**
```json
{
  "status": "success",
  "message": "Import completed",
  "summary": {
    "totalRows": 10,
    "successCount": 8,
    "errorCount": 2,
    "errors": [
      {
        "row": 3,
        "email": "invalid-email",
        "error": "Email format invalide"
      }
    ]
  }
}
```

---

### 9. Export Excel - Télécharger les Utilisateurs

**Endpoint** : `GET /users/import/export`

**Headers**
```http
Authorization: Bearer {accessToken}
```

**Query Parameters**
```
?format=xlsx    # ou csv
?role=ADMIN     # Filtrer par rôle (optionnel)
```

**Response** : Fichier Excel (.xlsx) ou CSV

---

## 📊 Historique & Synchronisation

### 1. Récupérer l'Historique Global

**Endpoint** : `GET /history`

**Headers**
```http
Authorization: Bearer {accessToken}
```

**Query Parameters**
```typescript
interface HistoryQueryParams {
  limit?: number;           // Default: 50, Max: 200
  offset?: number;          // Default: 0
  eventType?: string;       // user.created, user.updated, etc.
  sourceService?: string;   // user-service, auth-service
  status?: string;          // SUCCESS, FAILED, PENDING
  startDate?: string;       // ISO 8601
  endDate?: string;         // ISO 8601
  entityType?: string;      // USER, ROOM, etc.
}
```

**Exemples**
```
GET /history
GET /history?limit=100&status=SUCCESS
GET /history?eventType=user.created&startDate=2025-01-01
```

**Response (200 OK)**
```json
{
  "status": "success",
  "data": [
    {
      "id": "log-uuid",
      "eventId": "event-uuid",
      "eventType": "user.created",
      "operationType": "CREATED",
      "sourceService": "user-service",
      "targetServices": ["auth-service", "sync-service"],
      "entityType": "USER",
      "entityId": "user-uuid",
      "status": "SUCCESS",
      "duration": 125,
      "timestamp": "2025-12-13T10:00:00.000Z",
      "userId": "creator-uuid",
      "metadata": {
        "role": "FIELD_AGENT",
        "email": "newuser@immo360.cm"
      }
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 50,
    "offset": 0,
    "hasMore": true,
    "totalPages": 3
  }
}
```

---

### 2. Historique d'une Entité Spécifique

**Endpoint** : `GET /history/entity/:entityId`

**Exemple**
```
GET /history/entity/00000000-0000-0000-0000-000000000001
```

**Response (200 OK)**
```json
{
  "status": "success",
  "entityId": "00000000-0000-0000-0000-000000000001",
  "operations": [
    {
      "id": "log-uuid-1",
      "eventType": "user.created",
      "operationType": "CREATED",
      "status": "SUCCESS",
      "timestamp": "2025-12-13T10:00:00.000Z"
    },
    {
      "id": "log-uuid-2",
      "eventType": "user.updated",
      "operationType": "UPDATED",
      "status": "SUCCESS",
      "timestamp": "2025-12-13T11:00:00.000Z"
    }
  ],
  "count": 2
}
```

---

### 3. Statistiques Globales

**Endpoint** : `GET /history/stats`

**Response (200 OK)**
```json
{
  "status": "success",
  "stats": {
    "totalOperations": 1250,
    "successCount": 1180,
    "failureCount": 50,
    "pendingCount": 20,
    "averageDuration": 95,
    "operationsByType": {
      "CREATED": 500,
      "UPDATED": 600,
      "DELETED": 150
    },
    "operationsByStatus": {
      "SUCCESS": 1180,
      "FAILED": 50,
      "PENDING": 20
    },
    "failureRate": 0.04,
    "lastOperationAt": "2025-12-13T12:00:00.000Z"
  },
  "health": {
    "redisConnected": true,
    "timestamp": "2025-12-13T12:05:00.000Z"
  }
}
```

---

### 4. Export CSV de l'Historique

**Endpoint** : `GET /history/export/csv`

**Query Parameters**
```
?startDate=2025-01-01
?endDate=2025-12-31
?eventType=user.created
```

**Response** : Fichier CSV

---

## 📡 Codes de Statut HTTP

| Code | Signification | Usage |
|------|---------------|-------|
| `200` | OK | Requête réussie |
| `201` | Created | Ressource créée avec succès |
| `204` | No Content | Suppression réussie sans contenu |
| `400` | Bad Request | Requête malformée |
| `401` | Unauthorized | Token manquant ou invalide |
| `403` | Forbidden | Permissions insuffisantes |
| `404` | Not Found | Ressource introuvable |
| `409` | Conflict | Conflit (email déjà existant) |
| `422` | Unprocessable Entity | Validation échouée |
| `429` | Too Many Requests | Rate limit dépassé |
| `500` | Internal Server Error | Erreur serveur |
| `503` | Service Unavailable | Service temporairement indisponible |

---

## ⚠️ Gestion des Erreurs

### Format Standard des Erreurs
```typescript
interface ErrorResponse {
  statusCode: number;
  message: string | string[];  // Peut être un array pour validation
  error: string;
  timestamp?: string;
  path?: string;
}
```

### Exemples d'Erreurs

**Validation (422)**
```json
{
  "statusCode": 422,
  "message": [
    "email must be a valid email",
    "password must be at least 8 characters"
  ],
  "error": "Unprocessable Entity"
}
```

**Non Autorisé (401)**
```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

**Permissions Insuffisantes (403)**
```json
{
  "statusCode": 403,
  "message": "Insufficient permissions to perform this action",
  "error": "Forbidden"
}
```

**Ressource Introuvable (404)**
```json
{
  "statusCode": 404,
  "message": "User not found",
  "error": "Not Found"
}
```

**Conflit (409)**
```json
{
  "statusCode": 409,
  "message": "Email already exists",
  "error": "Conflict"
}
```

---

## 💻 Exemples d'Intégration

### Vue.js 3 (Composition API)
```javascript
// services/authService.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercepteur pour ajouter le token
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur pour gérer le refresh token
apiClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken
        });
        
        localStorage.setItem('accessToken', response.data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
        
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Rediriger vers login
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export const authService = {
  async login(email, password) {
    const response = await apiClient.post('/auth/login', { email, password });
    localStorage.setItem('accessToken', response.data.accessToken);
    localStorage.setItem('refreshToken', response.data.refreshToken);
    return response.data;
  },
  
  async logout() {
    const refreshToken = localStorage.getItem('refreshToken');
    await apiClient.post('/auth/logout', { refreshToken });
    localStorage.clear();
  },
  
  async getProfile() {
    const response = await apiClient.get('/auth/profile');
    return response.data;
  }
};

export const userService = {
  async getUsers(params = {}) {
    const response = await apiClient.get('/users', { params });
    return response.data;
  },
  
  async createUser(userData) {
    const response = await apiClient.post('/users', userData);
    return response.data;
  },
  
  async updateUser(userId, userData) {
    const response = await apiClient.patch(`/users/${userId}`, userData);
    return response.data;
  },
  
  async deleteUser(userId) {
    const response = await apiClient.delete(`/users/${userId}`);
    return response.data;
  }
};
```

**Usage dans un composant Vue**
```vue
<script setup>
import { ref, onMounted } from 'vue';
import { authService, userService } from '@/services/authService';

const users = ref([]);
const loading = ref(false);
const error = ref(null);

const login = async () => {
  try {
    loading.value = true;
    const result = await authService.login('chrisomgba04@gmail.com', 'Password@123');
    console.log('Logged in:', result.user);
  } catch (err) {
    error.value = err.response?.data?.message || 'Login failed';
  } finally {
    loading.value = false;
  }
};

const loadUsers = async () => {
  try {
    loading.value = true;
    const result = await userService.getUsers({ page: 1, limit: 10 });
    users.value = result.data;
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to load users';
  } finally {
    loading.value = false;
  }
};

onMounted(loadUsers);
</script>
```

---

### React (TypeScript)
```typescript
// services/api.ts
import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = 'http://localhost:4000';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.client.interceptors.request.use(config => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.client.interceptors.response.use(
      response => response,
      async error => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            const refreshToken = localStorage.getItem('refreshToken');
            const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
              refreshToken
            });
            
            localStorage.setItem('accessToken', data.accessToken);
            originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
            
            return this.client(originalRequest);
          } catch {
            localStorage.clear();
            window.location.href = '/login';
          }
        }
        
        return Promise.reject(error);
      }
    );
  }

  async login(email: string, password: string) {
    const { data } = await this.client.post('/auth/login', { email, password });
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    return data;
  }

  async getUsers(params?: Record<string, any>) {
    const { data } = await this.client.get('/users', { params });
    return data;
  }

  async createUser(userData: any) {
    const { data } = await this.client.post('/users', userData);
    return data;
  }
}

export const api = new ApiService();
```

---

### Angular 19
```typescript
// services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:4000';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap((response: any) => {
          localStorage.setItem('accessToken', response.accessToken);
          localStorage.setItem('refreshToken', response.refreshToken);
        })
      );
  }

  logout(): Observable<any> {
    const refreshToken = localStorage.getItem('refreshToken');
    return this.http.post(`${this.apiUrl}/auth/logout`, { refreshToken })
      .pipe(
        tap(() => localStorage.clear())
      );
  }

  getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/auth/profile`);
  }
}
```

---

## 🔒 Sécurité & Bonnes Pratiques

### Stockage des Tokens

**✅ Recommandations**
- Utiliser `localStorage` pour les SPAs (Single Page Applications)
- Utiliser `httpOnly cookies` pour les applications SSR (nécessite configuration backend)
- Ne JAMAIS stocker les tokens en texte clair dans le code source

**⚠️ Attention**
- Les tokens expirent : `accessToken` (2h), `refreshToken` (7 jours)
- Implémenter un système de refresh automatique
- Déconnecter l'utilisateur si le refresh échoue

### Rate Limiting

- API Gateway limite : 100 requêtes/minute par IP
- En cas de dépassement : HTTP 429 (Too Many Requests)
- Implémenter un backoff exponentiel en cas d'erreur

### CORS

Les domaines autorisés sont configurés côté backend. Pour le développement local :
- `http://localhost:3000` (React default)
- `http://localhost:5173` (Vite default)
- `http://localhost:4200` (Angular default)

---

## 📞 Support & Contact

**Questions techniques** : chrisomgba04@gmail.com  
**Documentation Backend** : Voir `/docs/architecture.md`  
**Changelog** : Voir `/CHANGELOG.md`

---

**Version** : 1.0.0  
**Dernière mise à jour** : 13 Décembre 2025