# Club Corra Production Deployment Guide

## 📋 Overview

This guide provides comprehensive instructions for deploying the Club Corra application stack to production:

- **Backend API**: Deployed on AWS EC2 with HTTPS, nginx, and PostgreSQL
- **Admin App**: Deployed on Vercel with custom domain support
- **Webapp**: Deployed on Vercel with custom domain support

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Admin App     │    │    Webapp       │    │   Backend API   │
│   (Vercel)      │    │   (Vercel)      │    │     (EC2)       │
│                 │    │                 │    │                 │
│ admin.clubcorra │    │ clubcorra.com   │    │ api.clubcorra   │
│                 │    │                 │    │                 │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────┴─────────────┐
                    │      PostgreSQL DB        │
                    │        (EC2)              │
                    └───────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

1. **AWS EC2 Instance** (t3.small or larger)
2. **Vercel Account** with CLI installed
3. **Domain Names** for your applications
4. **SSL Certificates** (handled automatically)

### 1. Backend API Deployment (EC2)

```bash
# Clone the repository
git clone https://github.com/your-org/club-corra-pilot-2.git
cd club-corra-pilot-2

# Make scripts executable
chmod +x scripts/deployment/*.sh

# Deploy backend with domain and email
./scripts/deployment/deploy-production-ec2-complete.sh \
  --domain api.clubcorra.com \
  --email admin@clubcorra.com
```

### 2. Admin App Deployment (Vercel)

```bash
# Deploy admin app
./scripts/deployment/deploy-vercel-admin.sh \
  --project-name club-corra-admin \
  --api-url https://api.clubcorra.com/api/v1 \
  --ws-url wss://api.clubcorra.com \
  --domain admin.clubcorra.com
```

### 3. Webapp Deployment (Vercel)

```bash
# Deploy webapp
./scripts/deployment/deploy-vercel-webapp.sh \
  --project-name club-corra-webapp \
  --api-url https://api.clubcorra.com/api/v1 \
  --ws-url wss://api.clubcorra.com \
  --domain clubcorra.com
```

## 📁 Scripts Overview

### Backend Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `deploy-production-ec2-complete.sh` | Complete EC2 deployment with HTTPS | `./deploy-production-ec2-complete.sh --domain api.example.com --email admin@example.com` |
| `deploy-production-ec2-optimized.sh` | Optimized deployment for small instances | `./deploy-production-ec2-optimized.sh` |
| `setup-https-backend.sh` | HTTPS and SSL setup only | `sudo ./setup-https-backend.sh` |
| `setup-log-rotation.sh` | Log management and monitoring | `./setup-log-rotation.sh --setup` |

### Frontend Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `deploy-vercel-admin.sh` | Deploy admin app to Vercel | `./deploy-vercel-admin.sh --project-name my-admin` |
| `deploy-vercel-webapp.sh` | Deploy webapp to Vercel | `./deploy-vercel-webapp.sh --project-name my-webapp` |

## 🔧 Detailed Setup Instructions

### Backend API Setup (EC2)

#### Step 1: Prepare EC2 Instance

1. **Launch EC2 Instance**:
   - Instance Type: t3.small (minimum) or t3.medium (recommended)
   - OS: Amazon Linux 2023
   - Storage: 20GB minimum
   - Security Group: Allow SSH (22), HTTP (80), HTTPS (443)

2. **Connect to Instance**:
   ```bash
   ssh -i your-key.pem ec2-user@your-ec2-ip
   ```

3. **Clone Repository**:
   ```bash
   git clone https://github.com/your-org/club-corra-pilot-2.git
   cd club-corra-pilot-2
   ```

#### Step 2: Run Complete Deployment

```bash
# Make script executable
chmod +x scripts/deployment/deploy-production-ec2-complete.sh

# Run deployment with your domain and email
./scripts/deployment/deploy-production-ec2-complete.sh \
  --domain api.clubcorra.com \
  --email admin@clubcorra.com
```

This script will:
- ✅ Install Node.js 20, nginx, PostgreSQL
- ✅ Set up SSL certificates with Let's Encrypt
- ✅ Configure nginx reverse proxy
- ✅ Set up firewall rules
- ✅ Create production environment file
- ✅ Build and deploy the API
- ✅ Set up systemd service
- ✅ Run database migrations
- ✅ Start all services

