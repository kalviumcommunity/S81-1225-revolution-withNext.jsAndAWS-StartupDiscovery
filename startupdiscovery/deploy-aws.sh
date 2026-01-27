#!/bin/bash

# AWS ECS Deployment Script
# This script automates the deployment of the Next.js application to AWS ECS

set -e

# Configuration
AWS_REGION=${AWS_REGION:-"us-east-1"}
AWS_ACCOUNT_ID=${AWS_ACCOUNT_ID}
ECR_REPOSITORY="startupdiscovery"
ECS_CLUSTER="startupdiscovery-cluster"
ECS_SERVICE="startupdiscovery-service"
ECS_TASK_FAMILY="startupdiscovery-task"
IMAGE_TAG=${IMAGE_TAG:-"latest"}

echo "🚀 Starting AWS ECS deployment..."

# Step 1: Build Docker image
echo "📦 Building Docker image..."
docker build -t ${ECR_REPOSITORY}:${IMAGE_TAG} .

# Step 2: Login to ECR
echo "🔐 Logging in to Amazon ECR..."
aws ecr get-login-password --region ${AWS_REGION} | \
  docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com

# Step 3: Tag image
echo "🏷️  Tagging image..."
docker tag ${ECR_REPOSITORY}:${IMAGE_TAG} \
  ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY}:${IMAGE_TAG}

docker tag ${ECR_REPOSITORY}:${IMAGE_TAG} \
  ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY}:latest

# Step 4: Push to ECR
echo "⬆️  Pushing image to ECR..."
docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY}:${IMAGE_TAG}
docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY}:latest

# Step 5: Update task definition
echo "📝 Updating ECS task definition..."
TASK_DEFINITION=$(aws ecs describe-task-definition \
  --task-definition ${ECS_TASK_FAMILY} \
  --region ${AWS_REGION} \
  --query 'taskDefinition' \
  --output json)

NEW_TASK_DEF=$(echo $TASK_DEFINITION | jq --arg IMAGE "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY}:${IMAGE_TAG}" \
  '.containerDefinitions[0].image = $IMAGE | del(.taskDefinitionArn, .revision, .status, .requiresAttributes, .compatibilities, .registeredAt, .registeredBy)')

echo $NEW_TASK_DEF > new-task-definition.json

aws ecs register-task-definition \
  --region ${AWS_REGION} \
  --cli-input-json file://new-task-definition.json

# Step 6: Update service
echo "♻️  Updating ECS service..."
aws ecs update-service \
  --cluster ${ECS_CLUSTER} \
  --service ${ECS_SERVICE} \
  --task-definition ${ECS_TASK_FAMILY} \
  --force-new-deployment \
  --region ${AWS_REGION}

# Step 7: Wait for deployment
echo "⏳ Waiting for service to stabilize..."
aws ecs wait services-stable \
  --cluster ${ECS_CLUSTER} \
  --services ${ECS_SERVICE} \
  --region ${AWS_REGION}

echo "✅ Deployment completed successfully!"

# Step 8: Get service info
echo "📊 Service information:"
aws ecs describe-services \
  --cluster ${ECS_CLUSTER} \
  --services ${ECS_SERVICE} \
  --region ${AWS_REGION} \
  --query 'services[0].[serviceName, status, desiredCount, runningCount]' \
  --output table

# Clean up
rm -f new-task-definition.json

echo "🎉 Deployment complete!"
