# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./
COPY tsconfig*.json ./

# Installer les dépendances
RUN npm ci

# Copier le code source
COPY src ./src

# Build l'application
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Copier les fichiers nécessaires
COPY package*.json ./

# Installer uniquement les dépendances de production
RUN npm ci --only=production

# Copier les fichiers buildés
COPY --from=builder /app/dist ./dist

# Exposer le port
EXPOSE 3004

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:3004/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Démarrer l'application
CMD ["node", "dist/main"]