#### Step 3: Configure Environment Variables

Edit the production environment file:

```bash
sudo nano /opt/club-corra-api/.env
```

Update these critical variables:

```bash
# Database Configuration
DATABASE_URL=postgresql://clubcorra:your-secure-password@localhost:5432/club_corra_production

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
S3_BUCKET_NAME=club-corra-uploads

# JWT Secret (already generated)
JWT_SECRET=your-generated-jwt-secret
```

#### Step 4: Verify Backend Deployment

```bash
# Check service status
sudo systemctl status club-corra-api

# Check API health
curl https://api.clubcorra.com/api/v1/health

# View logs
sudo journalctl -u club-corra-api -f
```

### Admin App Setup (Vercel)

#### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

#### Step 2: Deploy Admin App

```bash
# Navigate to project root
cd club-corra-pilot-2

# Deploy admin app
./scripts/deployment/deploy-vercel-admin.sh \
  --project-name club-corra-admin \
  --api-url https://api.clubcorra.com/api/v1 \
  --ws-url wss://api.clubcorra.com \
  --domain admin.clubcorra.com
```

This script will:
- ✅ Check prerequisites (Vercel CLI)
- ✅ Create Vercel configuration
- ✅ Set up Vercel project
- ✅ Configure environment variables
- ✅ Deploy to Vercel
- ✅ Set up custom domain
- ✅ Verify deployment

#### Step 3: Configure Custom Domain

1. **Update DNS Records**:
   - Add CNAME record: `admin.clubcorra.com` → `cname.vercel-dns.com`

2. **Verify Domain in Vercel**:
   ```bash
   vercel domains ls
   ```

### Webapp Setup (Vercel)

#### Step 1: Deploy Webapp

```bash
# Deploy webapp
./scripts/deployment/deploy-vercel-webapp.sh \
  --project-name club-corra-webapp \
  --api-url https://api.clubcorra.com/api/v1 \
  --ws-url wss://api.clubcorra.com \
  --domain clubcorra.com
```

#### Step 2: Configure Custom Domain

1. **Update DNS Records**:
   - Add CNAME record: `clubcorra.com` → `cname.vercel-dns.com`
   - Add CNAME record: `www.clubcorra.com` → `cname.vercel-dns.com`

## 🔐 Security Configuration

### Backend Security

The EC2 deployment includes:

- ✅ **SSL/TLS Encryption** with Let's Encrypt
- ✅ **Firewall Rules** (only necessary ports open)
- ✅ **Security Headers** (HSTS, X-Frame-Options, etc.)
- ✅ **Rate Limiting** (10 requests/second)
- ✅ **CORS Configuration** (restricted origins)
- ✅ **JWT Authentication** with secure secrets

### Frontend Security

The Vercel deployment includes:

- ✅ **HTTPS Enforcement**
- ✅ **Content Security Policy**
- ✅ **Security Headers**
- ✅ **Frame Protection**
- ✅ **XSS Protection**

## 📊 Monitoring and Logging

### Backend Monitoring

```bash
# View service logs
sudo journalctl -u club-corra-api -f

# View nginx logs
sudo journalctl -u nginx -f

# Check resource usage
htop
df -h
free -h

# Monitor API endpoints
curl https://api.clubcorra.com/api/v1/health
```

### Frontend Monitoring

```bash
# View Vercel logs
vercel logs

# Check deployment status
vercel ls

# Monitor performance
# Use Vercel Analytics dashboard
```

## 🔄 CI/CD Setup

### GitHub Actions (Recommended)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to EC2
        run: |
          # Add your EC2 deployment commands here
          echo "Deploying backend to EC2..."

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        run: |
          npm install -g vercel
          vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
```

### Environment Variables for CI/CD

Set these secrets in your GitHub repository:

- `VERCEL_TOKEN`: Your Vercel API token
- `EC2_HOST`: Your EC2 instance IP
- `EC2_SSH_KEY`: Your SSH private key

## 🛠️ Troubleshooting

### Common Backend Issues

#### 1. Service Won't Start

```bash
# Check service status
sudo systemctl status club-corra-api

