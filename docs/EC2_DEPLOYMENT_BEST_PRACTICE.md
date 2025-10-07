# EC2 Deployment Best Practice Guide

## Problem Statement

When deploying a monorepo with workspace dependencies to EC2, you may encounter:
- Platform-specific package incompatibilities (e.g., `@next/swc-darwin-arm64`)
- Workspace dependency resolution issues
- Build failures due to missing development tools

## Best Practice Solution

**Build locally, deploy binaries only**

This approach:
✅ Avoids platform incompatibility issues
✅ Faster deployment (no compilation on EC2)
✅ Smaller production footprint
✅ More reliable and predictable

---

## Quick Start (Recommended)

### Prerequisites
1. SSH key downloaded: `club-corra-api-key.pem`
2. SSH key in `~/.ssh/` directory
3. EC2 instance running with Elastic IP: `16.170.179.71`

### One-Command Deployment

```bash
# From your local machine, in the project root
chmod +x scripts/deployment/deploy-from-local.sh
./scripts/deployment/deploy-from-local.sh
```

That's it! The script will:
1. Build the API locally
2. Create a deployment package
3. Upload to EC2
4. Install production dependencies
5. Create and start the systemd service

---

## Manual Deployment Process

If you prefer to deploy manually or the script fails:

### Step 1: Build Locally

```bash
# On your local machine
cd /path/to/Club-Corra-Pilot-2

# Build the API
cd apps/api
yarn build  # or npm run build

# Verify build
ls -la dist/
# Should see: main.js and other compiled files
```

### Step 2: Create Deployment Package

```bash
# Still in apps/api directory
mkdir -p ~/deploy-temp
cp -r dist ~/deploy-temp/
cp package.json ~/deploy-temp/

# Create production-only package.json
cat > ~/deploy-temp/package.json << 'EOF'
{
  "name": "@club-corra/api",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "start:prod": "node dist/main"
  },
  "dependencies": {
    "@aws-sdk/client-s3": "^3.901.0",
    "@aws-sdk/s3-request-presigner": "^3.901.0",
    "@nestjs/common": "^10.0.0",
    "@nestjs/config": "^3.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/jwt": "^10.0.0",
    "@nestjs/mapped-types": "^2.1.0",
    "@nestjs/passport": "^11.0.5",
    "@nestjs/platform-express": "^10.0.0",
    "@nestjs/typeorm": "^10.0.0",
    "@sentry/node": "^7.0.0",
    "bcrypt": "^5.1.0",
    "bcryptjs": "^3.0.2",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.14.0",
    "jsonwebtoken": "^9.0.0",
    "nestjs-pino": "^4.4.1",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",
    "pg": "^8.11.0",
    "pino": "^8.0.0",
    "pino-http": "^11.0.0",
    "pino-pretty": "^10.0.0",
    "reflect-metadata": "^0.1.13",
    "rxjs": "^7.8.1",
    "typeorm": "^0.3.0"
  }
}
EOF

# Create tarball
cd ~/deploy-temp
tar -czf ~/club-corra-api-deploy.tar.gz .
```

### Step 3: Upload to EC2

```bash
# Upload deployment package
scp -i ~/.ssh/club-corra-api-key.pem \
    ~/club-corra-api-deploy.tar.gz \
    ec2-user@16.170.179.71:/tmp/
```

### Step 4: Deploy on EC2

```bash
# Connect to EC2
ssh -i ~/.ssh/club-corra-api-key.pem ec2-user@16.170.179.71

# On EC2: Stop existing service
sudo systemctl stop club-corra-api 2>/dev/null || true

# Backup existing deployment
if [ -d /opt/club-corra-api ]; then
    sudo mv /opt/club-corra-api /opt/club-corra-api.backup.$(date +%Y%m%d-%H%M%S)
fi

# Extract deployment package
cd /tmp
mkdir -p club-corra-api-deploy
tar -xzf club-corra-api-deploy.tar.gz -C club-corra-api-deploy

# Move to production directory
sudo mkdir -p /opt/club-corra-api
sudo cp -r club-corra-api-deploy/* /opt/club-corra-api/
sudo chown -R ec2-user:ec2-user /opt/club-corra-api

# Install production dependencies
cd /opt/club-corra-api
npm install --production --omit=dev

# This should work without platform issues!
```

### Step 5: Configure Environment

```bash
# Create environment file
sudo nano /opt/club-corra-api/.env
```

