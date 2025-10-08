#!/bin/bash

# Complete EC2 Setup Script - Run after HTTPS setup
# This script completes the API setup without package conflicts

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

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_step "Completing Club Corra API setup on EC2..."

# Find project directory
PROJECT_DIR=""
if [ -d "/home/ec2-user/club-corra-api/Club-Corra-Pilot-2" ]; then
    PROJECT_DIR="/home/ec2-user/club-corra-api/Club-Corra-Pilot-2"
elif [ -d "/home/ec2-user/Club-Corra-Pilot-2" ]; then
    PROJECT_DIR="/home/ec2-user/Club-Corra-Pilot-2"
else
    print_error "Could not find project directory"
    print_status "Please ensure the project is cloned in one of these locations:"
    print_status "  - /home/ec2-user/club-corra-api/Club-Corra-Pilot-2"
    print_status "  - /home/ec2-user/Club-Corra-Pilot-2"
    exit 1
fi

print_status "Found project at: $PROJECT_DIR"

# Navigate to project directory
cd "$PROJECT_DIR"

# Install dependencies
print_step "Installing dependencies..."
yarn install

# Navigate to API directory
cd apps/api

# Build the application
print_step "Building application..."
yarn build

# Create production environment file
print_step "Creating production environment..."

cat > .env.production << 'EOF'
# Club Corra API Environment Configuration
NODE_ENV=production
PORT=8080
HOST=127.0.0.1
HTTPS_MODE=true

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
TWILIO_ACCOUNT_SID=AC4029ed0224b16807b34ed4aeba690bc6
TWILIO_AUTH_TOKEN=49635e9c36d7b1d4c9a992bf9576c1d4
TWILIO_PHONE_NUMBER=+19284148255

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
S3_BUCKET=clubcorrarecieptsbucket
S3_REGION=eu-north-1
S3_ACCESS_KEY_ID=AKIAR2BL2TDHJMDEOEGO
S3_SECRET_ACCESS_KEY=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

# CDN Configuration
CLOUDFRONT_URL=https://d3apij49dzeclm.cloudfront.net

# Security Headers
HELMET_ENABLED=true
RATE_LIMIT_ENABLED=true

# Logging
LOG_LEVEL=info
EOF

print_success "✅ Production environment created!"

# Create systemd service
print_step "Creating systemd service..."

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

# Start the API service
print_step "Starting API service..."
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

# Test API endpoint
print_step "Testing API endpoint..."
if curl -f -s "http://localhost:8080/api/v1/health" > /dev/null; then
    print_success "✅ API health check passed!"
else
    print_warning "⚠️ API health check failed - service may still be starting"
fi

# Test through nginx
if sudo systemctl is-active --quiet nginx; then
    print_step "Testing nginx proxy..."
    if curl -f -s "http://localhost/health" > /dev/null; then
        print_success "✅ Nginx proxy working!"
    else
        print_warning "⚠️ Nginx proxy test failed"
    fi
fi

print_success "🎉 Setup completed successfully!"
echo ""
echo "📋 Your API is now running at:"
echo "   - Direct: http://16.170.179.71:8080/api/v1"
echo "   - Through nginx: http://16.170.179.71/api/v1"
echo "   - HTTPS: https://16.170.179.71.nip.io/api/v1"
echo "   - Health check: http://16.170.179.71/health"
echo ""
echo "🔧 Useful commands:"
echo "   - Check service status: sudo systemctl status club-corra-api"
echo "   - View logs: sudo journalctl -u club-corra-api -f"
echo "   - Restart service: sudo systemctl restart club-corra-api"
echo "   - Check nginx: sudo systemctl status nginx"
echo ""
echo "📊 Service logs:"
sudo systemctl status club-corra-api --no-pager -l
