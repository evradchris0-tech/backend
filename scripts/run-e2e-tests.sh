#!/bin/bash

# Run E2E tests against running services
# Usage: ./scripts/run-e2e-tests.sh

set -e

echo "🧪 Running E2E tests for IMMO360..."
echo ""

# Check if services are running
echo "📡 Checking if services are running..."
if ! curl -s http://localhost:4000/health > /dev/null; then
  echo "❌ API Gateway is not running!"
  echo "Please start the services first:"
  echo "  docker-compose -f docker-compose.global.yml up -d"
  exit 1
fi

echo "✅ Services are running"
echo ""

# Navigate to tests directory
cd tests/e2e

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "📦 Installing E2E test dependencies..."
  npm install
  echo ""
fi

# Run tests
echo "🧪 Running E2E tests..."
npm test

echo ""
echo "✅ E2E tests completed!"
