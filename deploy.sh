#!/bin/bash

# Deployment script for NurseNotes application
# Usage: ./deploy.sh [staging|production]

ENVIRONMENT=${1:-production}
APP_NAME="nursenotes"
DOCKER_REGISTRY="ghcr.io"
REPO_NAME="${DOCKER_REGISTRY}/$(git config remote.origin.url | sed 's/.*\/\([^\/]*\)\.git/\1/')"

echo "Deploying to $ENVIRONMENT environment..."

# Pull latest image
echo "Pulling latest Docker image..."
docker pull $REPO_NAME:latest

# Stop existing containers
echo "Stopping existing containers..."
docker-compose down

# Start new containers
echo "Starting new containers..."
NODE_ENV=production docker-compose up -d

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
