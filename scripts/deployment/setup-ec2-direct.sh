#!/bin/bash

# Direct EC2 Setup Script for Club Corra API
# Run this script directly on your EC2 instance
# Usage: ./setup-ec2-direct.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Check if running as ec2-user
if [[ "$USER" != "ec2-user" ]]; then
    print_warning "This script is designed to run as ec2-user. Current user: $USER"
    read -p "Continue anyway? (y/n): " CONTINUE
    if [[ ! $CONTINUE =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

print_step "Setting up Club Corra API on EC2..."

# Update system
print_status "Updating system packages..."
sudo dnf update -y

# Install Node.js 20
print_status "Installing Node.js 20..."
if ! command -v node >/dev/null 2>&1; then
    curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
    sudo dnf install -y nodejs
    print_success "Node.js installed: $(node --version)"
else
    print_status "Node.js already installed: $(node --version)"
fi

# Install Yarn
print_status "Installing Yarn..."
if ! command -v yarn >/dev/null 2>&1; then
    sudo npm install -g yarn
    print_success "Yarn installed: $(yarn --version)"
else
    print_status "Yarn already installed: $(yarn --version)"
fi

# Install additional tools
print_status "Installing additional tools..."
sudo dnf install -y git curl wget unzip

# Install nginx
print_status "Installing nginx..."
sudo dnf install -y nginx

# Install certbot for SSL
print_status "Installing certbot..."
sudo dnf install -y certbot

# Start and enable nginx
print_status "Starting nginx..."
sudo systemctl start nginx
sudo systemctl enable nginx

# Install PM2 for process management
print_status "Installing PM2..."
sudo npm install -g pm2

print_success "✅ System setup completed!"

print_step "Setting up project directory..."

# Create project directory
mkdir -p ~/club-corra-api
cd ~/club-corra-api

# Clone repository if not exists
if [ ! -d "Club-Corra-Pilot-2" ]; then
    print_status "Cloning repository..."
    git clone https://github.com/VikasAhlawatCC/Club-Corra-Pilot-2.git
    print_success "Repository cloned successfully"
else
    print_status "Repository already exists, updating..."
    cd Club-Corra-Pilot-2
    git pull origin main
    cd ..
fi

cd Club-Corra-Pilot-2

print_status "Installing dependencies..."
yarn install

print_status "Building API..."
cd apps/api
yarn build

print_success "✅ Project setup completed!"

print_step "Creating production environment..."

# Create production environment file
cat > .env.production << 'EOF'
# Club Corra API Environment Configuration
NODE_ENV=production
PORT=8080
HOST=127.0.0.1
HTTPS_MODE=false

SSL_DOMAIN="16.170.179.71.nip.io"
# SSL Configuration
SSL_CERT_PATH=/etc/letsencrypt/live/16.170.179.71.nip.io/fullchain.pem
SSL_KEY_PATH=/etc/letsencrypt/live/16.170.179.71.nip.io/privkey.pem

# Database
DATABASE_URL=postgresql://cc_2_user:npS7fxRxtYFi8zFD4xPbFUvdstnT4TEw@dpg-d3hsvt95pdvs73fi1it0-a.oregon-postgres.render.com/cc_2?sslmode=require
REDIS_URL=redis://default:AT2GAAIjcDFjOTkzMzcxMjYxMzU0YzMzYWZjOTI2ZGZmODE0MWMyYnAxMA@next-blowfish-15750.upstash.io:6379

# CORS for production domains (including Vercel)
CORS_ORIGIN=https://club-corra-pilot-admin.vercel.app,https://club-corra-pilot-admin-git-master-vikas-ahlawats-projects.vercel.app,https://club-corra-pilot-admin-d8hqxkw2x-vikas-ahlawats-projects.vercel.app,https://*.vercel.app,https://admin.clubcorra.com,https://clubcorra.com,https://*.clubcorra.com

# Sentry (Recommended for production)
SENTRY_DSN=YOUR_SENTRY_DSN

# Rate Limiting (More restrictive for production)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# JWT
JWT_SECRET=50b7a8cc31ec6572a3d2b5a859b80749a0fa077e6cddf9315498b037cf6f97b670ce28b03cb6a26319856e9f49ca2729a99812171c2ff2605407a0d537712b58
JWT_REFRESH_SECRET=8b0a86f6d5dfd1c9f1273f74b6624531e19c4635c890b4e97c14b216eae67cf63cf2552147e486dd65f0aed44d637ca5bfe31799c5dae9631cf7c72c87c01920

# Twilio (for SMS)
TWILIO_ACCOUNT_SID=YOUR_TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN=YOUR_TWILIO_AUTH_TOKEN
TWILIO_PHONE_NUMBER=YOUR_TWILIO_PHONE_NUMBER

# SMTP (for emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=vikasahlawat228@gmail.com
SMTP_PASS=Vicky@0910
SMTP_FROM_EMAIL=v.ahlawat@clubcorra.com

# Google OAuth
GOOGLE_CLIENT_ID=1001053464584-9kpabid1vko6prnpugilbjru60cvjlrb.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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

# S3 Configuration
S3_BUCKET=YOUR_S3_BUCKET_NAME
S3_REGION=YOUR_S3_REGION
S3_ACCESS_KEY_ID=YOUR_S3_ACCESS_KEY_ID
S3_SECRET_ACCESS_KEY=YOUR_S3_SECRET_ACCESS_KEY

# CDN Configuration
CLOUDFRONT_URL=https://d3apij49dzeclm.cloudfront.net

# Security Headers
HELMET_ENABLED=true
RATE_LIMIT_ENABLED=true

# Logging
LOG_LEVEL=info
EOF

print_success "✅ Production environment created!"

print_step "Setting up systemd service..."

# Create systemd service
sudo tee /etc/systemd/system/club-corra-api.service > /dev/null << EOF
[Unit]
Description=Club Corra API Service
After=network.target
Wants=network.target

[Service]
Type=simple
User=ec2-user
Group=ec2-user
WorkingDirectory=$(pwd)
ExecStart=/usr/bin/node dist/main.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=8080
Environment=HOST=127.0.0.1
EnvironmentFile=$(pwd)/.env.production

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

# Reload systemd and enable service
sudo systemctl daemon-reload
sudo systemctl enable club-corra-api

print_success "✅ Systemd service created!"

print_step "Setting up nginx reverse proxy..."

# Create nginx configuration
sudo tee /etc/nginx/conf.d/club-corra-api.conf > /dev/null << 'EOF'
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
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Test nginx configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx

print_success "✅ Nginx configured!"

print_step "Starting services..."

# Start the API service
sudo systemctl start club-corra-api

# Wait for service to start
sleep 5

# Check service status
if sudo systemctl is-active --quiet club-corra-api; then
    print_success "✅ API service started successfully!"
else
    print_error "❌ API service failed to start"
    sudo systemctl status club-corra-api --no-pager -l
    exit 1
fi

print_step "Verifying deployment..."

# Test API endpoint
if curl -f -s "http://localhost:8080/api/v1/health" > /dev/null; then
    print_success "✅ API health check passed!"
else
    print_warning "⚠️ API health check failed - service may still be starting"
fi

# Test through nginx
if curl -f -s "http://localhost/health" > /dev/null; then
    print_success "✅ Nginx proxy working!"
else
    print_warning "⚠️ Nginx proxy test failed"
fi

print_success "🎉 EC2 setup completed successfully!"
echo ""
echo "📋 Your API is now running at:"
echo "   - Direct: http://16.170.179.71:8080/api/v1"
echo "   - Through nginx: http://16.170.179.71/api/v1"
echo "   - Health check: http://16.170.179.71/health"
echo ""
echo "🔧 Useful commands:"
echo "   - Check service status: sudo systemctl status club-corra-api"
echo "   - View logs: sudo journalctl -u club-corra-api -f"
echo "   - Restart service: sudo systemctl restart club-corra-api"
echo "   - Check nginx: sudo systemctl status nginx"
echo ""
echo "🌐 Next step: Run HTTPS setup script for SSL certificates"
echo "   ./setup-https-ec2.sh"
