#!/bin/bash

# Club Corra Production Deployment Script (EC2 Optimized for t3.small)
# This script is optimized for small EC2 instances with limited disk space
# It builds and deploys ONLY the API backend from apps/api (no shared workspace)

set -e  # Exit on any error

# Configuration
SERVICE_NAME="club-corra-api"
APP_DIR="/opt/club-corra-api"
BACKUP_DIR="/opt/club-corra-api-backup"
LOG_FILE="/var/log/club-corra-api.log"

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

# Function to check disk space
check_disk_space() {
    print_step "Checking available disk space..."
    
    AVAILABLE_SPACE=$(df / | awk 'NR==2 {print $4}')
    AVAILABLE_GB=$((AVAILABLE_SPACE / 1024 / 1024))
    
    print_status "Available disk space: ${AVAILABLE_GB}GB"
    
    if [ "$AVAILABLE_GB" -lt 1 ]; then
        print_error "❌ Insufficient disk space (less than 1GB available)"
        print_error "Please run the disk cleanup script first:"
        print_error "  ./scripts/deployment/cleanup-disk-space.sh"
        exit 1
    elif [ "$AVAILABLE_GB" -lt 2 ]; then
        print_warning "⚠️ Low disk space (${AVAILABLE_GB}GB available)"
        print_warning "Consider running disk cleanup: ./scripts/deployment/cleanup-disk-space.sh"
    else
        print_status "✅ Sufficient disk space available"
    fi
}

# Function to check and upgrade Node.js if needed
check_and_upgrade_nodejs() {
    print_step "Checking Node.js version and upgrading if needed..."
    
    # Check current Node.js version
    if command -v node >/dev/null 2>&1; then
        CURRENT_VERSION=$(node --version)
        print_status "📊 Current Node.js version: $CURRENT_VERSION"
        
        # Check if we need to upgrade (v18 is too old for modern NestJS)
        if [[ "$CURRENT_VERSION" == v18* ]]; then
            print_warning "⚠️ WARNING: Node.js v18 detected - upgrading to v20 for better compatibility"
            
            # Remove old Node.js
            print_status "🧹 REMOVING: Old Node.js installation..."
            sudo yum remove -y nodejs npm || true
            
            # Install Node.js 20 from NodeSource
            print_status "📦 INSTALLING: Node.js 20 from NodeSource..."
            curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
            sudo yum install -y nodejs
            
            # Verify installation
            NEW_VERSION=$(node --version)
            print_status "✅ SUCCESS: Node.js upgraded to $NEW_VERSION"
            
            # Update PATH for current session
            export PATH="/usr/bin:$PATH"
        elif [[ "$CURRENT_VERSION" == v20* ]]; then
            print_status "✅ SUCCESS: Node.js v20 already installed"
        else
            print_warning "⚠️ WARNING: Unknown Node.js version: $CURRENT_VERSION"
        fi
    else
        print_status "📦 INSTALLING: Node.js not found, installing v20..."
        curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
        sudo yum install -y nodejs
        
        # Verify installation
        NEW_VERSION=$(node --version)
        print_status "✅ SUCCESS: Node.js v20 installed: $NEW_VERSION"
        
        # Update PATH for current session
        export PATH="/usr/bin:$PATH"
    fi
    
    # Verify yarn is available
    if ! command -v yarn >/dev/null 2>&1; then
        print_status "📦 INSTALLING: Yarn not found, installing..."
        sudo npm install -g yarn
        print_status "✅ SUCCESS: Yarn installed"
    fi
}

# Function to check if running as root or with sudo
check_permissions() {
    if [ "$EUID" -eq 0 ]; then
        print_error "This script should not be run as root. Please run as ec2-user."
        exit 1
    fi
    
    # Check if we can sudo
    if ! sudo -n true 2>/dev/null; then
        print_error "This script requires sudo privileges. Please ensure you can run sudo commands."
        exit 1
    fi
}