# View detailed logs
sudo journalctl -u club-corra-api -n 50

# Check configuration
sudo systemctl cat club-corra-api
```

#### 2. SSL Certificate Issues

```bash
# Check certificate status
sudo certbot certificates

# Renew certificates
sudo certbot renew

# Check nginx configuration
sudo nginx -t
```

#### 3. Database Connection Issues

```bash
# Check PostgreSQL status
sudo systemctl status postgresql-15

# Test database connection
sudo -u postgres psql -c "SELECT version();"

# Check database exists
sudo -u postgres psql -c "\l"
```

### Common Frontend Issues

#### 1. Build Failures

```bash
# Check build logs
vercel logs

# Test build locally
cd apps/admin
yarn build
```

#### 2. Environment Variable Issues

```bash
# List environment variables
vercel env ls

# Add missing variables
vercel env add VARIABLE_NAME production
```

#### 3. Domain Issues

```bash
# Check domain status
vercel domains ls

# Verify DNS records
nslookup your-domain.com
```

## 📈 Performance Optimization

### Backend Optimization

1. **Enable Gzip Compression** (already configured)
2. **Set up Redis Caching** (optional)
3. **Configure CDN** for static assets
4. **Monitor Resource Usage**

### Frontend Optimization

1. **Enable Vercel Analytics**
2. **Optimize Images** with Next.js Image component
3. **Enable Edge Functions** for API routes
4. **Set up Performance Monitoring**

## 🔄 Backup and Recovery

### Database Backups

```bash
# Create backup
sudo -u postgres pg_dump club_corra_production > backup_$(date +%Y%m%d).sql

# Restore backup
sudo -u postgres psql club_corra_production < backup_20240101.sql
```

### Application Backups

```bash
# Backup application files
sudo tar -czf app_backup_$(date +%Y%m%d).tar.gz /opt/club-corra-api

# Backup configuration
sudo tar -czf config_backup_$(date +%Y%m%d).tar.gz /etc/nginx /etc/letsencrypt
```

## 📞 Support and Maintenance

### Regular Maintenance Tasks

1. **Weekly**:
   - Check service status
   - Review logs for errors
   - Monitor resource usage

2. **Monthly**:
   - Update system packages
   - Renew SSL certificates
   - Test backup restoration

3. **Quarterly**:
   - Security audit
   - Performance review
   - Disaster recovery test

### Emergency Procedures

1. **Service Down**:
   ```bash
   sudo systemctl restart club-corra-api
   sudo systemctl restart nginx
   ```

2. **High Resource Usage**:
   ```bash
   # Check processes
   top
   # Restart services
   sudo systemctl restart club-corra-api
   ```

3. **SSL Certificate Expired**:
   ```bash
   sudo certbot renew
   sudo systemctl reload nginx
   ```

## 📚 Additional Resources

### Documentation

- [EC2 Deployment Guide](EC2_DEPLOYMENT_GUIDE.md)
- [Vercel Environment Setup](vercel-env-setup.md)
- [Troubleshooting Guide](TROUBLESHOOTING.md)
- [Backend Environment Variables](backend.env.example)

### External Resources

- [Vercel Documentation](https://vercel.com/docs)
- [AWS EC2 Documentation](https://docs.aws.amazon.com/ec2/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Nginx Documentation](https://nginx.org/en/docs/)

---

## 🎯 Quick Reference

### Essential Commands

```bash
# Backend
sudo systemctl status club-corra-api
sudo journalctl -u club-corra-api -f
curl https://api.clubcorra.com/api/v1/health

# Frontend
vercel ls
vercel logs
vercel env ls

# Database
sudo -u postgres psql club_corra_production
sudo -u postgres pg_dump club_corra_production > backup.sql
```

### Important URLs

- **Backend API**: https://api.clubcorra.com/api/v1
- **Admin App**: https://admin.clubcorra.com
- **Webapp**: https://clubcorra.com
- **Vercel Dashboard**: https://vercel.com/dashboard
- **AWS Console**: https://console.aws.amazon.com

---

*This guide covers the complete production deployment process for the Club Corra application stack. For additional support or questions, refer to the troubleshooting section or contact the DevOps team.*

