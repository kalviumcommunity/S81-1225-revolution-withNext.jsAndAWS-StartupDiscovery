# Container Deployment Quick Start

Fast-track guide for building and deploying the containerized application.

## Prerequisites Checklist

- [ ] Docker installed and running
- [ ] AWS CLI configured (for AWS deployment) OR Azure CLI (for Azure deployment)
- [ ] Cloud account with appropriate permissions
- [ ] Container registry created (ECR or ACR)

## Local Testing (5 minutes)

### Build and Run

```bash
# 1. Build Docker image
docker build -t startupdiscovery:latest .

# 2. Run container
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e JWT_SECRET="your-secret" \
  --name startupdiscovery-app \
  startupdiscovery:latest

# 3. Test application
curl http://localhost:3000/api/health
```

### Using Docker Compose

```bash
# Start all services (app + database)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## AWS ECS Deployment

### Quick Deploy (Automated)

```bash
# Set environment variables
export AWS_ACCOUNT_ID=123456789012
export AWS_REGION=us-east-1

# Run deployment script
chmod +x deploy-aws.sh
./deploy-aws.sh
```

### Manual Deploy Steps

```bash
# 1. Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# 2. Tag and push image
docker tag startupdiscovery:latest \
  $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/startupdiscovery:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/startupdiscovery:latest

# 3. Update ECS service
aws ecs update-service \
  --cluster startupdiscovery-cluster \
  --service startupdiscovery-service \
  --force-new-deployment
```

## Azure App Service Deployment

### Quick Deploy (Automated)

```bash
# Set environment variables
export RESOURCE_GROUP=StartupDiscoveryRG
export ACR_NAME=kalviumregistry
export APP_NAME=startupdiscovery

# Run deployment script
chmod +x deploy-azure.sh
./deploy-azure.sh
```

### Manual Deploy Steps

```bash
# 1. Login to ACR
az acr login --name kalviumregistry

# 2. Tag and push image
docker tag startupdiscovery:latest \
  kalviumregistry.azurecr.io/startupdiscovery:latest
docker push kalviumregistry.azurecr.io/startupdiscovery:latest

# 3. Update App Service
az webapp config container set \
  --name startupdiscovery \
  --resource-group StartupDiscoveryRG \
  --docker-custom-image-name kalviumregistry.azurecr.io/startupdiscovery:latest
```

## CI/CD Pipeline

### GitHub Actions Setup

1. Navigate to: **Settings → Secrets and variables → Actions**

2. Add secrets:
   - For AWS: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
   - For Azure: `ACR_USERNAME`, `ACR_PASSWORD`, `AZURE_CREDENTIALS`

3. Push to `main` branch to trigger deployment

### Manual Trigger

```bash
# Via GitHub CLI
gh workflow run deploy-aws-ecs.yml
# or
gh workflow run deploy-azure-appservice.yml
```

## Verification

### Check Deployment Status

```bash
# AWS ECS
aws ecs describe-services \
  --cluster startupdiscovery-cluster \
  --services startupdiscovery-service

# Azure App Service
az webapp show \
  --name startupdiscovery \
  --resource-group StartupDiscoveryRG
```

### Test Application

```bash
# AWS (replace with your load balancer URL)
curl http://your-alb-url.us-east-1.elb.amazonaws.com/api/health

# Azure
curl https://startupdiscovery.azurewebsites.net/api/health
```

## Common Commands

### Docker

```bash
# Build image
docker build -t startupdiscovery:latest .

# Run container
docker run -p 3000:3000 startupdiscovery:latest

# View logs
docker logs -f <container-id>

# Stop container
docker stop <container-id>

# Remove container
docker rm <container-id>

# View running containers
docker ps

# View images
docker images
```

### AWS CLI

```bash
# List ECS clusters
aws ecs list-clusters

# List services
aws ecs list-services --cluster startupdiscovery-cluster

# View service details
aws ecs describe-services \
  --cluster startupdiscovery-cluster \
  --services startupdiscovery-service

# View task logs
aws logs tail /ecs/startupdiscovery --follow
```

### Azure CLI

```bash
# List App Services
az webapp list --resource-group StartupDiscoveryRG

# View app details
az webapp show \
  --name startupdiscovery \
  --resource-group StartupDiscoveryRG

# View logs
az webapp log tail \
  --name startupdiscovery \
  --resource-group StartupDiscoveryRG

# Restart app
az webapp restart \
  --name startupdiscovery \
  --resource-group StartupDiscoveryRG
```

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker logs <container-id>

# Run interactive shell
docker exec -it <container-id> sh

# Test locally
docker run -it startupdiscovery:latest sh
```

### Health Check Fails

```bash
# Test health endpoint locally
curl http://localhost:3000/api/health

# Check container health
docker inspect --format='{{json .State.Health}}' <container-id>
```

### Database Connection Issues

```bash
# Test from container
docker exec -it <container-id> sh
nc -zv your-db-host 5432

# Check environment variables
docker inspect <container-id> | grep -A 20 Env
```

## Performance Metrics

| Metric                    | Value                      |
| ------------------------- | -------------------------- |
| **Image Size**            | ~150MB (Alpine-based)      |
| **Build Time**            | ~2-3 minutes               |
| **Cold Start**            | ~3-5 seconds               |
| **Health Check Interval** | 30 seconds                 |
| **Memory Usage**          | ~200-400MB                 |
| **CPU Usage**             | <10% idle, ~50% under load |

## Next Steps

1. ✅ Local Docker testing
2. ✅ Push to container registry
3. ✅ Deploy to cloud (ECS or App Service)
4. ✅ Configure CI/CD pipeline
5. ⏭️ Set up monitoring and alerts
6. ⏭️ Configure auto-scaling
7. ⏭️ Add custom domain and SSL

## Resources

- [Full Deployment Guide](./DOCKER_DEPLOYMENT.md)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [AWS ECS Documentation](https://docs.aws.amazon.com/ecs/)
- [Azure App Service Documentation](https://docs.microsoft.com/en-us/azure/app-service/)
