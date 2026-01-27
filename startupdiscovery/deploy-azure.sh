#!/bin/bash

# Azure App Service Deployment Script
# This script automates the deployment of the Next.js application to Azure App Service

set -e

# Configuration
RESOURCE_GROUP=${RESOURCE_GROUP:-"StartupDiscoveryRG"}
ACR_NAME=${ACR_NAME:-"kalviumregistry"}
APP_NAME=${APP_NAME:-"startupdiscovery"}
IMAGE_NAME="startupdiscovery"
IMAGE_TAG=${IMAGE_TAG:-"latest"}

echo "🚀 Starting Azure App Service deployment..."

# Step 1: Build Docker image
echo "📦 Building Docker image..."
docker build -t ${IMAGE_NAME}:${IMAGE_TAG} .

# Step 2: Login to ACR
echo "🔐 Logging in to Azure Container Registry..."
az acr login --name ${ACR_NAME}

# Step 3: Tag image
echo "🏷️  Tagging image..."
docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${ACR_NAME}.azurecr.io/${IMAGE_NAME}:${IMAGE_TAG}
docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${ACR_NAME}.azurecr.io/${IMAGE_NAME}:latest

# Step 4: Push to ACR
echo "⬆️  Pushing image to ACR..."
docker push ${ACR_NAME}.azurecr.io/${IMAGE_NAME}:${IMAGE_TAG}
docker push ${ACR_NAME}.azurecr.io/${IMAGE_NAME}:latest

# Step 5: Update App Service
echo "♻️  Updating App Service..."
az webapp config container set \
  --name ${APP_NAME} \
  --resource-group ${RESOURCE_GROUP} \
  --docker-custom-image-name ${ACR_NAME}.azurecr.io/${IMAGE_NAME}:${IMAGE_TAG}

# Step 6: Restart App Service
echo "🔄 Restarting App Service..."
az webapp restart \
  --name ${APP_NAME} \
  --resource-group ${RESOURCE_GROUP}

# Step 7: Wait for restart
echo "⏳ Waiting for service to start..."
sleep 30

# Step 8: Get app info
echo "📊 App Service information:"
az webapp show \
  --name ${APP_NAME} \
  --resource-group ${RESOURCE_GROUP} \
  --query '[name, state, defaultHostName]' \
  --output table

# Step 9: Test health endpoint
APP_URL=$(az webapp show \
  --name ${APP_NAME} \
  --resource-group ${RESOURCE_GROUP} \
  --query defaultHostName \
  --output tsv)

echo "🏥 Testing health endpoint..."
curl -f https://${APP_URL}/api/health || echo "Health check failed!"

echo "🎉 Deployment complete!"
echo "🌐 Application URL: https://${APP_URL}"
