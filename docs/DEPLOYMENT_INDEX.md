# Deployment Index for Cursor Agent

## Deployment Scripts (`/scripts/deployment/`)

### Core Deployment Scripts
- `deploy-production-ec2.sh` - Main production deployment script
- `deploy-production-ec2-optimized.sh` - Optimized deployment for 8GB EC2
- `deploy-complete.sh` - Complete deployment workflow
- `8GB_EC2_DEPLOYMENT_OPTIMIZED.md` - Optimized deployment guide

### Service Management Scripts
- `club-corra-api.service` - Systemd service configuration
- `setup-api-service.sh` - API service setup
- `monitor-backend.sh` - Backend monitoring and health checks

### SSL and Security Scripts
- `setup-https-backend.sh` - HTTPS configuration
- `setup-log-rotation.sh` - Log rotation setup

### Environment and Configuration
- `backend.env.example` - Backend environment variables template
- `setup-vercel-env.sh` - Vercel environment setup
- `vercel-env-setup.md` - Vercel environment documentation

### S3 and Storage Scripts
- `s3-setup.sh` - S3 bucket configuration
- `s3-bucket-policy.json` - S3 bucket policy
- `s3-cors-policy.json` - S3 CORS policy
- `test-s3-access.sh` - S3 access testing

### Troubleshooting and Maintenance
- `TROUBLESHOOTING.md` - Common issues and solutions
- `QUICK_REFERENCE.md` - Quick deployment reference
- `cleanup-disk-space.sh` - Disk space cleanup
- `fix-build-issues.sh` - Build issue resolution
- `fix-crypto-js-correct.sh` - Crypto.js issue fixes
- `fix-crypto-js-final.sh` - Final crypto.js fixes
- `fix-typescript-issue.sh` - TypeScript issue resolution
- `quick-fix-crypto-js.sh` - Quick crypto.js fixes
- `quick-manual-fix.sh` - Quick manual fixes
- `manual-fix-steps.md` - Manual fix procedures

### Testing and Validation
- `test-package-json-fix.js` - Package.json testing
- `test-shared-package-build.sh` - Shared package build testing

## Deployment Architecture

### Infrastructure Components
- **EC2 Instance**: Backend API hosting
- **Vercel**: Frontend admin portal hosting
- **S3**: File storage and CDN
- **CloudFront**: CDN for static assets
- **RDS**: Database hosting (PostgreSQL)

### Service Configuration
- **Systemd**: API service management
- **Nginx**: Reverse proxy and load balancing
- **PM2**: Process management (alternative)
- **Logrotate**: Log management

## Deployment Workflows

### Production Deployment
1. **Code Deployment**:
   - Pull latest code from repository
   - Install dependencies
   - Build application
   - Run database migrations

2. **Service Management**:
   - Stop existing services
   - Deploy new code
   - Start services
   - Verify health checks

3. **SSL Configuration**:
   - Configure HTTPS certificates
   - Update nginx configuration
   - Restart services

### Environment Setup
1. **Backend Environment**:
   - Database connection strings
   - S3 bucket configuration
   - JWT secrets
   - API keys

2. **Frontend Environment**:
   - API base URL
   - CDN URLs
   - Authentication providers
   - Feature flags

## Script Categories and Functions

### Deployment Scripts
```bash
# Main deployment script
./deploy-production-ec2.sh
# - Pulls latest code
# - Installs dependencies
# - Builds application
# - Runs migrations
# - Restarts services
```

### Service Management
```bash
# Service control
systemctl start club-corra-api
systemctl stop club-corra-api
systemctl restart club-corra-api
systemctl status club-corra-api
```

### Monitoring and Health Checks
```bash
# Health check script
./monitor-backend.sh --health
# - Checks API endpoints
# - Verifies database connectivity
# - Monitors service status
# - Reports system metrics
```

### SSL and Security
```bash
# HTTPS setup
./setup-https-backend.sh
# - Configures SSL certificates
# - Updates nginx configuration
# - Restarts services
```

## Environment Variables

