# Deployment Guide

This guide covers deploying the NurseNotes application using Docker and CI/CD.

## Prerequisites

- Docker and Docker Compose installed
- Server with SSH access
- GitHub repository with the code

## Environment Setup

### 1. Create Environment Variables

Copy the example environment file:
```bash
cp .env.example .env.production
```

Edit `.env.production` with your actual values:
- Auth0 credentials
- API keys (Google AI, Mistral, OpenAI, AssemblyAI)
- Twilio credentials
- Email configuration
- Database URL

### 2. GitHub Secrets

Add these secrets to your GitHub repository:

#### For CI/CD:
- `GITHUB_TOKEN` (automatically provided)
- `DEPLOY_HOST` - Your server IP/hostname
- `DEPLOY_USER` - SSH username for deployment
- `DEPLOY_SSH_KEY` - Private SSH key for server access

#### For Application:
- `AUTH0_SECRET`
- `AUTH0_CLIENT_SECRET`
- `GOOGLE_GENERATIVE_AI_API_KEY`
- `MISTRAL_API_KEY`
- `OPENAI_API_KEY`
- `ASSEMBLYAI_API_KEY`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `EMAIL_PASS`
- `DATABASE_URL`

## Deployment Methods

### Method 1: GitHub Actions (Recommended)

1. Push to main branch
2. GitHub Actions will:
   - Run tests
   - Build Docker image
   - Push to GitHub Container Registry
   - Deploy to production server

### Method 2: Manual Deployment

1. Build and push Docker image:
```bash
docker build -t ghcr.io/yourusername/nursenotes:latest .
docker push ghcr.io/yourusername/nursenotes:latest
```

2. Deploy to server:
```bash
./deploy.sh production
```

## Server Setup

### 1. Install Docker and Docker Compose

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. Create Deployment Directory

```bash
sudo mkdir -p /opt/app
sudo chown $USER:$USER /opt/app
cd /opt/app
```

### 3. Copy Files to Server

Copy these files to `/opt/app`:
- `docker-compose.yml`
- `nginx.conf`
- `.env.production`

### 4. Configure Firewall

```bash
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

## SSL/HTTPS Setup (Optional)

1. Get SSL certificate (Let's Encrypt recommended):
```bash
sudo apt install certbot
sudo certbot certonly --standalone -d your-domain.com
```

2. Copy certificates to `ssl/` directory
3. Uncomment SSL section in `nginx.conf`
4. Update `server_name` in nginx.conf

## Monitoring

### Check Application Status
```bash
docker-compose ps
docker-compose logs app
```

### Health Check
```bash
curl http://localhost:3000/api/health
```

## Troubleshooting

### Common Issues

1. **Port conflicts**: Make sure ports 80, 443, 3000 are free
2. **Environment variables**: Verify all required variables are set
3. **Database connection**: Check DATABASE_URL format and accessibility
4. **SSL certificates**: Ensure proper file paths and permissions

### Logs

View application logs:
```bash
docker-compose logs -f app
```

View nginx logs:
```bash
docker-compose logs -f nginx
```

## CI/CD Workflow

The GitHub Actions workflow:
1. **Test**: Runs linting and tests
2. **Build**: Creates Docker image with multi-stage build
3. **Push**: Uploads to GitHub Container Registry
4. **Deploy**: Updates production server via SSH

## Production Optimizations

- Enable nginx caching
- Set up database backups
- Configure monitoring (Prometheus/Grafana)
- Implement log rotation
- Use CDN for static assets

## Rollback

To rollback to previous version:
```bash
docker-compose pull ghcr.io/yourusername/nursenotes:previous-tag
docker-compose up -d
```
