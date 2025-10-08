#!/bin/bash

# Deploy Club Corra API from Local to EC2
# This script builds locally and deploys to EC2
# Usage: ./deploy-from-local.sh

set -e

# Configuration
EC2_HOST="16.170.179.71"
EC2_USER="ec2-user"
SSH_KEY="$HOME/.ssh/club-corra-api-key.pem"
REMOTE_DIR="/opt/club-corra-api"
SERVICE_NAME="club-corra-api"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Check if SSH key exists
if [ ! -f "$SSH_KEY" ]; then
    print_error "SSH key not found at $SSH_KEY"
    print_status "Please update the SSH_KEY variable in this script"
    exit 1
fi

# Check if we're in the project root
if [ ! -f "package.json" ] || [ ! -d "apps/api" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

print_step "Step 1: Building API locally..."

# Navigate to API directory
cd apps/api

# Clean previous build
print_status "Cleaning previous build..."
rm -rf dist

# Build the API
print_status "Building API..."
yarn build || npm run build

# Verify build
if [ ! -d "dist" ] || [ ! -f "dist/main.js" ]; then
    print_error "Build failed - dist/main.js not found"
    exit 1
fi

print_status "✅ Build completed successfully"

print_step "Step 2: Creating deployment package..."

# Create temporary deployment directory
DEPLOY_DIR="$(mktemp -d)/club-corra-api-deploy"
mkdir -p "$DEPLOY_DIR"

# Copy built files
cp -r dist "$DEPLOY_DIR/"
cp package.json "$DEPLOY_DIR/"

# Create production package.json (remove dev dependencies)
cat > "$DEPLOY_DIR/package.json" << 'EOF'
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

print_status "✅ Deployment package created"

print_step "Step 3: Uploading to EC2..."

# Create tarball
cd "$(dirname "$DEPLOY_DIR")"
tar -czf club-corra-api-deploy.tar.gz club-corra-api-deploy

# Upload to EC2
print_status "Uploading deployment package..."
scp -i "$SSH_KEY" club-corra-api-deploy.tar.gz $EC2_USER@$EC2_HOST:/tmp/

print_status "✅ Upload completed"

print_step "Step 4: Deploying on EC2..."

# Deploy on EC2
ssh -i "$SSH_KEY" $EC2_USER@$EC2_HOST << 'ENDSSH'
set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

SERVICE_NAME="club-corra-api"
REMOTE_DIR="/opt/club-corra-api"

print_status "Stopping existing service..."
sudo systemctl stop $SERVICE_NAME 2>/dev/null || true

print_status "Creating backup..."
if [ -d "$REMOTE_DIR" ]; then
    sudo mv "$REMOTE_DIR" "$REMOTE_DIR.backup.$(date +%Y%m%d-%H%M%S)"
fi

print_status "Extracting deployment package..."
cd /tmp
tar -xzf club-corra-api-deploy.tar.gz

print_status "Moving to production directory..."
sudo mkdir -p "$REMOTE_DIR"
sudo cp -r club-corra-api-deploy/* "$REMOTE_DIR/"
sudo chown -R ec2-user:ec2-user "$REMOTE_DIR"

print_status "Installing production dependencies..."
cd "$REMOTE_DIR"
npm install --production --omit=dev

print_status "Creating environment file..."
if [ ! -f "$REMOTE_DIR/.env" ]; then
    # Copy production environment from deployment directory
    if [ -f "$(dirname "$0")/production.env" ]; then
        cp "$(dirname "$0")/production.env" "$REMOTE_DIR/.env"
        print_status "✅ Production environment file created with your actual values"
    else
        cat > "$REMOTE_DIR/.env" << 'EOF'
NODE_ENV=production
PORT=8080
HOST=127.0.0.1
DATABASE_URL=postgresql://username:password@hostname:5432/database_name
JWT_SECRET=your-super-secure-jwt-secret-key-here
CORS_ORIGIN=https://admin.clubcorra.com,https://clubcorra.com,https://*.clubcorra.com,https://*.vercel.app
EOF
        print_status "⚠️  Environment file created - please update with your actual values"
    fi
fi

print_status "Creating systemd service..."
sudo tee /etc/systemd/system/$SERVICE_NAME.service > /dev/null << 'EOFSERVICE'
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
EOFSERVICE

print_status "Starting service..."
sudo systemctl daemon-reload
sudo systemctl enable $SERVICE_NAME
sudo systemctl start $SERVICE_NAME

print_status "Waiting for service to start..."
sleep 5

if sudo systemctl is-active --quiet $SERVICE_NAME; then
    print_status "✅ Service started successfully!"
    sudo systemctl status $SERVICE_NAME --no-pager -l
else
    echo -e "${RED}[ERROR]${NC} Service failed to start"
    sudo journalctl -u $SERVICE_NAME -n 50 --no-pager
    exit 1
fi

print_status "Cleaning up..."
rm -rf /tmp/club-corra-api-deploy /tmp/club-corra-api-deploy.tar.gz

print_status "🎉 Deployment completed!"
print_status "API running at: http://localhost:8080"
print_status "Check logs with: sudo journalctl -u $SERVICE_NAME -f"
ENDSSH

print_step "Step 5: Verifying deployment..."

# Test the API
ssh -i "$SSH_KEY" $EC2_USER@$EC2_HOST << 'ENDTEST'
echo "Testing API endpoint..."
sleep 3
curl -s http://localhost:8080/api/v1/health || echo "Health check endpoint not responding (may need database connection)"
ENDTEST

print_status "🎉 Deployment script completed!"
print_status ""
print_status "Next steps:"
print_status "1. Update environment file: ssh -i $SSH_KEY $EC2_USER@$EC2_HOST 'nano /opt/club-corra-api/.env'"
print_status "2. Restart service: ssh -i $SSH_KEY $EC2_USER@$EC2_HOST 'sudo systemctl restart $SERVICE_NAME'"
print_status "3. View logs: ssh -i $SSH_KEY $EC2_USER@$EC2_HOST 'sudo journalctl -u $SERVICE_NAME -f'"
print_status "4. Test API: curl http://16.170.179.71:8080/api/v1/health"