# Function to stop existing service
stop_service() {
    print_step "Stopping existing service..."
    
    if sudo systemctl is-active --quiet "$SERVICE_NAME"; then
        print_status "⏹️ COMMAND: sudo systemctl stop $SERVICE_NAME"
        sudo systemctl stop "$SERVICE_NAME"
        print_status "✅ SUCCESS: Service stopped successfully"
    else
        print_status "ℹ️ INFO: Service was not running"
    fi
}

# Function to backup existing deployment
backup_existing() {
    print_step "Creating backup of existing deployment..."
    
    if [ -d "$APP_DIR" ]; then
        print_status "💾 COMMAND: sudo mkdir -p $BACKUP_DIR"
        sudo mkdir -p "$BACKUP_DIR"
        BACKUP_NAME="backup-$(date +%Y%m%d-%H%M%S)"
        print_status "💾 COMMAND: sudo cp -r $APP_DIR $BACKUP_DIR/$BACKUP_NAME"
        sudo cp -r "$APP_DIR" "$BACKUP_DIR/$BACKUP_NAME"
        print_status "✅ SUCCESS: Backup created: $BACKUP_DIR/$BACKUP_NAME"
    else
        print_status "ℹ️ INFO: No existing deployment found to backup"
    fi
}

# Function to clean and prepare build environment (OPTIMIZED)
prepare_build() {
    print_step "Preparing optimized build environment..."
    
    print_status "📁 STEP: prepare_build() - Starting in directory: $(pwd)"
    
    # Navigate to the API directory
    print_status "📁 COMMAND: cd apps/api"
    cd apps/api
    
    # Show current directory for debugging
    print_status "📁 RESULT: Current directory: $(pwd)"
    
    # Clean previous build artifacts
    print_status "🧹 COMMAND: rm -rf dist"
    rm -rf dist
    print_status "🧹 COMMAND: rm -rf node_modules/.cache"
    rm -rf node_modules/.cache 2>/dev/null || true
    
    # Clean yarn cache if needed
    print_status "🧹 COMMAND: yarn cache clean"
    yarn cache clean --force 2>/dev/null || true
    
    print_status "📁 STEP: prepare_build() - Completed in directory: $(pwd)"
}

# Function to install dependencies and build (OPTIMIZED for space)
build_application() {
    print_step "Installing dependencies and building application (optimized for space)..."
    
    print_status "📁 STEP: build_application() - Starting in directory: $(pwd)"
    
    # Ensure we're in the apps/api directory
    print_status "🔍 CHECKING: Verifying we're in apps/api directory..."
    if [ ! -f "package.json" ]; then
        print_error "❌ ERROR: Not in apps/api directory - package.json not found"
        exit 1
    fi
    print_status "✅ VERIFIED: We are in apps/api directory (package.json found)"
    
    # CRITICAL FIX: Install ALL dependencies (including dev dependencies) for build
    # We need dev dependencies for building, but we'll clean them up later
    print_status "📦 COMMAND: yarn install --frozen-lockfile"
    yarn install --frozen-lockfile
    
    # Build API package using local scripts (no shared workspace in CCP2)
    print_status "🔨 COMMAND: yarn build"
    yarn build
    
    # Verify build output
    print_status "🔍 CHECKING: Verifying build output..."
    if [ ! -d "dist" ]; then
        print_error "❌ ERROR: Build failed - dist directory not found"
        exit 1
    fi
    print_status "✅ VERIFIED: dist directory exists"
    
    # Verify main.js exists (NestJS outputs to dist/main.js in this repo)
    print_status "🔍 CHECKING: Verifying main.js exists..."
    if [ ! -f "dist/main.js" ]; then
        print_error "❌ ERROR: Build failed - main.js not found in dist directory"
        exit 1
    fi
    print_status "✅ VERIFIED: main.js exists in dist directory"
    
    # OPTIMIZATION: Clean up dev dependencies after build to save space
    print_status "🧹 CLEANING: Removing dev dependencies to save space..."
    yarn install --production --frozen-lockfile
    
    print_status "📁 STEP: build_application() - Completed successfully in directory: $(pwd)"
}

