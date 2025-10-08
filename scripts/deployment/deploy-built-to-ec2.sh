#!/bin/bash

# Deploy Pre-built API to EC2
# This script builds locally and uploads to EC2 to save disk space

set -e

# Configuration
EC2_HOST="16.170.179.71"
EC2_USER="ec2-user"
SSH_KEY="../club-corra-api-key.pem"
REMOTE_DIR="/home/ec2-user/club-corra-api"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

echo "🚀 Deploying Pre-built API to EC2"
echo "=================================="
echo ""

# Check if we're in the project root
if [ ! -f "package.json" ] || [ ! -d "apps/api" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

print_step "Building API locally..."
cd apps/api
yarn install --production=false
yarn build
cd ../..

print_step "Creating deployment package..."
# Create a temporary directory for deployment files
TEMP_DIR=$(mktemp -d)
mkdir -p "$TEMP_DIR/api"

# Copy only necessary files
cp -r apps/api/dist "$TEMP_DIR/api/"
cp apps/api/package.json "$TEMP_DIR/api/"
# Don't copy node_modules - we'll install them on the server for correct architecture

# Copy deployment scripts
cp scripts/deployment/production.env "$TEMP_DIR/"
cp scripts/deployment/complete-setup-ec2.sh "$TEMP_DIR/"

print_step "Uploading to EC2..."
# Create remote directory
ssh -i "$SSH_KEY" "$EC2_USER@$EC2_HOST" "mkdir -p $REMOTE_DIR"

# Upload files
rsync -avz --progress -e "ssh -i $SSH_KEY" \
    "$TEMP_DIR/" \
    "$EC2_USER@$EC2_HOST:$REMOTE_DIR/"

# Cleanup
rm -rf "$TEMP_DIR"

print_step "Setting up service on EC2..."
ssh -i "$SSH_KEY" "$EC2_USER@$EC2_HOST" << 'ENDSSH'
cd /home/ec2-user/club-corra-api

# Copy production environment
if [ -f production.env ]; then
    cp production.env api/.env.production
fi

# Install production dependencies on the server
echo "Installing production dependencies..."
cd api
npm install --production --legacy-peer-deps

# Create systemd service
sudo tee /etc/systemd/system/club-corra-api.service > /dev/null << 'EOF'
[Unit]
Description=Club Corra API Service
After=network.target nginx.service
Wants=network.target

[Service]
Type=simple
User=ec2-user
Group=ec2-user
WorkingDirectory=/home/ec2-user/club-corra-api/api
ExecStart=/usr/bin/node dist/main.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=8080
Environment=HOST=127.0.0.1
EnvironmentFile=/home/ec2-user/club-corra-api/api/.env.production

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

# Reload and restart service
sudo systemctl daemon-reload
sudo systemctl enable club-corra-api
sudo systemctl restart club-corra-api

# Wait for service to start
sleep 5

# Check status
echo "Service status:"
sudo systemctl status club-corra-api --no-pager -l
ENDSSH

echo ""
echo "✅ Deployment completed!"
echo ""
echo "📋 Your API should now be running at:"
echo "   - HTTPS: https://16.170.179.71.nip.io/api/v1"
echo "   - HTTP: http://16.170.179.71/api/v1"
echo ""
echo "🔍 To check the deployment:"
echo "   ssh -i ~/.ssh/club-corra-api-key.pem ec2-user@16.170.179.71"
echo "   sudo systemctl status club-corra-api"
echo "   sudo journalctl -u club-corra-api -f"
