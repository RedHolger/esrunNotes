#!/bin/bash

# Deployment script for NurseNotes application
# Usage: ./deploy.sh [staging|production]

set -euo pipefail

ENVIRONMENT=${1:-production}
APP_NAME="nursenotes"
DOCKER_REGISTRY="ghcr.io"
REPO_OWNER="$(git config --get remote.origin.url | sed -E 's#.*[:/]([^/]+)/([^/]+)\.git#\1#' | tr '[:upper:]' '[:lower:]')"
REPO_NAME_ONLY="$(git config --get remote.origin.url | sed -E 's#.*[:/]([^/]+)/([^/]+)\.git#\2#' | tr '[:upper:]' '[:lower:]')"
REPO_NAME="${DOCKER_REGISTRY}/${REPO_OWNER}/${REPO_NAME_ONLY}"

echo "Deploying to $ENVIRONMENT environment..."
echo "Using image: $REPO_NAME:latest"

# Pull latest image
echo "Pulling latest Docker image..."
docker pull $REPO_NAME:latest

# Stop existing containers
echo "Stopping existing containers..."
docker-compose down

# Start new containers
echo "Starting new containers..."
IMAGE_NAME="$REPO_NAME:latest" NODE_ENV=production docker-compose up -d

# Wait for application to be healthy
echo "Waiting for application to be ready..."
sleep 10

# Check if application is running
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "✅ Deployment successful!"
    echo "Application is running at http://localhost:3000"
else
    echo "❌ Deployment failed - application not responding"
    docker-compose logs app
    exit 1
fi

# Clean up old images
echo "Cleaning up old Docker images..."
docker system prune -f

echo "Deployment completed!"
