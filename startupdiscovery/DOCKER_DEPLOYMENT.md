# Docker Containerization and Cloud Deployment Guide

Complete guide for containerizing and deploying the Next.js application to AWS ECS or Azure App Service.

## Table of Contents

1. [Docker Setup](#docker-setup)
2. [Local Testing](#local-testing)
3. [Cloud Container Registry](#cloud-container-registry)
4. [AWS ECS Deployment](#aws-ecs-deployment)
5. [Azure App Service Deployment](#azure-app-service-deployment)
6. [CI/CD Pipeline](#cicd-pipeline)
7. [Monitoring and Scaling](#monitoring-and-scaling)
8. [Troubleshooting](#troubleshooting)

## Docker Setup

### Dockerfile Architecture

Our multi-stage Dockerfile optimizes for:

- **Small image size**: Using Alpine Linux base (node:18-alpine)
- **Security**: Running as non-root user
- **Production optimization**: Separate build and runtime stages
- **Health checks**: Built-in container health monitoring

**Build Stage** (builder):

- Installs dependencies
- Generates Prisma client
- Builds Next.js application

**Runtime Stage** (runner):

- Minimal production dependencies
- Non-root user execution
- Health check configuration
- Optimized for fast startup

### Files Created

```
.
├── Dockerfile                 # Multi-stage production build
├── .dockerignore             # Excludes unnecessary files
├── docker-compose.yml        # Local development setup
└── .github/workflows/
    ├── deploy-aws-ecs.yml    # AWS ECS CI/CD
    └── deploy-azure-appservice.yml  # Azure CI/CD
```

## Local Testing

### Build and Run Locally

```bash
# Build the Docker image
docker build -t startupdiscovery:latest .

# Run the container
docker run -p 3000:3000 \
  -e DATABASE_URL="your-database-url" \
  -e JWT_SECRET="your-jwt-secret" \
  startupdiscovery:latest

# Access the application
curl http://localhost:3000/api/health
```

### Using Docker Compose

```bash
# Start all services (app + database)
docker-compose up -d

# View logs
docker-compose logs -f nextjs-app

# Stop services
docker-compose down

# Rebuild and start
docker-compose up --build -d
```

### Health Check Verification

```bash
# Check container health
docker ps

# View health check logs
docker inspect --format='{{json .State.Health}}' startupdiscovery-app

# Manual health check
curl http://localhost:3000/api/health
```

Expected response:

```json
{
  "status": "healthy",
  "timestamp": "2026-01-27T...",
  "uptime": 123.456,
  "environment": "production",
  "version": "1.0.0"
}
```

## Cloud Container Registry

### AWS ECR Setup

#### Create ECR Repository

```bash
# Create repository
aws ecr create-repository \
  --repository-name startupdiscovery \
  --region us-east-1

# Get repository URI
aws ecr describe-repositories \
  --repository-names startupdiscovery \
  --query 'repositories[0].repositoryUri' \
  --output text
```

#### Push Image to ECR

```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Tag image
docker tag startupdiscovery:latest \
  <account-id>.dkr.ecr.us-east-1.amazonaws.com/startupdiscovery:latest

# Push to ECR
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/startupdiscovery:latest
```

### Azure ACR Setup

#### Create ACR

```bash
# Create resource group
az group create --name StartupDiscoveryRG --location eastus

# Create container registry
az acr create \
  --resource-group StartupDiscoveryRG \
  --name kalviumregistry \
  --sku Basic

# Enable admin access
az acr update -n kalviumregistry --admin-enabled true

# Get credentials
az acr credential show --name kalviumregistry
```

#### Push Image to ACR

```bash
# Login to ACR
az acr login --name kalviumregistry

# Tag image
docker tag startupdiscovery:latest \
  kalviumregistry.azurecr.io/startupdiscovery:latest

# Push to ACR
docker push kalviumregistry.azurecr.io/startupdiscovery:latest
```

## AWS ECS Deployment

### Prerequisites

- AWS Account with appropriate permissions
- ECR repository created
- VPC with public/private subnets
- Application Load Balancer (optional but recommended)

### Step 1: Create ECS Cluster

```bash
# Create cluster
aws ecs create-cluster \
  --cluster-name startupdiscovery-cluster \
  --region us-east-1

# Verify cluster
aws ecs describe-clusters \
  --clusters startupdiscovery-cluster
```

### Step 2: Create Task Definition

Create `task-definition.json`:

```json
{
  "family": "startupdiscovery-task",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::<account-id>:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::<account-id>:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "startupdiscovery-app",
      "image": "<account-id>.dkr.ecr.us-east-1.amazonaws.com/startupdiscovery:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "PORT",
          "value": "3000"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:<account-id>:secret:prod/app-secrets:DATABASE_URL::"
        },
        {
          "name": "JWT_SECRET",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:<account-id>:secret:prod/app-secrets:JWT_SECRET::"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/startupdiscovery",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": [
          "CMD-SHELL",
          "curl -f http://localhost:3000/api/health || exit 1"
        ],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      }
    }
  ]
}
```

Register task definition:

```bash
aws ecs register-task-definition \
  --cli-input-json file://task-definition.json
```

### Step 3: Create ECS Service

```bash
aws ecs create-service \
  --cluster startupdiscovery-cluster \
  --service-name startupdiscovery-service \
  --task-definition startupdiscovery-task \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx,subnet-yyy],securityGroups=[sg-xxx],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:us-east-1:<account-id>:targetgroup/startupdiscovery-tg/xxx,containerName=startupdiscovery-app,containerPort=3000"
```

### Step 4: Configure Auto Scaling

```bash
# Register scalable target
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --scalable-dimension ecs:service:DesiredCount \
  --resource-id service/startupdiscovery-cluster/startupdiscovery-service \
  --min-capacity 1 \
  --max-capacity 10

# Create scaling policy (CPU-based)
aws application-autoscaling put-scaling-policy \
  --service-namespace ecs \
  --scalable-dimension ecs:service:DesiredCount \
  --resource-id service/startupdiscovery-cluster/startupdiscovery-service \
  --policy-name cpu-scaling-policy \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration file://scaling-policy.json
```

`scaling-policy.json`:

```json
{
  "TargetValue": 70.0,
  "PredefinedMetricSpecification": {
    "PredefinedMetricType": "ECSServiceAverageCPUUtilization"
  },
  "ScaleInCooldown": 300,
  "ScaleOutCooldown": 60
}
```

### Step 5: Verify Deployment

```bash
# Check service status
aws ecs describe-services \
  --cluster startupdiscovery-cluster \
  --services startupdiscovery-service

# View running tasks
aws ecs list-tasks \
  --cluster startupdiscovery-cluster \
  --service-name startupdiscovery-service

# Get load balancer DNS
aws elbv2 describe-load-balancers \
  --names startupdiscovery-alb \
  --query 'LoadBalancers[0].DNSName' \
  --output text
```

## Azure App Service Deployment

### Prerequisites

- Azure Account with appropriate permissions
- Azure Container Registry created
- App Service Plan

### Step 1: Create App Service Plan

```bash
# Create App Service Plan (Linux, Container-based)
az appservice plan create \
  --name startupdiscovery-plan \
  --resource-group StartupDiscoveryRG \
  --is-linux \
  --sku B1

# For production, use higher tier
az appservice plan create \
  --name startupdiscovery-plan-prod \
  --resource-group StartupDiscoveryRG \
  --is-linux \
  --sku P1V2
```

### Step 2: Create Web App

```bash
# Create Web App with container
az webapp create \
  --resource-group StartupDiscoveryRG \
  --plan startupdiscovery-plan \
  --name startupdiscovery \
  --deployment-container-image-name kalviumregistry.azurecr.io/startupdiscovery:latest

# Configure registry credentials
az webapp config container set \
  --name startupdiscovery \
  --resource-group StartupDiscoveryRG \
  --docker-custom-image-name kalviumregistry.azurecr.io/startupdiscovery:latest \
  --docker-registry-server-url https://kalviumregistry.azurecr.io \
  --docker-registry-server-user <acr-username> \
  --docker-registry-server-password <acr-password>
```

### Step 3: Configure Environment Variables

```bash
# Set application settings
az webapp config appsettings set \
  --resource-group StartupDiscoveryRG \
  --name startupdiscovery \
  --settings \
    NODE_ENV=production \
    PORT=3000 \
    WEBSITES_PORT=3000 \
    DATABASE_URL=@Microsoft.KeyVault(SecretUri=https://myvault.vault.azure.net/secrets/DatabaseUrl/) \
    JWT_SECRET=@Microsoft.KeyVault(SecretUri=https://myvault.vault.azure.net/secrets/JwtSecret/)
```

### Step 4: Enable Continuous Deployment

```bash
# Enable continuous deployment from ACR
az webapp deployment container config \
  --name startupdiscovery \
  --resource-group StartupDiscoveryRG \
  --enable-cd true

# Get webhook URL
az webapp deployment container show-cd-url \
  --name startupdiscovery \
  --resource-group StartupDiscoveryRG
```

### Step 5: Configure Auto Scaling

```bash
# Create autoscale setting
az monitor autoscale create \
  --resource-group StartupDiscoveryRG \
  --resource startupdiscovery \
  --resource-type Microsoft.Web/serverfarms \
  --name startupdiscovery-autoscale \
  --min-count 1 \
  --max-count 10 \
  --count 2

# Add CPU-based scaling rule
az monitor autoscale rule create \
  --resource-group StartupDiscoveryRG \
  --autoscale-name startupdiscovery-autoscale \
  --condition "Percentage CPU > 70 avg 5m" \
  --scale out 1

az monitor autoscale rule create \
  --resource-group StartupDiscoveryRG \
  --autoscale-name startupdiscovery-autoscale \
  --condition "Percentage CPU < 30 avg 5m" \
  --scale in 1
```

### Step 6: Verify Deployment

```bash
# Get app URL
az webapp show \
  --name startupdiscovery \
  --resource-group StartupDiscoveryRG \
  --query defaultHostName \
  --output tsv

# Test health endpoint
curl https://startupdiscovery.azurewebsites.net/api/health

# View logs
az webapp log tail \
  --name startupdiscovery \
  --resource-group StartupDiscoveryRG
```

## CI/CD Pipeline

### GitHub Actions Setup

#### Required Secrets

For AWS ECS deployment:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

For Azure App Service deployment:

- `ACR_USERNAME`
- `ACR_PASSWORD`
- `AZURE_CREDENTIALS`

#### Setting Up Secrets

```bash
# GitHub CLI
gh secret set AWS_ACCESS_KEY_ID --body "your-access-key"
gh secret set AWS_SECRET_ACCESS_KEY --body "your-secret-key"

# Or via GitHub UI: Settings → Secrets and variables → Actions
```

#### Azure Credentials

```bash
# Create service principal
az ad sp create-for-rbac \
  --name "startupdiscovery-github-actions" \
  --role contributor \
  --scopes /subscriptions/<subscription-id>/resourceGroups/StartupDiscoveryRG \
  --sdk-auth

# Copy the JSON output to AZURE_CREDENTIALS secret
```

### Pipeline Workflow

Both pipelines follow this flow:

1. **Trigger**: Push to main/production branch or manual dispatch
2. **Checkout**: Clone repository
3. **Authenticate**: Login to cloud provider
4. **Build**: Build Docker image
5. **Push**: Push to container registry (ECR/ACR)
6. **Deploy**: Update service/task definition
7. **Verify**: Check deployment status

### Manual Deployment

```bash
# Trigger GitHub Actions workflow manually
gh workflow run deploy-aws-ecs.yml

# Or via GitHub UI: Actions → Select workflow → Run workflow
```

## Monitoring and Scaling

### AWS CloudWatch Monitoring

```bash
# Create log group
aws logs create-log-group --log-group-name /ecs/startupdiscovery

# View logs
aws logs tail /ecs/startupdiscovery --follow

# Create custom metrics alarm
aws cloudwatch put-metric-alarm \
  --alarm-name startupdiscovery-high-cpu \
  --alarm-description "Alert when CPU exceeds 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2
```

### Azure Monitor

```bash
# Enable Application Insights
az webapp config appsettings set \
  --resource-group StartupDiscoveryRG \
  --name startupdiscovery \
  --settings APPLICATIONINSIGHTS_CONNECTION_STRING="<connection-string>"

# View metrics
az monitor metrics list \
  --resource /subscriptions/<sub-id>/resourceGroups/StartupDiscoveryRG/providers/Microsoft.Web/sites/startupdiscovery \
  --metric "CpuTime"
```

### Container Metrics

Key metrics to monitor:

- **CPU Utilization**: Target < 70% average
- **Memory Utilization**: Target < 80%
- **Request Count**: Track traffic patterns
- **Response Time**: P95 < 500ms
- **Error Rate**: < 1%
- **Health Check Status**: Should be 100% healthy

## Troubleshooting

### Common Issues

#### 1. Container Won't Start

```bash
# Check logs
docker logs <container-id>

# AWS ECS
aws ecs describe-tasks \
  --cluster startupdiscovery-cluster \
  --tasks <task-id>

# Azure
az webapp log tail --name startupdiscovery --resource-group StartupDiscoveryRG
```

**Common Causes**:

- Missing environment variables
- Database connection issues
- Port binding conflicts
- Insufficient memory/CPU

#### 2. Health Check Failures

```bash
# Test health endpoint locally
docker run -p 3000:3000 startupdiscovery:latest
curl http://localhost:3000/api/health

# Check health check configuration
docker inspect <container-id> --format='{{json .State.Health}}'
```

**Solutions**:

- Increase `startPeriod` for slow-starting apps
- Verify health endpoint is accessible
- Check network connectivity

#### 3. Image Pull Errors

```bash
# Verify ECR/ACR credentials
aws ecr get-login-password | docker login --username AWS --password-stdin <ecr-url>
az acr login --name kalviumregistry

# Check task execution role permissions (AWS)
# Check ACR access (Azure)
```

#### 4. Database Connection Issues

**Symptoms**: App starts but can't connect to database

**Solutions**:

- Verify `DATABASE_URL` is correct
- Check security group rules (AWS) or firewall rules (Azure)
- Ensure VPC/subnet configuration allows database access
- Test connection from container:
  ```bash
  docker exec -it <container-id> sh
  nc -zv <db-host> 5432
  ```

#### 5. Out of Memory

```bash
# Increase memory allocation
# AWS: Update task definition CPU/Memory
# Azure: Scale up App Service Plan

# Monitor memory usage
docker stats <container-id>
```

### Performance Optimization

1. **Image Size**: Current image ~150MB (Alpine + Next.js)
2. **Cold Start**: ~3-5 seconds average
3. **Health Check**: 30s interval, 40s start period
4. **Resource Sizing**:
   - Development: 256 CPU, 512 MB
   - Production: 512 CPU, 1024 MB

### Scaling Strategies

| Metric   | Scale Out Threshold | Scale In Threshold |
| -------- | ------------------- | ------------------ |
| CPU      | > 70% (5 min)       | < 30% (5 min)      |
| Memory   | > 80% (5 min)       | < 40% (5 min)      |
| Requests | > 1000/min          | < 200/min          |

## Deployment Checklist

- [ ] Dockerfile created and tested locally
- [ ] .dockerignore configured
- [ ] Health check endpoint implemented
- [ ] Environment variables configured
- [ ] Container registry created (ECR/ACR)
- [ ] Image pushed to registry
- [ ] Task definition/App Service created
- [ ] Auto-scaling configured
- [ ] CI/CD pipeline set up
- [ ] Monitoring and alerts configured
- [ ] Load balancer configured (if applicable)
- [ ] SSL/TLS certificate configured
- [ ] Database migrations applied
- [ ] Secrets management configured
- [ ] Logs aggregation set up

## Next Steps

1. Set up custom domain and SSL certificate
2. Configure CDN (CloudFront/Azure CDN)
3. Implement blue-green deployment
4. Set up centralized logging
5. Configure backup and disaster recovery
6. Implement cost optimization strategies

## Resources

- [AWS ECS Documentation](https://docs.aws.amazon.com/ecs/)
- [Azure App Service Documentation](https://docs.microsoft.com/en-us/azure/app-service/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