# Function to deploy to production directory (OPTIMIZED)
deploy_to_production() {
    print_step "Deploying to production directory (optimized)..."
    
    print_status "📁 STEP: deploy_to_production() - Starting in directory: $(pwd)"
    
    # Ensure we're in the apps/api directory
    print_status "🔍 CHECKING: Verifying we're in apps/api directory with build..."
    if [ ! -f "package.json" ] || [ ! -d "dist" ]; then
        print_error "❌ ERROR: Not in apps/api directory or build not found"
        exit 1
    fi
    print_status "✅ VERIFIED: We are in apps/api directory with build"
    
    # Create production directory
    print_status "📁 COMMAND: sudo mkdir -p $APP_DIR"
    sudo mkdir -p "$APP_DIR"
    
    # OPTIMIZATION: Copy only essential files
    print_status "📁 COMMAND: sudo rm -rf $APP_DIR/* && sudo mkdir -p $APP_DIR"
    sudo rm -rf "$APP_DIR"/* || true
    print_status "📁 COMMAND: sudo cp -r dist $APP_DIR/"
    sudo cp -r dist "$APP_DIR/"
    
    # Copy the API package.json
    print_status "📁 COMMAND: sudo cp package.json $APP_DIR/"
    sudo cp package.json "$APP_DIR/"
    
    # OPTIMIZATION: Copy only production node_modules (not dev dependencies)
    print_status "📁 COMMAND: sudo cp -r node_modules $APP_DIR/"
    sudo cp -r node_modules "$APP_DIR/"
    
    # No shared package in CCP2 monorepo; nothing else to copy
    
    # Create proper working directory structure
    print_status "🔧 CREATING: Creating proper working directory structure..."
    sudo mkdir -p "$APP_DIR/logs"
    sudo mkdir -p "$APP_DIR/temp"
    sudo chown -R ec2-user:ec2-user "$APP_DIR/logs" "$APP_DIR/temp"
    sudo chmod -R 755 "$APP_DIR/logs" "$APP_DIR/temp"
    
    # Set proper permissions
    print_status "🔐 COMMAND: sudo chown -R ec2-user:ec2-user $APP_DIR"
    sudo chown -R ec2-user:ec2-user "$APP_DIR"
    print_status "🔐 COMMAND: sudo chmod -R 755 $APP_DIR"
    sudo chmod -R 755 "$APP_DIR"
    
    # Copy environment file if it exists
    print_status "📁 CHECKING: Looking for environment file..."
    if [ -f .env.production ]; then
        print_status "📁 COMMAND: sudo cp .env.production $APP_DIR/.env"
        sudo cp .env.production "$APP_DIR/.env"
        print_status "✅ Production environment file copied"
    elif [ -f .env.local ]; then
        print_status "📁 COMMAND: sudo cp .env.local $APP_DIR/.env"
        sudo cp .env.local "$APP_DIR/.env"
        print_status "✅ Local environment file copied as production"
    elif [ -f ../../.env.local ]; then
        print_status "📁 COMMAND: sudo cp ../../.env.local $APP_DIR/.env"
        sudo cp ../../.env.local "$APP_DIR/.env"
        print_status "✅ Root local environment file copied as production"
    else
        print_warning "⚠️ No environment file found - using systemd environment variables"
    fi
    
    # Set proper permissions for environment file
    if [ -f "$APP_DIR/.env" ]; then
        sudo chown ec2-user:ec2-user "$APP_DIR/.env"
        sudo chmod 600 "$APP_DIR/.env"
        print_status "✅ Environment file permissions set correctly"
    fi
    
    print_status "📁 STEP: deploy_to_production() - Completed successfully from directory: $(pwd)"
}

# Function to test application manually
test_application() {
    print_step "Testing application manually before starting service..."
    
    # Check if we're in the production directory
    if [ ! -d "$APP_DIR" ]; then
        print_error "❌ Production directory not found: $APP_DIR"
        exit 1
    fi
    
    # Navigate to production directory
    cd "$APP_DIR"
    print_status "📁 TESTING: Current directory: $(pwd)"
    
    # Check if main.js exists
    if [ ! -f "dist/main.js" ]; then
        print_error "❌ Main.js not found in production directory"
        exit 1
    fi
    
    # Test Node.js syntax
    print_status "🔍 TESTING: Checking Node.js syntax..."
    if ! node --check "dist/main.js" 2>/dev/null; then
        print_error "❌ Main.js has syntax errors"
        exit 1
    fi
    print_status "✅ Main.js syntax is valid"
    
    print_status "🧪 STEP: test_application() - Completed successfully"
}

# Function to setup and start systemd service
setup_service() {
    print_step "Setting up systemd service..."
    
    # Return to API directory for service creation
    cd /home/ec2-user/club-corra-api/club-corra-pilot/apps/api
    
    # Create HTTPS-compatible systemd service file
    print_status "🔧 CREATING: HTTPS-compatible systemd service file..."
    
    # Use HTTP mode behind nginx for production
    print_status "🔧 CONFIGURING: Using HTTP mode behind nginx (recommended for production)"
    
    # Use absolute path for Node.js and ensure proper working directory
    NODE_PATH=$(which node)
    if [ -z "$NODE_PATH" ]; then
        NODE_PATH="/usr/bin/node"
        print_warning "⚠️ Node.js not found in PATH, using default: $NODE_PATH"
    else
        print_status "✅ Found Node.js at: $NODE_PATH"
    fi
    
    # Create service file for HTTP mode behind nginx (production best practice)
    cat > ../../scripts/deployment/club-corra-api-nginx.service << EOF
[Unit]
Description=Club Corra API Service (HTTP Mode behind Nginx)
After=network.target postgresql.service nginx.service
Wants=postgresql.service nginx.service
StartLimitIntervalSec=0

[Service]
Type=simple
User=ec2-user
Group=ec2-user
WorkingDirectory=$APP_DIR
ExecStart=$NODE_PATH dist/main.js
ExecReload=/bin/kill -HUP \$MAINPID
Restart=always
RestartSec=10
StartLimitBurst=5
StartLimitInterval=60

# Environment variables for HTTP mode behind nginx
Environment=NODE_ENV=production
Environment=PORT=8080
Environment=HOST=127.0.0.1
Environment=HTTPS_MODE=false
Environment=CORS_ORIGIN=https://club-corra-pilot-admin.vercel.app,https://club-corra-pilot-admin-git-master-vikas-ahlawats-projects.vercel.app,https://club-corra-pilot-admin-d8hqxkw2x-vikas-ahlawats-projects.vercel.app,https://*.vercel.app,https://admin.clubcorra.com,https://clubcorra.com,https://*.clubcorra.com

# Resource limits
LimitNOFILE=65536
LimitNPROC=4096

# Logging
StandardOutput=journal
StandardError=journal
SyslogIdentifier=club-corra-api

# Security
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ReadWritePaths=$APP_DIR

[Install]
WantedBy=multi-user.target
EOF
        print_status "✅ Nginx-compatible service file created"
        
        # Copy the nginx service file
        print_status "📁 COMMAND: sudo cp ../../scripts/deployment/club-corra-api-nginx.service /etc/systemd/system/$SERVICE_NAME.service"
        sudo cp ../../scripts/deployment/club-corra-api-nginx.service /etc/systemd/system/"$SERVICE_NAME".service
    
    # Reload systemd and enable service
    print_status "⚙️ COMMAND: sudo systemctl daemon-reload"
    sudo systemctl daemon-reload
    print_status "⚙️ COMMAND: sudo systemctl enable $SERVICE_NAME"
    sudo systemctl enable "$SERVICE_NAME"
    
    # Start service
    print_status "🚀 COMMAND: sudo systemctl start $SERVICE_NAME"
    sudo systemctl start "$SERVICE_NAME"
    
    # Wait for service to be ready
    print_status "⏳ WAITING: 5 seconds for service to start..."
    sleep 5
    
    # Check service status
    print_status "🔍 CHECKING: Verifying service status..."
    if sudo systemctl is-active --quiet "$SERVICE_NAME"; then
        print_status "✅ SUCCESS: Service started successfully"
    else
        print_error "❌ ERROR: Service failed to start"
        print_status "📊 SERVICE STATUS:"
        sudo systemctl status "$SERVICE_NAME" --no-pager -l
        
        print_status "📝 SERVICE LOGS (last 50 lines):"
        sudo journalctl -u "$SERVICE_NAME" -n 50 --no-pager
        
        exit 1
    fi
    
    print_status "⚙️ STEP: setup_service() - Completed successfully"
}

# Function to verify deployment
verify_deployment() {
    print_step "Verifying deployment..."
    
    echo "=== Service Status ==="
    sudo systemctl status "$SERVICE_NAME" --no-pager -l
    
    echo -e "\n=== Service Logs (last 20 lines) ==="
    sudo journalctl -u "$SERVICE_NAME" -n 20 --no-pager
    
    echo -e "\n=== Port Listening Check ==="
    netstat -tlnp | grep :8080 || echo "Port 8080 not listening"
    
    echo -e "\n=== Process Check ==="
    ps aux | grep "node.*dist/src/main.js" | grep -v grep || echo "No Node.js process found"
    
    echo -e "\n=== Build Verification ==="
    ls -la "$APP_DIR/dist/"
    
    echo -e "\n=== Dependencies Verification ==="
    if [ -d "$APP_DIR/node_modules/@nestjs" ]; then
        echo "✅ NestJS dependencies found:"
        ls -la "$APP_DIR/node_modules/@nestjs/" | head -5
    else
        echo "❌ NestJS dependencies missing - this will cause startup failure"
    fi
    
    echo -e "\n=== Environment File Check ==="
    if [ -f "$APP_DIR/.env" ]; then
        echo "✅ Environment file exists"
        echo "📝 Key environment variables:"
        grep -E "^(NODE_ENV|PORT|HOST|HTTPS_MODE|DATABASE_URL|JWT_SECRET)" "$APP_DIR/.env" || echo "No key env vars found"
    else
        echo "❌ Environment file missing"
    fi
    
    echo -e "\n=== Package.json Verification ==="
    if [ -f "$APP_DIR/package.json" ]; then
        echo "✅ Package.json exists"
        echo "📝 Package name: $(grep '"name"' "$APP_DIR/package.json" | head -1)"
        echo "📝 Has dependencies: $(grep -q '"dependencies"' "$APP_DIR/package.json" && echo "YES" || echo "NO")"
    else
        echo "❌ Package.json missing"
    fi
}

# Function to run database migrations using compiled dist config
run_migrations() {
    print_step "Running database migrations..."
    
    # Ensure production directory exists
    if [ ! -d "$APP_DIR" ]; then
        print_error "❌ Production directory not found: $APP_DIR"
        exit 1
    fi
    
    # Ensure env has DATABASE_URL
    if [ -f "$APP_DIR/.env" ]; then
        print_status "🔑 Loading environment from $APP_DIR/.env"
        set -a
        # shellcheck disable=SC1090
        . "$APP_DIR/.env"
        set +a
    else
        print_warning "⚠️ No .env file found in $APP_DIR; ensure DATABASE_URL is in environment"
    fi
    
    if [ -z "${DATABASE_URL:-}" ]; then
        print_warning "⚠️ DATABASE_URL not set; migrations will likely fail"
    fi
    
    # Run migrations via Node and dist config
    cd "$APP_DIR"
    print_status "🔨 Executing migrations via TypeORM DataSource (dist/config/typeorm.config.js)"
    if timeout 60s node -e '
        require("reflect-metadata");
        const { DataSource } = require("typeorm");
        let config;
        try {
          ({ typeOrmConfig: config } = require("./dist/config/typeorm.config.js"));
        } catch (e) {
          console.error("Failed to load dist config:", e.message);
          process.exit(1);
        }
        const ds = new DataSource(config);
        ds.initialize()
          .then(() => ds.runMigrations())
          .then((m) => {
            console.log("✅ Migrations completed:", Array.isArray(m) ? m.length : 0);
            return ds.destroy();
          })
          .then(() => process.exit(0))
          .catch((err) => { console.error("❌ Migration error:", err); process.exit(1); });
    ' 2>&1; then
        print_status "✅ Database migrations ran successfully"
    else
        print_warning "⚠️ Database migrations failed; check configuration and logs"
    fi
    cd - >/dev/null 2>&1 || true
}

# Function to run health check
health_check() {
    print_step "Running health check..."
    
    # Wait for service to be ready
    sleep 10
    
    # Test API endpoint (adjust URL as needed)
    if curl -f -s "http://localhost:8080/api/v1/health" > /dev/null; then
        print_status "Health check passed - API is responding"
    else
        print_warning "Health check failed - API may not be ready yet"
        print_status "You can check the logs with: sudo journalctl -u $SERVICE_NAME -f"
    fi
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [--help|--verify|--logs]"
    echo "  --help         Show this help message"
    echo "  --verify       Only verify deployment status"
    echo "  --logs         Show service logs"
    echo ""
    echo "This script deploys the Club Corra API to production on EC2 (optimized for t3.small)."
    echo "Make sure you're running this from the club-corra-pilot directory."
    echo ""
    echo "OPTIMIZATIONS FOR SMALL INSTANCES:"
    echo "  - Only builds API backend (not entire monorepo)"
    echo "  - Installs only production dependencies"
    echo "  - Copies only essential files to production"
    echo "  - Checks disk space before deployment"
    echo ""
    echo "PREREQUISITES:"
    echo "  - Run disk cleanup first: ./scripts/deployment/cleanup-disk-space.sh"
    echo "  - Ensure at least 1GB free disk space"
    echo "  - Node.js v20+ installed"
    echo "  - Yarn package manager available"
}

# Function to show logs
show_logs() {
    print_step "Showing service logs..."
    sudo journalctl -u "$SERVICE_NAME" -f
}

# Main deployment flow
main() {
    print_status "🚀 Starting optimized production deployment for t3.small..."
    print_status "📁 Starting in directory: $(pwd)"
    
    # Check disk space first
    print_status "💾 STEP 1: Checking disk space..."
    check_disk_space
    
    # Check permissions
    print_status "🔐 STEP 2: Checking permissions..."
    check_permissions
    
    # Check and upgrade Node.js if needed
    print_status "🔐 STEP 3: Checking Node.js version..."
    check_and_upgrade_nodejs
    
    # Stop existing service
    print_status "⏹️ STEP 4: Stopping existing service..."
    stop_service
    
    # Backup existing deployment
    print_status "💾 STEP 5: Creating backup..."
    backup_existing
    
    # Prepare build environment
    print_status "🧹 STEP 6: Preparing build environment..."
    prepare_build
    
    # Build application
    print_status "🔨 STEP 7: Building application..."
    build_application
    
    # Deploy to production
    print_status "📁 STEP 8: Deploying to production..."
    deploy_to_production
    
    # Run DB migrations
    print_status "🧳 STEP 8.5: Running database migrations..."
    run_migrations
    
    # Test application manually
    print_status "🧪 STEP 9: Testing application manually..."
    test_application
    
    # Setup and start service
    print_status "⚙️ STEP 10: Setting up systemd service..."
    setup_service
    
    # Verify deployment
    print_status "✅ STEP 11: Verifying deployment..."
    verify_deployment
    
    # Run health check
    print_status "🏥 STEP 12: Running health check..."
    health_check
    
    print_status "🎉 OPTIMIZED DEPLOYMENT COMPLETED SUCCESSFULLY!"
    print_status "📁 Final directory: $(pwd)"
    
    print_status "🔧 Your API is now running as a systemd service"
    print_status "📊 Service status: sudo systemctl status $SERVICE_NAME"
    print_status "📝 View logs: sudo journalctl -u $SERVICE_NAME -f"
    print_status "🔄 Restart service: sudo systemctl restart $SERVICE_NAME"
    print_status "🌐 Nginx status: sudo systemctl status nginx"
    print_status "📝 Nginx logs: sudo journalctl -u nginx -f"
}

# Handle script arguments
case "${1:-}" in
    --help|-h)
        show_usage
        exit 0
        ;;
    --verify)
        verify_deployment
        exit 0
        ;;
    --logs)
        show_logs
        exit 0
        ;;
    *)
        main
        ;;
esac