### Backend Environment (`backend.env.example`)
```bash
# Database
DATABASE_URL=postgresql://user:password@host:port/database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=clubcorra
DB_USER=postgres
DB_PASSWORD=password

# S3 Configuration
S3_BUCKET=club-corra-assets
S3_REGION=us-east-1
S3_ACCESS_KEY=your-access-key
S3_SECRET_KEY=your-secret-key

# JWT Configuration
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d

# API Configuration
API_PORT=3000
NODE_ENV=production
```

### Frontend Environment (Vercel)
```bash
# API Configuration
NEXT_PUBLIC_API_URL=https://api.clubcorra.com
NEXT_PUBLIC_CDN_URL=https://cdn.clubcorra.com

# Authentication
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=https://admin.clubcorra.com

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_DEBUG=false
```

## Database Management

### Migration Scripts
```bash
# Run migrations
cd /apps/api
yarn migration:run

# Generate new migration
yarn migration:generate --name=AddNewFeature

# Revert migration
yarn migration:revert
```

### Database Backup
```bash
# Backup database
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore database
psql $DATABASE_URL < backup_file.sql
```

## Monitoring and Logging

### Log Management
```bash
# View logs
journalctl -u club-corra-api -f
tail -f /var/log/club-corra-api/app.log

# Log rotation
./setup-log-rotation.sh
```

### Health Monitoring
```bash
# API health check
curl -f http://localhost:3000/health || exit 1

# Database health check
psql $DATABASE_URL -c "SELECT 1" || exit 1

# S3 health check
aws s3 ls s3://$S3_BUCKET/ || exit 1
```

## Troubleshooting Guide

### Common Issues

#### Build Issues
```bash
# Fix build issues
./fix-build-issues.sh
# - Clears node_modules
# - Reinstalls dependencies
# - Rebuilds application
```

#### Crypto.js Issues
```bash
# Fix crypto.js issues
./fix-crypto-js-correct.sh
# - Updates crypto.js version
# - Fixes compatibility issues
# - Rebuilds application
```

#### TypeScript Issues
```bash
# Fix TypeScript issues
./fix-typescript-issue.sh
# - Updates TypeScript configuration
# - Fixes type errors
# - Rebuilds application
```

### Disk Space Management
```bash
# Clean up disk space
./cleanup-disk-space.sh
# - Removes old logs
# - Cleans up temporary files
# - Optimizes disk usage
```

## Search Heuristics for Deployment

### By Functionality
- **Deployment**: `deploy-*`, `setup-*`
- **Service Management**: `*service*`, `systemd`
- **SSL/Security**: `https*`, `ssl*`, `security*`
- **Monitoring**: `monitor*`, `health*`, `status*`
- **Troubleshooting**: `fix-*`, `troubleshoot*`

### By Environment
- **Production**: `production*`, `prod*`
- **Development**: `dev*`, `local*`
- **Staging**: `stage*`, `test*`

### By Component
- **Backend**: `backend*`, `api*`
- **Frontend**: `frontend*`, `admin*`
- **Database**: `db*`, `migration*`
- **Storage**: `s3*`, `storage*`

## Performance Optimization

### EC2 Optimization
- **Memory Management**: Optimize for 8GB RAM
- **Disk Usage**: Efficient storage management
- **CPU Usage**: Process optimization
- **Network**: Bandwidth optimization

### Application Optimization
- **Build Optimization**: Faster build times
- **Runtime Optimization**: Better performance
- **Caching**: Redis or in-memory caching
- **CDN**: CloudFront optimization

## Security Considerations

### SSL/TLS Configuration
- **Certificate Management**: Automatic renewal
- **Security Headers**: Security best practices
- **CORS Configuration**: Proper CORS setup

### Access Control
- **SSH Keys**: Secure server access
- **Database Access**: Restricted database access
- **API Security**: JWT and rate limiting

### Monitoring
- **Security Logs**: Security event monitoring
- **Access Logs**: User access tracking
- **Error Logs**: Error monitoring and alerting
