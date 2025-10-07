#!/bin/bash

# Simple EC2 Deployment Script for Club Corra API (No Shared Packages)
# This script deploys the API to production on EC2
# Usage: ./deploy-simple-ec2.sh

set -e  # Exit on any error

# Configuration
SERVICE_NAME="club-corra-api"
APP_DIR="/opt/club-corra-api"
BACKUP_DIR="/opt/club-corra-api-backup"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Function to check and upgrade Node.js if needed
check_and_upgrade_nodejs() {
    print_step "Checking Node.js version..."
    
    if command -v node >/dev/null 2>&1; then
        CURRENT_VERSION=$(node --version)
        print_status "Current Node.js version: $CURRENT_VERSION"
        
        if [[ "$CURRENT_VERSION" == v18* ]]; then
            print_warning "Node.js v18 detected - upgrading to v20 for better compatibility"
            sudo yum remove -y nodejs npm || true
            curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
            sudo yum install -y nodejs
        fi
    else
        print_status "Installing Node.js v20..."
        curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
        sudo yum install -y nodejs
    fi
    
    # Install Yarn if not present
    if ! command -v yarn >/dev/null 2>&1; then
        print_status "Installing Yarn..."
        sudo npm install -g yarn
    fi
}

# Function to stop existing service
stop_service() {
    print_step "Stopping existing service..."
    
    if sudo systemctl is-active --quiet "$SERVICE_NAME"; then
        sudo systemctl stop "$SERVICE_NAME"
        print_status "Service stopped successfully"
    else
        print_status "Service was not running"
    fi
    
    # Kill any remaining Node.js processes
    sudo pkill -f "node.*dist/main.js" 2>/dev/null || true
    sleep 2
}

# Function to backup existing deployment
backup_existing() {
    print_step "Creating backup of existing deployment..."
    
    if [ -d "$APP_DIR" ]; then
        sudo mkdir -p "$BACKUP_DIR"
        BACKUP_NAME="backup-$(date +%Y%m%d-%H%M%S)"
        sudo cp -r "$APP_DIR" "$BACKUP_DIR/$BACKUP_NAME"
        print_status "Backup created: $BACKUP_DIR/$BACKUP_NAME"
    else
        print_status "No existing deployment found to backup"
    fi
}

# Function to build application
build_application() {
    print_step "Building application..."
    
    # Navigate to API directory
    cd apps/api
    
    # Clean previous build
    rm -rf dist
    
    # Install dependencies
    yarn install --frozen-lockfile
    
    # Build application
    yarn build
    
    # Verify build output
    if [ ! -d "dist" ]; then
        print_error "Build failed - dist directory not found"
        exit 1
    fi
    
    if [ ! -f "dist/main.js" ]; then
        print_error "Build failed - main.js not found"
        exit 1
    fi
    
    print_status "Build completed successfully"
}

# Function to deploy to production
deploy_to_production() {
    print_step "Deploying to production directory..."
    
    # Create production directory
    sudo mkdir -p "$APP_DIR"
    
    # Copy built application
    sudo cp -r dist "$APP_DIR/"
    sudo cp package.json "$APP_DIR/"
    
    # Copy environment file if it exists
    if [ -f ".env.production" ]; then
        sudo cp .env.production "$APP_DIR/.env"
    elif [ -f ".env.local" ]; then
        sudo cp .env.local "$APP_DIR/.env"
    else
        print_warning "No environment file found - you'll need to create one manually"
    fi
    
    # Set permissions
    sudo chown -R ec2-user:ec2-user "$APP_DIR"
    sudo chmod -R 755 "$APP_DIR"
    
    # Install production dependencies
    cd "$APP_DIR"
    yarn install --production
    
    print_status "Deployment completed successfully"
}

# Function to setup systemd service
setup_service() {
    print_step "Setting up systemd service..."
    
    # Create service file
    sudo tee /etc/systemd/system/$SERVICE_NAME.service > /dev/null << EOF
[Unit]
Description=Club Corra API Service
After=network.target
Wants=network.target

[Service]
Type=simple
User=ec2-user
Group=ec2-user
WorkingDirectory=$APP_DIR
ExecStart=/usr/bin/node dist/main.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=8080
Environment=HOST=127.0.0.1
EnvironmentFile=$APP_DIR/.env

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
    sudo systemctl enable "$SERVICE_NAME"
    sudo systemctl start "$SERVICE_NAME"
    
    # Wait for service to start
    sleep 5
    
    # Check service status
    if sudo systemctl is-active --quiet "$SERVICE_NAME"; then
        print_status "Service started successfully"
    else
        print_error "Service failed to start"
        sudo systemctl status "$SERVICE_NAME" --no-pager -l
        exit 1
    fi
}

# Function to verify deployment
verify_deployment() {
    print_step "Verifying deployment..."
    
    echo "=== Service Status ==="
    sudo systemctl status "$SERVICE_NAME" --no-pager -l
    
    echo -e "\n=== Port Listening Check ==="
    netstat -tlnp | grep :8080 || echo "Port 8080 not listening"
    
    echo -e "\n=== Process Check ==="
    ps aux | grep "node.*dist/main.js" | grep -v grep || echo "No Node.js process found"
    
    echo -e "\n=== Build Verification ==="
    ls -la "$APP_DIR/dist/"
    
    echo -e "\n=== Environment File Check ==="
    if [ -f "$APP_DIR/.env" ]; then
        echo "✅ Environment file exists"
        echo "📝 Key environment variables:"
        grep -E "^(NODE_ENV|PORT|HOST|DATABASE_URL|JWT_SECRET)" "$APP_DIR/.env" || echo "No key env vars found"
    else
        echo "❌ Environment file missing"
    fi
}

# Function to run health check
health_check() {
    print_step "Running health check..."
    
    # Wait for service to be ready
    sleep 10
    
    # Test API endpoint
    if curl -f -s "http://localhost:8080/api/v1/health" > /dev/null; then
        print_status "Health check passed - API is responding"
    else
        print_warning "Health check failed - API may not be ready yet"
        print_status "You can check the logs with: sudo journalctl -u $SERVICE_NAME -f"
    fi
}

# Main deployment flow
main() {
    print_status "Starting simple deployment for Club Corra API..."
    
    # Check Node.js
    check_and_upgrade_nodejs
    
    # Stop existing service
    stop_service
    
    # Backup existing deployment
    backup_existing
    
    # Build application
    build_application
    
    # Deploy to production
    deploy_to_production
    
    # Setup service
    setup_service
    
    # Verify deployment
    verify_deployment
    
    # Run health check
    health_check
    
    print_status "🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!"
    print_status "Your API is now running at: http://16.170.179.71:8080"
    print_status "Health check: http://16.170.179.71:8080/api/v1/health"
    print_status "Service status: sudo systemctl status $SERVICE_NAME"
    print_status "View logs: sudo journalctl -u $SERVICE_NAME -f"
}

# Handle script arguments
case "${1:-}" in
    --help|-h)
        echo "Usage: $0 [--help|--verify|--logs]"
        echo "  --help    Show this help message"
        echo "  --verify  Only verify deployment status"
        echo "  --logs    Show service logs"
        exit 0
        ;;
    --verify)
        verify_deployment
        exit 0
        ;;
    --logs)
        sudo journalctl -u "$SERVICE_NAME" -f
        exit 0
        ;;
    *)
        main
        ;;
esac