Add your configuration:

```bash
NODE_ENV=production
PORT=8080
HOST=127.0.0.1

# Database
DATABASE_URL=postgresql://username:password@hostname:5432/database_name
DB_SSL=true

# Authentication
JWT_SECRET=your-super-secure-jwt-secret-key-here
JWT_EXPIRES_IN=86400

# CORS
CORS_ORIGIN=https://admin.clubcorra.com,https://clubcorra.com,https://*.clubcorra.com,https://*.vercel.app

# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
S3_BUCKET_NAME=club-corra-uploads

# Optional: Sentry for error tracking
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

### Step 6: Create Systemd Service

```bash
# Create service file
sudo tee /etc/systemd/system/club-corra-api.service > /dev/null << 'EOF'
[Unit]
Description=Club Corra API Service
After=network.target
Wants=network.target

[Service]
Type=simple
User=ec2-user
Group=ec2-user
WorkingDirectory=/opt/club-corra-api
ExecStart=/usr/bin/node dist/main.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=8080
Environment=HOST=127.0.0.1
EnvironmentFile=/opt/club-corra-api/.env

# Logging
StandardOutput=journal
StandardError=journal
SyslogIdentifier=club-corra-api

# Security
NoNewPrivileges=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable club-corra-api
sudo systemctl start club-corra-api

# Check status
sudo systemctl status club-corra-api
```

### Step 7: Verify Deployment

```bash
# Check if service is running
sudo systemctl is-active club-corra-api

# View logs
sudo journalctl -u club-corra-api -f

# Test API endpoint
curl http://localhost:8080/api/v1/health

# Test from outside EC2
# (on your local machine)
curl http://16.170.179.71:8080/api/v1/health
```

---

## Setup Nginx Reverse Proxy (Optional but Recommended)

### Install Nginx

```bash
sudo dnf install -y nginx
```

### Configure Nginx

```bash
sudo nano /etc/nginx/conf.d/club-corra-api.conf
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name 16.170.179.71;

    # API proxy
    location /api/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Health check
    location /health {
        proxy_pass http://127.0.0.1:8080/api/v1/health;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
```

### Start Nginx

```bash
# Test configuration
sudo nginx -t

# Start and enable nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Test through nginx
curl http://16.170.179.71/health
```

---

## Troubleshooting

### Service Won't Start

```bash
# View detailed logs
sudo journalctl -u club-corra-api -n 100 --no-pager

# Check if port is in use
sudo netstat -tlnp | grep :8080

# Test the application directly
cd /opt/club-corra-api
node dist/main.js
```

### Database Connection Issues

```bash
# Check if database is accessible
psql "$DATABASE_URL" -c "SELECT 1"

# Verify environment file
cat /opt/club-corra-api/.env | grep DATABASE_URL
```

### Permission Issues

```bash
# Fix ownership
sudo chown -R ec2-user:ec2-user /opt/club-corra-api
sudo chmod -R 755 /opt/club-corra-api
```

---

## Continuous Deployment

For future deployments, just run:

```bash
# On your local machine
./scripts/deployment/deploy-from-local.sh
```

This will:
1. Build the latest code
2. Deploy to EC2
3. Restart the service
4. Verify deployment

---

## Benefits of This Approach

✅ **No platform incompatibilities**: Build happens on your local machine
✅ **Faster deployments**: No compilation on EC2
✅ **Smaller production footprint**: Only production dependencies installed
✅ **More reliable**: Avoid workspace dependency resolution issues
✅ **Easier debugging**: Build errors happen locally where you have better tools
✅ **Version control**: You can version your deployment packages

---

## Comparison: Build on EC2 vs Build Locally

| Aspect | Build on EC2 | Build Locally (Recommended) |
|--------|--------------|----------------------------|
| Platform issues | ❌ Common | ✅ Avoided |
| Deployment speed | ❌ Slow | ✅ Fast |
| EC2 resources needed | ❌ High | ✅ Low |
| Reliability | ❌ Medium | ✅ High |
| Production size | ❌ Large | ✅ Small |
| Debugging | ❌ Hard | ✅ Easy |

---

## Summary

**For this monorepo, always deploy using the "build locally, deploy binaries" approach.**

This avoids all the workspace dependency and platform compatibility issues you encountered.

Your deployment workflow:
1. Make code changes locally
2. Test locally
3. Run `./scripts/deployment/deploy-from-local.sh`
4. Done! 🎉

