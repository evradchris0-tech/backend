#!/bin/bash

# Build all microservices Docker images
# Usage: ./scripts/docker-build-all.sh

set -e

echo "🐳 Building all IMMO360 microservices Docker images..."
echo ""

SERVICES=(
  "api-gateway"
  "auth-service"
  "user-service"
  "infrastructure-service"
  "equipment-service"
  "incidents-service"
  "audit-service"
  "analytics-service"
  "notifications-service"
  "file-storage-service"
  "import-export-service"
  "sync-service"
  "predictions-service"
)

for service in "${SERVICES[@]}"; do
  echo "📦 Building $service..."
  docker build -t immo360/$service:latest ./services/$service
  echo "✅ $service built successfully"
  echo ""
done

echo "🎉 All microservices built successfully!"
echo ""
echo "To start all services:"
echo "  docker-compose -f docker-compose.global.yml up -d"
