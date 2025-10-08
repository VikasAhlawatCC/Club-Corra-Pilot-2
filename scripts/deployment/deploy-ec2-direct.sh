#!/bin/bash

# Direct EC2 Deployment Script for Club Corra API
# Run this script directly on your EC2 instance to deploy updates
# Usage: ./deploy-ec2-direct.sh

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

print_step "Deploying Club Corra API on EC2..."

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

# Pull latest changes
print_step "Pulling latest changes..."
git pull origin main

# Navigate to API directory
cd apps/api

# Install dependencies
print_step "Installing dependencies..."
yarn install

# Build the application
print_step "Building application..."
yarn build

# Copy environment file if it doesn't exist
if [ ! -f .env ]; then
    print_status "Copying production environment file..."
    if [ -f .env.production ]; then
        cp .env.production .env
        print_success "Environment file copied"
    else
        print_warning "No .env.production file found"
    fi
fi

# Restart the service
print_step "Restarting API service..."
sudo systemctl restart club-corra-api

# Wait for service to start
sleep 5

# Check service status
if sudo systemctl is-active --quiet club-corra-api; then
    print_success "✅ API service restarted successfully!"
else
    print_error "❌ API service failed to restart"
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

# Test through nginx (if HTTPS is set up)
if sudo systemctl is-active --quiet nginx; then
    print_step "Testing nginx proxy..."
    if curl -f -s "http://localhost/health" > /dev/null; then
        print_success "✅ Nginx proxy working!"
    else
        print_warning "⚠️ Nginx proxy test failed"
    fi
fi

print_success "🎉 Deployment completed successfully!"
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
echo "📊 Service logs:"
sudo systemctl status club-corra-api --no-pager -l
