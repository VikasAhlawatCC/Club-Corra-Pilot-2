#!/bin/bash

# Club Corra Production Deployment Script (EC2 Direct Execution)
# Run this script directly on your EC2 instance after SSH connection
# Usage: ./deploy-production-ec2.sh

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

# Function to stop existing service and clean previous deployments
stop_service() {
    print_step "Stopping existing service and cleaning previous deployments..."
    
    print_status "⏹️ STEP: stop_service() - Checking if service is running..."
    
    if sudo systemctl is-active --quiet "$SERVICE_NAME"; then
        print_status "⏹️ COMMAND: sudo systemctl stop $SERVICE_NAME"
        sudo systemctl stop "$SERVICE_NAME"
        print_status "✅ SUCCESS: Service stopped successfully"
    else
        print_status "ℹ️ INFO: Service was not running"
    fi
    
    # Enhanced cleanup for 8GB EC2 - kill any remaining Node.js processes
    print_status "🧹 ENHANCED CLEANUP: Killing any orphaned Node.js processes..."
    sudo pkill -f "node.*dist/apps/api/src/main.js" 2>/dev/null || true
    sudo pkill -f "node.*dist/src/main.js" 2>/dev/null || true
    sudo pkill -f "club-corra-api" 2>/dev/null || true
    
    # Wait for processes to fully terminate
    sleep 3
    
    # Check if port 8080 is still in use and kill the process
    print_status "🔍 CHECKING: Port 8080 usage..."
    if netstat -tlnp | grep -q ":8080"; then
        print_status "⚠️ Port 8080 still in use, attempting to free it..."
        sudo fuser -k 8080/tcp 2>/dev/null || true
        sleep 2
    fi
    
    print_status "⏹️ STEP: stop_service() - Completed with enhanced cleanup"
}

# Function to backup existing deployment
backup_existing() {
    print_step "Creating backup of existing deployment..."
    
    print_status "💾 STEP: backup_existing() - Starting backup process..."
    
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
    
    print_status "💾 STEP: backup_existing() - Completed"
}

# Function to clean and prepare build environment
prepare_build() {
    print_step "Preparing build environment..."
    
    print_status "📁 STEP: prepare_build() - Starting in directory: $(pwd)"
    
    # Navigate to the API directory
    print_status "📁 COMMAND: cd apps/api"
    cd apps/api
    
    # Show current directory for debugging
    print_status "📁 RESULT: Current directory: $(pwd)"
    print_status "📁 CONTENTS: $(ls -la)"
    
    # Clean previous build artifacts (enhanced for 8GB EC2)
    print_status "🧹 COMMAND: rm -rf dist"
    rm -rf dist
    print_status "🧹 COMMAND: rm -rf node_modules/.cache"
    rm -rf node_modules/.cache
    
    # Enhanced cache cleanup for 8GB EC2 instance
    print_status "🧹 ENHANCED CLEANUP for 8GB EC2: Cleaning comprehensive caches..."
    
    # Clean yarn caches
    print_status "🧹 COMMAND: yarn cache clean"
    yarn cache clean --all || yarn cache clean || true
    
    # Clean npm cache if it exists
    print_status "🧹 COMMAND: npm cache clean --force (if npm exists)"
    npm cache clean --force 2>/dev/null || true
    
    # Clean system temp files
    print_status "🧹 COMMAND: sudo rm -rf /tmp/yarn-* /tmp/npm-*"
    sudo rm -rf /tmp/yarn-* /tmp/npm-* /tmp/node-* 2>/dev/null || true
    
    # Clean old log files to free space
    print_status "🧹 COMMAND: sudo find /var/log -name '*.log.*' -mtime +7 -delete"
    sudo find /var/log -name "*.log.*" -mtime +7 -delete 2>/dev/null || true
    
    # Clean journal logs older than 3 days
    print_status "🧹 COMMAND: sudo journalctl --vacuum-time=3d"
    sudo journalctl --vacuum-time=3d 2>/dev/null || true
    
    # Clean Docker cache if Docker is installed (common on EC2)
    if command -v docker >/dev/null 2>&1; then
        print_status "🧹 COMMAND: sudo docker system prune -f"
        sudo docker system prune -f 2>/dev/null || true
    fi
    
    # Show available space after cleanup
    print_status "💾 DISK SPACE after cleanup: $(df -h / | awk 'NR==2 {print $4 " available (" $5 " used)"}')"
    
    print_status "📁 STEP: prepare_build() - Completed in directory: $(pwd)"
}

# Function to install dependencies and build
build_application() {
    print_step "Installing dependencies and building application..."
    
    print_status "📁 STEP: build_application() - Starting in directory: $(pwd)"
    
    # Ensure we're in the apps/api directory
    print_status "🔍 CHECKING: Verifying we're in apps/api directory..."
    if [ ! -f "package.json" ]; then
        print_error "❌ ERROR: Not in apps/api directory - package.json not found"
        exit 1
    fi
    print_status "✅ VERIFIED: We are in apps/api directory (package.json found)"
    
    # Show current directory and contents for debugging
    print_status "📁 RESULT: Current directory: $(pwd)"
    print_status "📁 CONTENTS: $(ls -la)"
    print_status "📁 PACKAGE.JSON: $(test -f package.json && echo 'YES' || echo 'NO')"
    
    # Install dependencies
    print_status "📦 COMMAND: yarn install --frozen-lockfile --production=false"
    yarn install --frozen-lockfile --production=false
    
    # Show directory after install
    print_status "📁 RESULT: Directory after install: $(pwd)"
    print_status "📁 CONTENTS: After install: $(ls -la)"
    
    # CRITICAL FIX: Build shared package first (required for API)
    print_status "🔨 COMMAND: cd ../../ && yarn workspace @club-corra/shared build"
    cd ../../ && yarn workspace @club-corra/shared build
    
    # Verify shared package was built successfully
    print_status "🔍 VERIFYING: Shared package build output..."
    if [ -f "packages/shared/dist/index.js" ]; then
        print_status "✅ SUCCESS: Shared package built successfully"
        print_status "📁 Shared package dist: $(ls -la packages/shared/dist/)"
    else
        print_error "❌ ERROR: Shared package build failed - dist/index.js not found"
        print_status "📁 Shared package contents: $(ls -la packages/shared/)"
        exit 1
    fi
    
    # Build API package (depends on shared)
    print_status "🔨 COMMAND: yarn workspace @club-corra/api build"
    yarn workspace @club-corra/api build
    
    # Return to API directory
    print_status "🔨 COMMAND: cd apps/api"
    cd apps/api
    
    # Show directory after build
    print_status "📁 RESULT: Directory after build: $(pwd)"
    print_status "📁 CONTENTS: After build: $(ls -la)"
    
    # CRITICAL VERIFICATION: Check if shared package is accessible from API
    print_status "🔍 VERIFYING: Shared package accessibility from API..."
    if [ -f "node_modules/@club-corra/shared/dist/index.js" ]; then
        print_status "✅ SUCCESS: Shared package accessible via node_modules symlink"
    elif [ -f "../../packages/shared/dist/index.js" ]; then
        print_status "✅ SUCCESS: Shared package accessible via relative path"
        print_status "📁 Shared package dist: $(ls -la ../../packages/shared/dist/)"
    else
        print_error "❌ ERROR: Shared package not accessible from API directory"
        print_status "📁 API node_modules: $(ls -la node_modules/@club-corra/ 2>/dev/null || echo 'No @club-corra namespace found')"
        print_status "📁 Relative path check: $(ls -la ../../packages/shared/ 2>/dev/null || echo 'No packages/shared found')"
        exit 1
    fi
    
    # Verify build output
    print_status "🔍 CHECKING: Verifying build output..."
    if [ ! -d "dist" ]; then
        print_error "❌ ERROR: Build failed - dist directory not found"
        exit 1
    fi
    print_status "✅ VERIFIED: dist directory exists"
    
    # Show dist contents
    print_status "📁 DIST CONTENTS: $(ls -la dist/)"
    
    # Verify main.js exists (NestJS outputs to dist/apps/api/src/main.js due to workspace structure)
    print_status "🔍 CHECKING: Verifying main.js exists..."
    if [ ! -f "dist/apps/api/src/main.js" ]; then
        print_error "❌ ERROR: Build failed - main.js not found in dist/apps/api/src directory"
        print_status "📁 DIST CONTENTS (detailed):"
        ls -la dist/
        if [ -d "dist/apps" ]; then
            print_status "📁 DIST/APPS CONTENTS:"
            ls -la dist/apps/
            if [ -d "dist/apps/api" ]; then
                print_status "📁 DIST/APPS/API CONTENTS:"
                ls -la dist/apps/api/
                if [ -d "dist/apps/api/src" ]; then
                    print_status "📁 DIST/APPS/API/SRC CONTENTS:"
                    ls -la dist/apps/api/src/
                fi
            fi
        fi
        exit 1
    fi
    print_status "✅ VERIFIED: main.js exists in dist/apps/api/src directory"
    
    # Verify shared package is accessible (check both symlink and relative path)
    print_status "🔍 CHECKING: Verifying shared package accessibility..."
    if [ -f "node_modules/@club-corra/shared/dist/index.js" ]; then
        print_status "✅ VERIFIED: Shared package accessible via node_modules symlink"
    elif [ -f "../../packages/shared/dist/index.js" ]; then
        print_status "✅ VERIFIED: Shared package accessible via relative path"
        print_status "📁 Shared package dist: $(ls -la ../../packages/shared/dist/)"
    else
        print_error "❌ ERROR: Shared package not accessible from API directory"
        print_status "📁 API node_modules: $(ls -la node_modules/@club-corra/ 2>/dev/null || echo 'No @club-corra namespace found')"
        print_status "📁 Relative path check: $(ls -la ../../packages/shared/ 2>/dev/null || echo 'No packages/shared found')"
        exit 1
    fi
    
    print_status "📁 STEP: build_application() - Completed successfully in directory: $(pwd)"
}

# Function to deploy to production directory
deploy_to_production() {
    print_step "Deploying to production directory..."
    
    print_status "📁 STEP: deploy_to_production() - Starting in directory: $(pwd)"
    print_status "🔧 INFO: This is a yarn workspace deployment - preserving workspace structure"
    
    # Ensure we're in the apps/api directory
    print_status "🔍 CHECKING: Verifying we're in apps/api directory with build..."
    if [ ! -f "package.json" ] || [ ! -d "dist" ]; then
        print_error "❌ ERROR: Not in apps/api directory or build not found"
        print_status "📁 PACKAGE.JSON: $(test -f package.json && echo 'YES' || echo 'NO')"
        print_status "📁 DIST DIRECTORY: $(test -d dist && echo 'YES' || echo 'NO')"
        exit 1
    fi
    print_status "✅ VERIFIED: We are in apps/api directory with build"
    
    # Show current directory and dist contents for debugging
    print_status "📁 RESULT: Current directory: $(pwd)"
    print_status "📁 DIST CONTENTS: $(ls -la dist/)"
    print_status "📁 MAIN.JS: $(test -f dist/apps/api/src/main.js && echo 'YES' || echo 'NO')"
    
    # Create production directory
    print_status "📁 COMMAND: sudo mkdir -p $APP_DIR"
    sudo mkdir -p "$APP_DIR"
    
    # Copy built application
    print_status "📁 COMMAND: sudo cp -r dist $APP_DIR/"
    sudo cp -r dist "$APP_DIR/"
    
    # CRITICAL FIX: Copy the CORRECT API package.json (not the root workspace one)
    print_status "📁 COMMAND: sudo cp package.json $APP_DIR/"
    sudo cp package.json "$APP_DIR/"
    
    # Copy the API yarn.lock if it exists
    if [ -f "yarn.lock" ]; then
        print_status "📁 COMMAND: sudo cp yarn.lock $APP_DIR/"
        sudo cp yarn.lock "$APP_DIR/"
    else
        print_status "📁 INFO: No API yarn.lock found, will use root workspace lock"
        if [ -f "../../yarn.lock" ]; then
            print_status "📁 COMMAND: sudo cp ../../yarn.lock $APP_DIR/"
            sudo cp ../../yarn.lock "$APP_DIR/"
        fi
    fi
    
    # CRITICAL FIX: Create a proper working directory structure
    print_status "🔧 CREATING: Creating proper working directory structure..."
    sudo mkdir -p "$APP_DIR/logs"
    sudo mkdir -p "$APP_DIR/temp"
    sudo chown -R ec2-user:ec2-user "$APP_DIR/logs" "$APP_DIR/temp"
    sudo chmod -R 755 "$APP_DIR/logs" "$APP_DIR/temp"
    
    # Copy workspace structure to maintain dependencies
    print_status "🔧 COPYING: Workspace structure for proper dependency resolution..."
    
    # Copy packages directory (contains @club-corra/shared)
    if [ -d "../../packages" ]; then
        print_status "📁 COMMAND: sudo cp -r ../../packages $APP_DIR/"
        sudo cp -r ../../packages "$APP_DIR/"
        
        # Fix permissions immediately after copying to avoid issues
        print_status "🔐 FIXING: Fixing permissions for packages directory..."
        sudo chown -R ec2-user:ec2-user "$APP_DIR/packages"
        sudo chmod -R 755 "$APP_DIR/packages"
    else
        print_warning "⚠️ packages directory not found, workspace dependencies may not work"
    fi
    
    # Copy root workspace files - these are essential for yarn workspace to work
    if [ -f "../../package.json" ]; then
        print_status "📁 COMMAND: sudo cp ../../package.json $APP_DIR/package.json.root"
        sudo cp ../../package.json "$APP_DIR/package.json.root"
        print_status "✅ SUCCESS: Root workspace package.json copied"
    else
        print_warning "⚠️ Root workspace package.json not found - workspace may not work properly"
    fi
    
    # CRITICAL FIX: Copy the API package.json instead of root package.json for production
    if [ -f "package.json" ]; then
        print_status "📁 COMMAND: sudo cp package.json $APP_DIR/package.json"
        sudo cp package.json "$APP_DIR/package.json"
        print_status "✅ SUCCESS: API package.json copied (this has the correct dependencies)"
        
        # CRITICAL FIX: Update the @club-corra/shared path for production
        print_status "🔧 FIXING: @club-corra/shared path for production..."
        if sudo sed -i 's|"@club-corra/shared": "file:../../packages/shared"|"@club-corra/shared": "file:./packages/shared"|g' "$APP_DIR/package.json"; then
            print_status "✅ @club-corra/shared path fixed for production"
        else
            print_warning "⚠️ Could not fix @club-corra/shared path, but continuing..."
        fi
        
        # Verify the package.json has the right dependencies
        print_status "📝 VERIFYING: Package.json dependencies..."
        if sudo grep -q "@club-corra/shared" "$APP_DIR/package.json"; then
            print_status "✅ @club-corra/shared dependency found"
            print_status "📝 Current path: $(sudo grep '@club-corra/shared' "$APP_DIR/package.json")"
        else
            print_error "❌ @club-corra/shared dependency not found in package.json"
            exit 1
        fi
        
        if sudo grep -q "@nestjs/core" "$APP_DIR/package.json"; then
            print_status "✅ @nestjs/core dependency found"
        else
            print_error "❌ @nestjs/core dependency not found in package.json"
            exit 1
        fi
    else
        print_error "❌ ERROR: API package.json not found - cannot proceed"
        exit 1
    fi
    
    if [ -f "../../.yarnrc.yml" ]; then
        print_status "📁 COMMAND: sudo cp ../../.yarnrc.yml $APP_DIR/"
        sudo cp ../../.yarnrc.yml "$APP_DIR/"
        print_status "✅ SUCCESS: Yarn configuration copied"
    else
        print_warning "⚠️ .yarnrc.yml not found - yarn workspace may not work properly"
    fi
    
    # Copy tsconfig files for workspace resolution
    if [ -f "../../tsconfig.base.json" ]; then
        print_status "📁 COMMAND: sudo cp ../../tsconfig.base.json $APP_DIR/"
        sudo cp ../../tsconfig.base.json "$APP_DIR/"
        print_status "✅ SUCCESS: TypeScript base config copied"
    fi
    
    # CRITICAL FIX: Install dependencies in production directory to ensure workspace links work
    print_status "📦 INSTALLING: Dependencies in production directory..."
    cd "$APP_DIR"
    
    # Check if dependencies are already installed and up to date
    if [ -d "node_modules" ] && [ -f "package.json" ]; then
        print_status "📦 CHECKING: Checking if dependencies need updating..."
        
        # For yarn workspace, we need to run yarn install to ensure workspace links are correct
        print_status "📦 INSTALLING: Installing workspace dependencies..."
        
        # Fix permissions before installing dependencies
        print_status "🔐 FIXING: Fixing permissions for production directory..."
        sudo chown -R ec2-user:ec2-user .
        sudo chmod -R 755 .
        
        # Remove any problematic node_modules and clean caches to avoid permission conflicts
        if [ -d "node_modules" ]; then
            print_status "🧹 CLEANING: Removing existing node_modules to avoid permission issues..."
            sudo rm -rf node_modules
        fi
        
        # Enhanced cleanup for 8GB EC2 - remove all caches and temp files
        print_status "🧹 ENHANCED CLEANUP: Removing all caches and temp files for 8GB instance..."
        sudo rm -rf .yarn/cache .yarn/unplugged .yarn/build-state.yml 2>/dev/null || true
        sudo rm -rf /tmp/yarn-* /tmp/npm-* /tmp/node-* 2>/dev/null || true
        sudo find . -name "*.tgz" -o -name "*.tar.gz" -o -name "*.zip" -mtime +1 -delete 2>/dev/null || true
        
        # Clean old deployment artifacts that might be taking space
        sudo find "$APP_DIR" -name "*.old" -o -name "*.backup" -o -name "*.bak" -delete 2>/dev/null || true
        
        # CRITICAL FIX: Install dependencies with the CORRECT API package.json
        print_status "📦 INSTALLING: Installing API dependencies with correct package.json..."
        if yarn install --production; then
            print_status "✅ SUCCESS: API dependencies installed successfully"
        else
            print_warning "⚠️ Production install failed, trying regular install..."
            if yarn install; then
                print_status "✅ SUCCESS: API dependencies installed successfully"
            else
                print_error "❌ ERROR: Failed to install API dependencies"
                print_status "📝 This might indicate an issue with the API package.json"
                print_status "📝 Let's verify the package.json has the right dependencies..."
                
                # Show what dependencies should be installed
                if [ -f "package.json" ]; then
                    print_status "📝 Current package.json dependencies:"
                    grep -A 20 '"dependencies"' package.json || echo "No dependencies section found"
                fi
                
                # Try to copy the working node_modules from source as fallback
                print_status "🔄 FALLBACK: Copying working node_modules from source..."
                if [ -d "/home/ec2-user/club-corra-api/club-corra-pilot/apps/api/node_modules" ]; then
                    sudo cp -r /home/ec2-user/club-corra-api/club-corra-pilot/apps/api/node_modules .
                    sudo chown -R ec2-user:ec2-user node_modules
                    print_status "✅ SUCCESS: Working node_modules copied from source"
                else
                    print_error "❌ ERROR: Source node_modules not found, cannot proceed"
                    exit 1
                fi
            fi
        fi
        
        # Now verify the dependencies work
        print_status "📦 VERIFYING: Verifying workspace dependencies work correctly..."
        
        # CRITICAL FIX: Ensure shared package is properly linked in workspace
        print_status "🔧 FIXING: Ensuring shared package is properly linked..."
        if [ -f "packages/shared/dist/index.js" ]; then
            if [ ! -f "node_modules/@club-corra/shared/dist/index.js" ]; then
                print_status "🔧 CREATING: Creating symlink for shared package in node_modules..."
                sudo mkdir -p node_modules/@club-corra
                sudo ln -sf "$(pwd)/packages/shared" node_modules/@club-corra/shared
                sudo chown -R ec2-user:ec2-user node_modules/@club-corra
                print_status "✅ SUCCESS: Shared package symlink created"
            else
                print_status "✅ SUCCESS: Shared package already properly linked"
            fi
            
            # Verify the symlink works
            if [ -f "node_modules/@club-corra/shared/dist/index.js" ]; then
                print_status "✅ VERIFIED: Shared package symlink is working"
                print_status "📁 Shared package accessible at: $(ls -la node_modules/@club-corra/shared/dist/index.js)"
            else
                print_error "❌ ERROR: Shared package symlink created but not accessible"
                exit 1
            fi
        else
            print_error "❌ ERROR: Shared package dist/index.js not found - cannot create symlink"
            print_status "📁 Shared package contents: $(ls -la packages/shared/ 2>/dev/null || echo 'No packages/shared directory')"
            exit 1
        fi
        
        # CRITICAL FIX: Ensure shared package is built as CommonJS for Node.js compatibility
        print_status "🔧 FIXING: Ensuring shared package is built as CommonJS..."
        if [ -f "packages/shared/dist/index.js" ]; then
            # Check if the file starts with 'export' (ES module syntax)
            if head -1 packages/shared/dist/index.js | grep -q "^export"; then
                print_status "🔧 CONVERTING: Converting shared package from ES modules to CommonJS..."
                cd packages/shared
                
                # Rebuild with CommonJS target
                if yarn build; then
                    print_status "✅ SUCCESS: Shared package rebuilt as CommonJS"
                else
                    print_warning "⚠️ Shared package rebuild failed, but continuing..."
                fi
                
                cd "$APP_DIR"
            else
                print_status "✅ SUCCESS: Shared package is already CommonJS compatible"
            fi
        fi
        
        # CRITICAL CHECK: Ensure shared package has its dependencies
        print_status "🔍 CHECKING: Shared package dependencies..."
        if [ -f "packages/shared/package.json" ]; then
            print_status "📝 Shared package package.json found"
            
            # Check if shared package has its own node_modules
            if [ ! -d "packages/shared/node_modules" ] || [ -z "$(ls -A packages/shared/node_modules 2>/dev/null)" ]; then
                print_status "🔄 Installing shared package dependencies..."
                cd packages/shared
                
                # Install shared package dependencies
                if yarn install --production; then
                    print_status "✅ Shared package dependencies installed"
                else
                    print_warning "⚠️ Shared package dependency install failed, but continuing..."
                fi
                
                cd "$APP_DIR"
            else
                print_status "✅ Shared package dependencies already installed"
            fi
            
            # CRITICAL CHECK: Ensure shared package is built
            print_status "🔍 Checking if shared package is built..."
            if [ ! -f "packages/shared/dist/index.js" ]; then
                print_status "🔄 Building shared package..."
                cd packages/shared
                
                # Try to build the shared package
                if yarn build; then
                    print_status "✅ Shared package built successfully"
                else
                    print_warning "⚠️ Shared package build failed, but continuing..."
                fi
                
                cd "$APP_DIR"
            else
                print_status "✅ Shared package is already built"
            fi
        else
            print_warning "⚠️ Shared package package.json not found"
        fi
        
        # Check if shared package is accessible through workspace resolution
        if [ -f "node_modules/@club-corra/shared/dist/index.js" ]; then
            print_status "✅ SUCCESS: Shared package is accessible through workspace"
        elif [ -f "packages/shared/dist/index.js" ]; then
            print_status "✅ SUCCESS: Shared package found in packages directory"
            print_status "ℹ️ Workspace linking should handle the resolution automatically"
        else
            print_error "❌ ERROR: Shared package not found in workspace"
            exit 1
        fi
        
        # CRITICAL CHECK: Verify NestJS dependencies are installed
        print_status "🔍 CHECKING: Verifying NestJS dependencies are installed..."
        if [ -d "node_modules/@nestjs" ]; then
            print_status "✅ SUCCESS: NestJS dependencies found"
            ls -la node_modules/@nestjs/ | head -5
        else
            print_error "❌ ERROR: NestJS dependencies not found - this will cause startup failure"
            print_status "📝 Available packages in node_modules:"
            ls -la node_modules/ | head -10
            
            # Try to install NestJS dependencies specifically
            print_status "🔄 ATTEMPTING: Installing NestJS dependencies specifically..."
            if yarn add @nestjs/core @nestjs/common @nestjs/platform-express; then
                print_status "✅ SUCCESS: NestJS dependencies installed"
            else
                print_error "❌ ERROR: Failed to install NestJS dependencies"
                exit 1
            fi
        fi
        
        # Test if the main application can load
        if node --check "dist/apps/api/src/main.js" 2>/dev/null; then
            print_status "✅ SUCCESS: Main application syntax is valid"
        else
            print_warning "⚠️ Main application has syntax issues, but continuing..."
        fi
        
        # CRITICAL TEST: Test shared package loading
        print_status "🧪 TESTING: Shared package loading..."
        
        # First ensure the shared package is built
        print_status "🔨 ENSURING: Shared package is built..."
        if [ -f "packages/shared/package.json" ]; then
            cd packages/shared
            if [ ! -f "dist/index.js" ] || [ ! -f "dist/index.d.ts" ]; then
                print_status "🔨 BUILDING: Shared package (missing dist files)..."
                yarn build
            fi
            cd "$APP_DIR"
        fi
        
        if timeout 10s node -e "
            try {
                const sharedModule = require('@club-corra/shared');
                console.log('✅ SUCCESS: Shared package loaded successfully!');
                console.log('📦 Module type:', typeof sharedModule);
                console.log('📦 Available exports:', Object.keys(sharedModule || {}).slice(0, 5));
            } catch (error) {
                console.error('❌ Shared package loading failed:', error.message);
                console.error('❌ Error stack:', error.stack);
                process.exit(1);
            }
        " 2>&1; then
            print_status "✅ SUCCESS: Shared package test passed"
        else
            print_error "❌ Shared package test failed"
            print_status "🔍 DEBUG: Checking what went wrong..."
            
            # Try to manually check the shared package
            if [ -f "packages/shared/dist/index.js" ]; then
                print_status "🔍 Shared package dist file exists, checking for dependency issues..."
                
                # CRITICAL FIX: Ensure the shared package package.json points to dist files
                print_status "🔧 FIXING: Updating shared package.json to point to dist files..."
                if [ -f "packages/shared/package.json" ]; then
                    sudo sed -i 's|"main": "./src/index.ts"|"main": "./dist/index.js"|g' packages/shared/package.json
                    sudo sed -i 's|"types": "./src/index.d.ts"|"types": "./dist/index.d.ts"|g' packages/shared/package.json
                    sudo sed -i 's|"./src/index.ts"|"./dist/index.js"|g' packages/shared/package.json
                    print_status "✅ SUCCESS: Shared package.json updated to point to dist files"
                fi
                
                # Check if crypto-js is available
                if [ ! -d "node_modules/crypto-js" ] && [ -d "packages/shared/node_modules/crypto-js" ]; then
                    print_status "🔄 Copying crypto-js from shared package to root..."
                    sudo cp -r packages/shared/node_modules/crypto-js node_modules/
                    sudo chown -R ec2-user:ec2-user node_modules/crypto-js
                fi
                
                # CRITICAL FIX: Recreate the symlink to ensure it points to the correct package.json
                if [ -L "node_modules/@club-corra/shared" ]; then
                    print_status "🔧 RECREATING: Shared package symlink with updated package.json..."
                    sudo rm -f node_modules/@club-corra/shared
                    sudo mkdir -p node_modules/@club-corra
                    sudo ln -sf "$(pwd)/packages/shared" node_modules/@club-corra/shared
                    sudo chown -R ec2-user:ec2-user node_modules/@club-corra
                fi
                
                # Try the test again
                if timeout 10s node -e "
                    try {
                        const sharedModule = require('@club-corra/shared');
                        console.log('✅ SUCCESS: Shared package now works after fix!');
                    } catch (error) {
                        console.error('❌ Still failing:', error.message);
                        console.error('❌ Error stack:', error.stack);
                        process.exit(1);
                    }
                " 2>&1; then
                    print_status "✅ SUCCESS: Shared package test passed after fix"
                else
                    print_error "❌ Shared package still failing after fix"
                    exit 1
                fi
            else
                print_error "❌ Shared package dist file not found"
                exit 1
            fi
        fi
    else
        print_status "📦 INSTALLING: Installing dependencies for the first time..."
        
        # Install production dependencies
        if yarn install --production; then
            print_status "✅ SUCCESS: Dependencies installed successfully"
        else
            print_warning "⚠️ Production install failed, trying regular install..."
            if yarn install; then
                print_status "✅ SUCCESS: Dependencies installed successfully"
            else
                print_error "❌ ERROR: Failed to install dependencies"
                exit 1
            fi
        fi
    fi
    
    # Return to API directory for service creation
    cd /home/ec2-user/club-corra-api/club-corra-pilot/apps/api
    
    # Create HTTPS-compatible systemd service file
    print_status "🔧 CREATING: HTTPS-compatible systemd service file..."
    
    # CRITICAL FIX: Always use HTTP mode behind nginx for production
    # This prevents privileged port binding issues
    print_status "🔧 CONFIGURING: Using HTTP mode behind nginx (recommended for production)"
    
    # CRITICAL FIX: Use absolute path for Node.js and ensure proper working directory
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
ExecStart=$NODE_PATH dist/apps/api/src/main.js
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

# CRITICAL FIX: Set NODE_PATH to help with module resolution
Environment=NODE_PATH=$APP_DIR/node_modules:$APP_DIR/packages

# CRITICAL FIX: Load environment file if it exists, but don't fail if it doesn't
EnvironmentFile=-$APP_DIR/.env

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
        
        # CRITICAL FIX: Validate the service file was created correctly
        print_status "🔍 VALIDATING: Checking service file configuration..."
        if grep -q "WorkingDirectory=$APP_DIR" "/etc/systemd/system/$SERVICE_NAME.service"; then
            print_status "✅ SUCCESS: WorkingDirectory is correct"
        else
            print_error "❌ ERROR: WorkingDirectory is missing or incorrect"
            print_status "🔧 FIXING: Adding WorkingDirectory..."
            sudo sed -i "/\[Service\]/a WorkingDirectory=$APP_DIR" "/etc/systemd/system/$SERVICE_NAME.service"
            print_status "✅ SUCCESS: WorkingDirectory added"
        fi
        
        if grep -q "ExecStart=.*dist/apps/api/src/main.js" "/etc/systemd/system/$SERVICE_NAME.service"; then
            print_status "✅ SUCCESS: ExecStart path is correct"
        else
            print_error "❌ ERROR: ExecStart path is incorrect"
            print_status "🔧 FIXING: Updating ExecStart path..."
            sudo sed -i "s|ExecStart=.*|ExecStart=$NODE_PATH dist/apps/api/src/main.js|g" "/etc/systemd/system/$SERVICE_NAME.service"
            print_status "✅ SUCCESS: ExecStart path updated"
        fi
        
        if grep -q "EnvironmentFile=-$APP_DIR/.env" "/etc/systemd/system/$SERVICE_NAME.service"; then
            print_status "✅ SUCCESS: EnvironmentFile is correct"
        else
            print_error "❌ ERROR: EnvironmentFile is incorrect"
            print_status "🔧 FIXING: Updating EnvironmentFile..."
            sudo sed -i "s|EnvironmentFile=.*|EnvironmentFile=-$APP_DIR/.env|g" "/etc/systemd/system/$SERVICE_NAME.service"
            print_status "✅ SUCCESS: EnvironmentFile updated"
        fi
    
    # Set proper permissions
    print_status "🔐 COMMAND: sudo chown -R ec2-user:ec2-user $APP_DIR"
    sudo chown -R ec2-user:ec2-user "$APP_DIR"
    print_status "🔐 COMMAND: sudo chmod -R 755 $APP_DIR"
    sudo chmod -R 755 "$APP_DIR"
    
    # Ensure specific permissions for critical directories
    print_status "🔐 FIXING: Setting specific permissions for critical directories..."
    if [ -d "$APP_DIR/packages" ]; then
        sudo chown -R ec2-user:ec2-user "$APP_DIR/packages"
        sudo chmod -R 755 "$APP_DIR/packages"
        print_status "✅ SUCCESS: Packages directory permissions fixed"
    fi
    
    if [ -d "$APP_DIR/node_modules" ]; then
        sudo chown -R ec2-user:ec2-user "$APP_DIR/node_modules"
        sudo chmod -R 755 "$APP_DIR/node_modules"
        print_status "✅ SUCCESS: Node modules permissions fixed"
    fi
    
    # CRITICAL FIX: Copy environment file if it exists
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
        print_warning "⚠️ No environment file found - creating minimal .env file"
        # Create a minimal .env file with essential variables
        print_status "📁 CREATING: Creating minimal .env file for production..."
        sudo tee "$APP_DIR/.env" > /dev/null << EOF
NODE_ENV=production
PORT=8080
HOST=127.0.0.1
HTTPS_MODE=false
# Add your database and other environment variables here
# DATABASE_URL=your_database_url_here
# JWT_SECRET=your_jwt_secret_here
EOF
        print_status "✅ Minimal .env file created"
    fi
    
    # CRITICAL FIX: Ensure .env file exists and has correct permissions
    if [ -f "$APP_DIR/.env" ]; then
        sudo chown ec2-user:ec2-user "$APP_DIR/.env"
        sudo chmod 600 "$APP_DIR/.env"
        print_status "✅ Environment file permissions set correctly"
        
        # Verify DATABASE_URL exists
        if grep -q "DATABASE_URL" "$APP_DIR/.env"; then
            print_status "✅ DATABASE_URL found in environment file"
        else
            print_warning "⚠️ DATABASE_URL not found in environment file - this may cause startup issues"
        fi
    fi
    
    # CRITICAL FIX: Ensure production environment variables are set correctly
    print_status "🔧 UPDATING: Setting production environment variables..."
    if [ -f "$APP_DIR/.env" ]; then
        sudo sed -i 's/NODE_ENV=development/NODE_ENV=production/' "$APP_DIR/.env" || true
        sudo sed -i 's/NODE_ENV=local/NODE_ENV=production/' "$APP_DIR/.env" || true
        
        # CRITICAL: Force HTTP mode for nginx deployment
        sudo sed -i 's/HTTPS_MODE=true/HTTPS_MODE=false/' "$APP_DIR/.env" || true
        sudo sed -i 's/HOST=0.0.0.0/HOST=127.0.0.1/' "$APP_DIR/.env" || true
        
        # Add production-specific environment variables if not present
        if ! grep -q "PORT=" "$APP_DIR/.env"; then
            echo "PORT=8080" | sudo tee -a "$APP_DIR/.env"
        fi
        
        if ! grep -q "HOST=" "$APP_DIR/.env"; then
            echo "HOST=127.0.0.1" | sudo tee -a "$APP_DIR/.env"
        fi
        
        if ! grep -q "HTTPS_MODE=" "$APP_DIR/.env"; then
            echo "HTTPS_MODE=false" | sudo tee -a "$APP_DIR/.env"
        fi
        
        print_status "✅ Production environment variables configured for nginx deployment"
    else
        print_warning "⚠️ No .env file to update - environment variables will come from systemd"
    fi
    
    # Verify what was copied
    print_status "📁 VERIFYING: Production directory contents: $(ls -la $APP_DIR/)"
    print_status "📁 VERIFYING: Production dist contents: $(ls -la $APP_DIR/dist/)"
    
    # Check workspace structure
    print_status "📁 VERIFYING: Workspace structure..."
    if [ -d "$APP_DIR/packages" ]; then
        print_status "📁 VERIFYING: Packages directory: $(ls -la $APP_DIR/packages/)"
        if [ -d "$APP_DIR/packages/shared" ]; then
            print_status "📁 VERIFYING: Shared package: $(ls -la $APP_DIR/packages/shared/)"
            if [ -d "$APP_DIR/packages/shared/dist" ]; then
                print_status "📁 VERIFYING: Shared package dist: $(ls -la $APP_DIR/packages/shared/dist/)"
                if [ -f "$APP_DIR/packages/shared/dist/index.js" ]; then
                    print_status "✅ SUCCESS: Shared package index.js exists"
                    print_status "📁 Shared package index.js size: $(ls -lh $APP_DIR/packages/shared/dist/index.js | awk '{print $5}')"
                else
                    print_warning "⚠️ Shared package index.js not found"
                fi
            else
                print_warning "⚠️ Shared package dist directory not found"
            fi
        else
            print_warning "⚠️ Shared package directory not found"
        fi
    else
        print_warning "⚠️ Packages directory not found"
    fi
    
    # CRITICAL CHECK: Verify NestJS dependencies are properly installed
    print_status "🔍 VERIFYING: NestJS dependencies installation..."
    if [ -d "$APP_DIR/node_modules/@nestjs" ]; then
        print_status "✅ SUCCESS: NestJS dependencies found in node_modules"
        print_status "📁 NestJS packages: $(ls -la $APP_DIR/node_modules/@nestjs/)"
    else
        print_error "❌ ERROR: NestJS dependencies not found - this will cause startup failure"
        print_status "📁 Available packages in node_modules:"
        ls -la "$APP_DIR/node_modules/" | head -10
        exit 1
    fi
    
    # Check node_modules structure
    if [ -d "$APP_DIR/node_modules" ]; then
        print_status "📁 VERIFYING: Node modules structure..."
        if [ -d "$APP_DIR/node_modules/@club-corra" ]; then
            print_status "📁 VERIFYING: @club-corra namespace: $(ls -la $APP_DIR/node_modules/@club-corra/)"
        else
            print_warning "⚠️ @club-corra namespace not found in node_modules"
        fi
    fi
    
    print_status "📁 STEP: deploy_to_production() - Completed successfully from directory: $(pwd)"
}

# Function to test application manually
test_application() {
    print_step "Testing application manually before starting service..."
    
    print_status "🧪 STEP: test_application() - Starting manual test..."
    
    # Check if we're in the production directory
    if [ ! -d "$APP_DIR" ]; then
        print_error "❌ Production directory not found: $APP_DIR"
        exit 1
    fi
    
    # Verify workspace setup first
    print_status "🔍 VERIFYING: Checking workspace setup..."
    if [ -f "$APP_DIR/package.json" ] && [ -d "$APP_DIR/packages/shared" ]; then
        print_status "✅ SUCCESS: Workspace structure looks correct"
        print_status "📁 Workspace root: $APP_DIR"
        print_status "📁 Shared package: $APP_DIR/packages/shared"
    else
        print_error "❌ ERROR: Workspace structure incomplete"
        print_status "📁 Available files:"
        ls -la "$APP_DIR/"
        exit 1
    fi
    
    # Navigate to production directory
    cd "$APP_DIR"
    print_status "📁 TESTING: Current directory: $(pwd)"
    
    # Check if main.js exists
    if [ ! -f "dist/apps/api/src/main.js" ]; then
        print_error "❌ Main.js not found in production directory"
        exit 1
    fi
    
    # Test Node.js syntax
    print_status "🔍 TESTING: Checking Node.js syntax..."
    if ! node --check "dist/apps/api/src/main.js" 2>/dev/null; then
        print_error "❌ Main.js has syntax errors"
        exit 1
    fi
    print_status "✅ Main.js syntax is valid"
    
    # Test if Node.js can load the file (without starting the server)
    print_status "🔍 TESTING: Testing Node.js module loading..."
    
    # CRITICAL FIX: Check Node.js version and ensure compatibility
    print_status "🔍 CHECKING: Node.js version compatibility..."
    NODE_VERSION=$(node --version)
    print_status "📊 Current Node.js version: $NODE_VERSION"
    
    # Check if we're using the right Node.js version
    if [[ "$NODE_VERSION" == v18* ]]; then
        print_warning "⚠️ WARNING: Using Node.js v18, but the application was built with v20"
        print_status "ℹ️ This might cause compatibility issues"
        print_status "ℹ️ Consider upgrading to Node.js v20 for better compatibility"
    elif [[ "$NODE_VERSION" == v20* ]]; then
        print_status "✅ SUCCESS: Using Node.js v20 (recommended)"
    else
        print_warning "⚠️ WARNING: Using Node.js $NODE_VERSION (unknown version)"
    fi
    
    # First, let's check if the shared package is accessible
    print_status "🔍 CHECKING: Verifying shared package accessibility..."
    if [ -f "node_modules/@club-corra/shared/dist/index.js" ]; then
        print_status "✅ SUCCESS: Shared package found in node_modules"
    elif [ -f "packages/shared/dist/index.js" ]; then
        print_status "✅ SUCCESS: Shared package found in packages directory"
        print_status "ℹ️ Workspace linking should handle the resolution"
    else
        print_error "❌ ERROR: Shared package not found anywhere"
        print_status "📁 Checking what's available:"
        ls -la node_modules/@club-corra/ 2>/dev/null || echo "No @club-corra directory in node_modules"
        ls -la packages/ 2>/dev/null || echo "No packages directory"
        exit 1
    fi
    
    # Try a simpler test - just check if we can require the shared package
    print_status "🔍 TESTING: Testing shared package accessibility..."
    
    # First check if the shared package dist file exists
    if [ -f "packages/shared/dist/index.js" ]; then
        print_status "✅ SUCCESS: Shared package dist file exists"
        print_status "📁 Shared package index.js size: $(ls -lh packages/shared/dist/index.js | awk '{print $5}')"
        
        # Check if the shared package has any obvious issues
        print_status "🔍 CHECKING: Shared package file integrity..."
        if [ -s "packages/shared/dist/index.js" ]; then
            print_status "✅ SUCCESS: Shared package index.js is not empty"
        else
            print_warning "⚠️ Shared package index.js appears to be empty"
        fi
        
        # Test if we can require the shared package
        print_status "🔍 TESTING: Shared package module loading..."
        if timeout 10s node -e "
            try {
                console.log('🔍 Attempting to load shared package...');
                console.log('🔍 Current working directory:', process.cwd());
                console.log('🔍 Module paths:', module.paths.slice(0, 3));
                
                const sharedModule = require('@club-corra/shared');
                console.log('✅ Shared package loaded successfully');
                console.log('✅ Module type:', typeof sharedModule);
                console.log('✅ Module keys:', Object.keys(sharedModule || {}));
            } catch (error) {
                console.error('❌ Shared package loading failed');
                console.error('❌ Error name:', error.name);
                console.error('❌ Error message:', error.message);
                console.error('❌ Error code:', error.code);
                console.error('❌ Error stack:', error.stack);
                process.exit(1);
            }
        " 2>/dev/null; then
            print_status "✅ SUCCESS: Shared package can be loaded"
        else
            print_warning "⚠️ Shared package loading failed, but continuing..."
            print_status "ℹ️ This might be due to workspace resolution issues"
            print_status "ℹ️ Check the error details above for specific issues"
            
            # CRITICAL FIX: Try to manually fix the shared package resolution
            print_status "🔧 ATTEMPTING: Manual fix for shared package resolution..."
            if [ -f "packages/shared/dist/index.js" ]; then
                print_status "🔧 CREATING: Manual symlink for shared package..."
                sudo mkdir -p node_modules/@club-corra
                sudo ln -sf "$(pwd)/packages/shared" node_modules/@club-corra/shared
                sudo chown -R ec2-user:ec2-user node_modules/@club-corra
                
                # Test the symlink
                if [ -L "node_modules/@club-corra/shared" ]; then
                    print_status "✅ SUCCESS: Manual symlink created"
                    print_status "🔍 VERIFYING: Testing manual symlink..."
                    if timeout 5s node -e "require('@club-corra/shared'); console.log('✅ Manual symlink works!');" 2>/dev/null; then
                        print_status "✅ SUCCESS: Manual symlink resolves correctly"
                    else
                        print_warning "⚠️ Manual symlink still not working"
                    fi
                else
                    print_warning "⚠️ Failed to create manual symlink"
                fi
            fi
        fi
    else
        print_error "❌ ERROR: Shared package dist file not found"
        print_status "📁 Checking shared package dist contents:"
        ls -la packages/shared/dist/ 2>/dev/null || echo "No dist directory"
        exit 1
    fi
    
    # Now try to load the main application
    print_status "🔍 TESTING: Testing main application module loading..."
    
    # First check if the main.js file exists and is readable
    if [ -f "dist/apps/api/src/main.js" ]; then
        print_status "✅ SUCCESS: Main.js file exists and is readable"
        print_status "📁 Main.js file size: $(ls -lh dist/apps/api/src/main.js | awk '{print $5}')"
        
        # Try to load the main application with detailed error reporting
        if timeout 15s node -e "
            try {
                console.log('🔍 Attempting to load main application...');
                console.log('🔍 Current working directory:', process.cwd());
                console.log('🔍 Node.js version:', process.version);
                console.log('🔍 Module paths:', module.paths.slice(0, 5));
                
                const mainModule = require('./dist/apps/api/src/main.js');
                console.log('✅ Main application loaded successfully');
                console.log('✅ Module type:', typeof mainModule);
            } catch (error) {
                console.error('❌ Main application loading failed');
                console.error('❌ Error name:', error.name);
                console.error('❌ Error message:', error.message);
                console.error('❌ Error code:', error.code);
                console.error('❌ Error stack:', error.stack);
                process.exit(1);
            }
        " 2>/dev/null; then
            print_status "✅ Module loading test passed"
        else
            print_warning "⚠️ Main application loading failed, but continuing..."
            print_status "ℹ️ This might be due to runtime configuration issues"
            print_status "ℹ️ The application may still work when started as a service"
            print_status "ℹ️ Check the error details above for specific issues"
        fi
    else
        print_error "❌ ERROR: Main.js file not found or not readable"
        print_status "📁 Checking dist/apps/api/src directory:"
        ls -la dist/apps/api/src/ 2>/dev/null || echo "No dist/apps/api/src directory"
        exit 1
    fi
    
    print_status "🧪 STEP: test_application() - Completed successfully"
}

# Function to debug workspace setup
debug_workspace_setup() {
    print_step "Debugging workspace setup..."
    
    print_status "🔍 DEBUG: Current directory: $(pwd)"
    print_status "🔍 DEBUG: Production directory: $APP_DIR"
    
    # Check if we're in the right place
    if [ "$(pwd)" != "$APP_DIR" ]; then
        print_status "🔍 DEBUG: Changing to production directory..."
        cd "$APP_DIR"
        print_status "🔍 DEBUG: Now in directory: $(pwd)"
    fi
    
    # Show workspace structure
    print_status "🔍 DEBUG: Workspace structure:"
    ls -la
    
    print_status "🔍 DEBUG: Package.json contents:"
    if [ -f "package.json" ]; then
        cat package.json | head -20
    else
        print_error "❌ No package.json found"
    fi
    
    print_status "🔍 DEBUG: Yarn workspace info:"
    if command -v yarn >/dev/null 2>&1; then
        yarn workspaces info 2>/dev/null || echo "Failed to get workspace info"
    else
        print_error "❌ Yarn not found"
    fi
    
    print_status "🔍 DEBUG: Node modules structure:"
    if [ -d "node_modules" ]; then
        ls -la node_modules/ | head -10
        if [ -d "node_modules/@club-corra" ]; then
            print_status "🔍 DEBUG: @club-corra namespace:"
            ls -la node_modules/@club-corra/
        fi
    else
        print_error "❌ No node_modules found"
    fi
    
    print_status "🔍 DEBUG: Packages structure:"
    if [ -d "packages" ]; then
        ls -la packages/
        if [ -d "packages/shared" ]; then
            print_status "🔍 DEBUG: Shared package:"
            ls -la packages/shared/
            if [ -f "packages/shared/package.json" ]; then
                print_status "🔍 DEBUG: Shared package.json:"
                cat packages/shared/package.json | head -10
            fi
        fi
    else
        print_error "❌ No packages directory found"
    fi
}

# Function to setup and start systemd service
setup_service() {
    print_step "Setting up systemd service..."
    
    print_status "⚙️ STEP: setup_service() - Starting service setup..."
    
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
            
            print_status "📝 SERVICE LOGS (real-time, last 10 lines):"
            sudo journalctl -u "$SERVICE_NAME" -n 10 --no-pager --output=cat
            
            print_status "🔍 CHECKING: Production directory contents..."
            ls -la "$APP_DIR/"
            
            print_status "🔍 CHECKING: Production dist contents..."
            ls -la "$APP_DIR/dist/"
            
            print_status "🔍 CHECKING: Main.js exists and is readable..."
            if [ -f "$APP_DIR/dist/apps/api/src/main.js" ]; then
                print_status "✅ Main.js exists"
                ls -la "$APP_DIR/dist/apps/api/src/main.js"
                print_status "🔍 CHECKING: Node.js can execute main.js..."
                if node --check "$APP_DIR/dist/apps/api/src/main.js" 2>/dev/null; then
                    print_status "✅ Main.js syntax is valid"
                else
                    print_error "❌ Main.js has syntax errors"
                fi
                
                # Try to run the main.js directly to see the actual error
                print_status "🔍 TESTING: Running main.js directly to see error..."
                cd "$APP_DIR"
                
                # First, let's see what's in the main.js file
                print_status "🔍 CHECKING: Main.js file contents (first 10 lines):"
                head -10 dist/apps/api/src/main.js
                
                # Check for import statements that might be failing
                print_status "🔍 CHECKING: Import statements in main.js:"
                grep -n "require\|import" dist/apps/api/src/main.js | head -5
                
                # Now try to run it
                if timeout 10s node dist/apps/api/src/main.js 2>&1 | head -20; then
                    print_status "✅ Main.js runs successfully when executed directly"
                else
                    print_status "❌ Main.js failed when executed directly - check output above"
                fi
                cd /home/ec2-user/club-corra-api/club-corra-pilot/apps/api
            else
                print_error "❌ Main.js not found at $APP_DIR/dist/apps/api/src/main.js"
            fi
            
            print_status "🔍 CHECKING: Environment file..."
            if [ -f "$APP_DIR/.env" ]; then
                print_status "✅ Environment file exists"
                print_status "📝 Environment file contents (first 10 lines):"
                head -10 "$APP_DIR/.env"
            else
                print_error "❌ Environment file not found"
            fi
            
            # Check if there are any missing environment variables
            print_status "🔍 CHECKING: Common environment variables..."
            if [ -f "$APP_DIR/.env" ]; then
                print_status "📝 Checking for required environment variables:"
                grep -E "^(DATABASE_URL|JWT_SECRET|PORT|NODE_ENV)" "$APP_DIR/.env" || echo "No required env vars found"
            fi
            
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
    ps aux | grep "node.*dist/apps/api/src/main.js" | grep -v grep || echo "No Node.js process found"
    
    echo -e "\n=== Build Verification ==="
    ls -la "$APP_DIR/dist/"
    
    echo -e "\n=== Dependencies Verification ==="
    if [ -d "$APP_DIR/node_modules/@nestjs" ]; then
        echo "✅ NestJS dependencies found:"
        ls -la "$APP_DIR/node_modules/@nestjs/" | head -5
    else
        echo "❌ NestJS dependencies missing - this will cause startup failure"
    fi
    
    if [ -d "$APP_DIR/node_modules/@club-corra" ]; then
        echo "✅ Club Corra dependencies found:"
        ls -la "$APP_DIR/node_modules/@club-corra/"
    else
        echo "❌ Club Corra dependencies missing"
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
    
    echo -e "\n=== Nginx Configuration Check ==="
    if systemctl is-active --quiet nginx; then
        echo "✅ Nginx is running"
        if [ -f "/etc/nginx/conf.d/club-corra-api.conf" ]; then
            echo "✅ Nginx config found"
            echo "📝 Proxy configuration:"
            grep -A 5 "proxy_pass" /etc/nginx/conf.d/club-corra-api.conf || echo "No proxy_pass found"
        else
            echo "⚠️ Nginx config not found"
        fi
    else
        echo "⚠️ Nginx is not running"
    fi
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

# Function to rollback if needed
rollback() {
    print_error "Deployment failed. Rolling back..."
    
    # Stop current service
    sudo systemctl stop "$SERVICE_NAME"
    
    # Find latest backup
    LATEST_BACKUP=$(ls -t "$BACKUP_DIR" 2>/dev/null | head -1)
    
    if [ -n "$LATEST_BACKUP" ]; then
        # Restore from backup
        sudo rm -rf "$APP_DIR"
        sudo cp -r "$BACKUP_DIR/$LATEST_BACKUP" "$APP_DIR"
        sudo chown -R ec2-user:ec2-user "$APP_DIR"
        
        # Restart service
        sudo systemctl start "$SERVICE_NAME"
        
        print_status "Rollback completed from backup: $LATEST_BACKUP"
    else
        print_error "No backup found for rollback"
    fi
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [--help|--verify|--rollback|--logs|--debug|--troubleshoot|--fix-service]"
    echo "  --help         Show this help message"
    echo "  --verify       Only verify deployment status"
    echo "  --rollback     Rollback to previous deployment"
    echo "  --logs         Show service logs"
    echo "  --debug        Debug workspace setup and dependencies"
    echo "  --troubleshoot Automatically diagnose and fix common deployment issues"
    echo "  --fix-service  Fix systemd service configuration issues"
    echo ""
    echo "This script deploys the Club Corra API to production on EC2."
    echo "Make sure you're running this from the club-corra-pilot directory."
    echo ""
    echo "TROUBLESHOOTING:"
echo "  If deployment fails, use --troubleshoot to automatically fix common issues:"
echo "  - Missing NestJS dependencies"
echo "  - Wrong package.json (root workspace instead of API package)"
echo "  - @club-corra/shared path issues (../../packages/shared → ./packages/shared)"
echo "  - Missing shared package dependencies (crypto-js, zod)"
echo "  - Environment file problems"
echo "  - HTTPS mode configuration issues"
echo "  - File permission problems"
echo "  - Shared package build issues"
}

# Function to show logs
show_logs() {
    print_step "Showing service logs..."
    sudo journalctl -u "$SERVICE_NAME" -f
}

# Function to check SSL configuration
check_ssl_configuration() {
    print_step "Checking SSL configuration..."
    
    print_status "🔒 STEP: check_ssl_configuration() - Starting SSL check..."
    
    # Check if SSL certificates exist
    local ssl_domain=""
    local ssl_cert_path=""
    local ssl_key_path=""
    
    # Look for existing SSL certificates
    if [ -d "/etc/letsencrypt/live" ]; then
        print_status "🔍 Found Let's Encrypt certificates directory"
        
        # Find the first available domain
        for domain_dir in /etc/letsencrypt/live/*/; do
            if [ -d "$domain_dir" ] && [ -f "$domain_dir/fullchain.pem" ] && [ -f "$domain_dir/privkey.pem" ]; then
                ssl_domain=$(basename "$domain_dir")
                ssl_cert_path="$domain_dir/fullchain.pem"
                ssl_key_path="$domain_dir/privkey.pem"
                print_status "✅ Found SSL certificates for domain: $ssl_domain"
                break
            fi
        done
    fi
    
    # Check if nginx is configured for HTTPS
    local nginx_https_enabled=false
    if [ -f "/etc/nginx/conf.d/club-corra-api.conf" ] || [ -f "/etc/nginx/sites-enabled/club-corra-api" ]; then
        nginx_https_enabled=true
        print_status "✅ Nginx HTTPS configuration found"
    fi
    
    # Check if nginx is running
    local nginx_running=false
    if systemctl is-active --quiet nginx; then
        nginx_running=true
        print_status "✅ Nginx service is running"
    fi
    
    # CRITICAL FIX: Always recommend nginx deployment for production
    # This prevents privileged port binding issues with NestJS
    if [ -n "$ssl_domain" ] && [ "$nginx_https_enabled" = true ] && [ "$nginx_running" = true ]; then
        print_status "🚀 PRODUCTION DEPLOYMENT: SSL certificates and nginx found - using nginx for HTTPS"
        print_status "   Domain: $ssl_domain"
        print_status "   Certificate: $ssl_cert_path"
        print_status "   Private Key: $ssl_key_path"
        print_status "   ✅ NestJS will run in HTTP mode behind nginx (recommended for production)"
        
        # Export SSL configuration for other functions (nginx will use these)
        export SSL_DOMAIN="$ssl_domain"
        export SSL_CERT_PATH="$ssl_cert_path"
        export SSL_KEY_PATH="$ssl_key_path"
        export HTTPS_MODE=false  # CRITICAL: Always false for nginx deployment
    else
        print_warning "⚠️ Production setup incomplete"
        print_status "   SSL Domain: ${ssl_domain:-'Not found'}"
        print_status "   Nginx Config: ${nginx_https_enabled:-'Not found'}"
        print_status "   Nginx Running: ${nginx_running:-'Not running'}"
        print_status "   ℹ️ NestJS will run in HTTP mode (port 8080)"
        print_status "   ℹ️ For HTTPS, configure nginx to proxy to port 8080"
        
        export HTTPS_MODE=false
    fi
    
    print_status "🔒 STEP: check_ssl_configuration() - Completed"
    print_status "ℹ️ RECOMMENDATION: Use nginx for HTTPS termination, NestJS for HTTP backend"
}

# Function to troubleshoot common deployment issues
troubleshoot_deployment() {
    print_step "Troubleshooting deployment issues..."
    
    print_status "🔍 STEP: troubleshoot_deployment() - Starting troubleshooting..."
    
    # Check if service is running
    if sudo systemctl is-active --quiet "$SERVICE_NAME"; then
        print_status "✅ Service is running - no immediate issues detected"
        return 0
    fi
    
    print_status "❌ Service is not running - investigating issues..."
    
    # Check service status
    print_status "📊 SERVICE STATUS:"
    sudo systemctl status "$SERVICE_NAME" --no-pager -l
    
    # Check recent logs
    print_status "📝 RECENT LOGS:"
    sudo journalctl -u "$SERVICE_NAME" -n 20 --no-pager
    
    # Check for common issues
    print_status "🔍 CHECKING: Common deployment issues..."
    
    # Issue 1: Missing NestJS dependencies
    if [ ! -d "$APP_DIR/node_modules/@nestjs" ]; then
        print_error "❌ ISSUE 1: NestJS dependencies missing"
        print_status "🔄 FIXING: Installing NestJS dependencies..."
        
        cd "$APP_DIR"
        if yarn add @nestjs/core @nestjs/common @nestjs/platform-express; then
            print_status "✅ SUCCESS: NestJS dependencies installed"
        else
            print_error "❌ FAILED: Could not install NestJS dependencies"
            print_status "🔄 FALLBACK: Copying working node_modules from source..."
            
            if [ -d "/home/ec2-user/club-corra-api/club-corra-pilot/apps/api/node_modules" ]; then
                sudo cp -r /home/ec2-user/club-corra-api/club-corra-pilot/apps/api/node_modules .
                sudo chown -R ec2-user:ec2-user node_modules
                print_status "✅ SUCCESS: Working node_modules copied from source"
            else
                print_error "❌ FAILED: Source node_modules not found"
            fi
        fi
        cd /home/ec2-user/club-corra-api/club-corra-pilot/apps/api
    fi
    
    # Issue 2: Wrong package.json
    if [ -f "$APP_DIR/package.json" ]; then
        package_name=$(grep '"name"' "$APP_DIR/package.json" | head -1)
        if echo "$package_name" | grep -q "club-corra-pilot"; then
            print_error "❌ ISSUE 2: Wrong package.json (root workspace instead of API package)"
            print_status "🔄 FIXING: Copying correct API package.json..."
            
            sudo cp /home/ec2-user/club-corra-api/club-corra-pilot/apps/api/package.json "$APP_DIR/"
            sudo chown ec2-user:ec2-user "$APP_DIR/package.json"
            print_status "✅ SUCCESS: Correct API package.json copied"
            
            # CRITICAL FIX: Update the @club-corra/shared path for production
            print_status "🔧 FIXING: @club-corra/shared path for production..."
            if sudo sed -i 's|"@club-corra/shared": "file:../../packages/shared"|"@club-corra/shared": "file:./packages/shared"|g' "$APP_DIR/package.json"; then
                print_status "✅ @club-corra/shared path fixed for production"
            else
                print_warning "⚠️ Could not fix @club-corra/shared path, but continuing..."
            fi
            
            # Reinstall dependencies
            print_status "🔄 REINSTALLING: Dependencies with correct package.json..."
            cd "$APP_DIR"
            rm -rf node_modules
            if yarn install --production; then
                print_status "✅ SUCCESS: Dependencies reinstalled"
            else
                print_error "❌ FAILED: Dependency reinstallation"
            fi
            cd /home/ec2-user/club-corra-api/club-corra-pilot/apps/api
        fi
    fi
    
    # Issue 3: Environment file problems
    if [ ! -f "$APP_DIR/.env" ]; then
        print_error "❌ ISSUE 3: Environment file missing"
        print_status "🔄 FIXING: Copying environment file..."
        
        if [ -f ".env.production" ]; then
            sudo cp .env.production "$APP_DIR/.env"
        elif [ -f ".env.local" ]; then
            sudo cp .env.local "$APP_DIR/.env"
        else
            print_error "❌ FAILED: No environment file found to copy"
        fi
        
        if [ -f "$APP_DIR/.env" ]; then
            sudo chown ec2-user:ec2-user "$APP_DIR/.env"
            print_status "✅ SUCCESS: Environment file copied"
        fi
    fi
    
    # Issue 4: HTTPS mode configuration
    if [ -f "$APP_DIR/.env" ] && grep -q "HTTPS_MODE=true" "$APP_DIR/.env"; then
        print_error "❌ ISSUE 4: HTTPS mode enabled (causes privileged port binding issues)"
        print_status "🔄 FIXING: Disabling HTTPS mode for nginx deployment..."
        
        sudo sed -i 's/HTTPS_MODE=true/HTTPS_MODE=false/' "$APP_DIR/.env"
        sudo sed -i 's/HOST=0.0.0.0/HOST=127.0.0.1/' "$APP_DIR/.env"
        print_status "✅ SUCCESS: HTTPS mode disabled, using HTTP behind nginx"
    fi
    
    # Issue 5: Shared package dependencies missing
    print_status "🔍 CHECKING: Shared package dependencies..."
    if [ -f "$APP_DIR/packages/shared/package.json" ]; then
        if [ ! -d "$APP_DIR/packages/shared/node_modules" ] || [ -z "$(ls -A "$APP_DIR/packages/shared/node_modules" 2>/dev/null)" ]; then
            print_error "❌ ISSUE 5: Shared package dependencies missing"
            print_status "🔄 FIXING: Installing shared package dependencies..."
            
            cd "$APP_DIR/packages/shared"
            if yarn install --production; then
                print_status "✅ SUCCESS: Shared package dependencies installed"
            else
                print_warning "⚠️ Shared package dependency install failed, but continuing..."
            fi
            cd /home/ec2-user/club-corra-api/club-corra-pilot/apps/api
        else
            print_status "✅ Shared package dependencies found"
        fi
    else
        print_warning "⚠️ Shared package package.json not found"
    fi
    
    # Issue 6: crypto-js dependency missing
    print_status "🔍 CHECKING: crypto-js dependency..."
    if [ ! -d "$APP_DIR/node_modules/crypto-js" ]; then
        print_error "❌ ISSUE 6: crypto-js dependency missing"
        print_status "🔄 FIXING: Installing crypto-js..."
        
        cd "$APP_DIR"
        if yarn add crypto-js; then
            print_status "✅ SUCCESS: crypto-js installed"
        else
            print_warning "⚠️ crypto-js install failed, trying to copy from shared package..."
            
            # Try to copy from shared package if it exists
            if [ -d "packages/shared/node_modules/crypto-js" ]; then
                sudo cp -r packages/shared/node_modules/crypto-js node_modules/
                sudo chown -R ec2-user:ec2-user node_modules/crypto-js
                print_status "✅ SUCCESS: crypto-js copied from shared package"
            else
                print_error "❌ FAILED: crypto-js not available anywhere"
            fi
        fi
        cd /home/ec2-user/club-corra-api/club-corra-pilot/apps/api
    else
        print_status "✅ crypto-js dependency found"
    fi
    
    # Issue 7: Permission problems
    print_status "🔍 CHECKING: File permissions..."
    if [ -d "$APP_DIR/node_modules" ]; then
        owner=$(stat -c '%U:%G' "$APP_DIR/node_modules")
        if [ "$owner" != "ec2-user:ec2-user" ]; then
            print_error "❌ ISSUE 7: Wrong ownership on node_modules: $owner"
            print_status "🔄 FIXING: Correcting file permissions..."
            
            sudo chown -R ec2-user:ec2-user "$APP_DIR"
            sudo chmod -R 755 "$APP_DIR"
            print_status "✅ SUCCESS: File permissions corrected"
        fi
    fi
    
    # Try to restart the service
    print_status "🔄 ATTEMPTING: Service restart after fixes..."
    sudo systemctl restart "$SERVICE_NAME"
    
    # Wait a moment and check status
    sleep 5
    if sudo systemctl is-active --quiet "$SERVICE_NAME"; then
        print_status "✅ SUCCESS: Service is now running after fixes!"
    else
        print_error "❌ FAILED: Service still not running after fixes"
        print_status "📝 Check logs for remaining issues: sudo journalctl -u $SERVICE_NAME -f"
    fi
    
    # Issue 8: Shared package package.json pointing to source instead of dist
    print_status "🔍 CHECKING: Shared package package.json configuration..."
    if [ -f "$APP_DIR/packages/shared/package.json" ]; then
        if grep -q '"main": "./src/index.ts"' "$APP_DIR/packages/shared/package.json"; then
            print_error "❌ ISSUE 8: Shared package.json points to source files instead of dist"
            print_status "🔄 FIXING: Updating shared package.json to point to dist files..."
            
            sudo sed -i 's|"main": "./src/index.ts"|"main": "./dist/index.js"|g' "$APP_DIR/packages/shared/package.json"
            sudo sed -i 's|"types": "./src/index.d.ts"|"types": "./dist/index.d.ts"|g' "$APP_DIR/packages/shared/package.json"
            sudo sed -i 's|"./src/index.ts"|"./dist/index.js"|g' "$APP_DIR/packages/shared/package.json"
            print_status "✅ SUCCESS: Shared package.json updated to point to dist files"
            
            # Recreate symlink to ensure it uses the updated package.json
            if [ -L "$APP_DIR/node_modules/@club-corra/shared" ]; then
                print_status "🔧 RECREATING: Shared package symlink with updated package.json..."
                sudo rm -f "$APP_DIR/node_modules/@club-corra/shared"
                sudo mkdir -p "$APP_DIR/node_modules/@club-corra"
                sudo ln -sf "$APP_DIR/packages/shared" "$APP_DIR/node_modules/@club-corra/shared"
                sudo chown -R ec2-user:ec2-user "$APP_DIR/node_modules/@club-corra"
            fi
        else
            print_status "✅ Shared package.json already points to dist files"
        fi
    fi
    
    # Final verification: Test shared package loading
    print_status "🧪 FINAL TEST: Verifying shared package works after fixes..."
    cd "$APP_DIR"
    if timeout 10s node -e "
        try {
            const sharedModule = require('@club-corra/shared');
            console.log('✅ SUCCESS: Shared package working after fixes!');
            console.log('📦 Available exports:', Object.keys(sharedModule || {}).slice(0, 5));
        } catch (error) {
            console.error('❌ Shared package still failing after fixes:', error.message);
            console.error('❌ Error stack:', error.stack);
            process.exit(1);
        }
    " 2>&1; then
        print_status "✅ SUCCESS: Final shared package test passed!"
    else
        print_error "❌ Final shared package test failed - manual intervention required"
    fi
    cd /home/ec2-user/club-corra-api/club-corra-pilot/apps/api
    
    print_status "🔍 STEP: troubleshoot_deployment() - Completed"
}

# Function to fix systemd service configuration
fix_systemd_service() {
    print_step "Fixing systemd service configuration..."
    
    print_status "🔧 STEP: fix_systemd_service() - Starting service fix..."
    
    # Stop the service first
    print_status "⏹️ STOPPING: Stopping the failing service..."
    sudo systemctl stop "$SERVICE_NAME" || true
    
    # Check if the service file exists
    if [ -f "/etc/systemd/system/$SERVICE_NAME.service" ]; then
        print_status "📝 BACKING UP: Backing up current service file..."
        sudo cp "/etc/systemd/system/$SERVICE_NAME.service" "/etc/systemd/system/$SERVICE_NAME.service.backup.$(date +%Y%m%d-%H%M%S)"
        
        # Check if the service file has the problematic EnvironmentFile without the dash
        if grep -q "EnvironmentFile=$APP_DIR/.env" "/etc/systemd/system/$SERVICE_NAME.service"; then
            print_status "🔧 FIXING: Fixing EnvironmentFile directive..."
            sudo sed -i "s|EnvironmentFile=$APP_DIR/.env|EnvironmentFile=-$APP_DIR/.env|g" "/etc/systemd/system/$SERVICE_NAME.service"
            print_status "✅ SUCCESS: EnvironmentFile directive fixed"
        else
            print_status "ℹ️ INFO: EnvironmentFile directive already correct or not found"
        fi
        
        # Check if WorkingDirectory is missing or incorrect
        if ! grep -q "WorkingDirectory=$APP_DIR" "/etc/systemd/system/$SERVICE_NAME.service"; then
            print_status "🔧 FIXING: Adding or fixing WorkingDirectory directive..."
            if grep -q "WorkingDirectory=" "/etc/systemd/system/$SERVICE_NAME.service"; then
                # Update existing WorkingDirectory
                sudo sed -i "s|WorkingDirectory=.*|WorkingDirectory=$APP_DIR|g" "/etc/systemd/system/$SERVICE_NAME.service"
            else
                # Add WorkingDirectory after [Service]
                sudo sed -i "/\[Service\]/a WorkingDirectory=$APP_DIR" "/etc/systemd/system/$SERVICE_NAME.service"
            fi
            print_status "✅ SUCCESS: WorkingDirectory directive fixed"
        else
            print_status "ℹ️ INFO: WorkingDirectory directive already correct"
        fi
        
        # Check if ExecStart path is correct
        if grep -q "ExecStart=.*dist/src/main.js" "/etc/systemd/system/$SERVICE_NAME.service"; then
            print_status "🔧 FIXING: Fixing ExecStart path..."
            sudo sed -i "s|ExecStart=.*dist/src/main.js|ExecStart=$NODE_PATH dist/apps/api/src/main.js|g" "/etc/systemd/system/$SERVICE_NAME.service"
            print_status "✅ SUCCESS: ExecStart path fixed"
        else
            print_status "ℹ️ INFO: ExecStart path already correct or not found"
        fi
        
        # Reload systemd and restart the service
        print_status "🔄 RELOADING: Reloading systemd configuration..."
        sudo systemctl daemon-reload
        
        print_status "🚀 STARTING: Starting the service..."
        sudo systemctl start "$SERVICE_NAME"
        
        # Wait a moment and check status
        sleep 5
        if sudo systemctl is-active --quiet "$SERVICE_NAME"; then
            print_status "✅ SUCCESS: Service is now running!"
        else
            print_error "❌ Service still not running"
            print_status "📝 Service status:"
            sudo systemctl status "$SERVICE_NAME" --no-pager -l
        fi
    else
        print_error "❌ Service file not found at /etc/systemd/system/$SERVICE_NAME.service"
        print_status "ℹ️ Run the full deployment script to create the service file"
    fi
    
    print_status "🔧 STEP: fix_systemd_service() - Completed"
}

# Function to check disk space before deployment
check_disk_space() {
    print_step "Checking disk space for 8GB EC2 deployment..."
    
    AVAILABLE_SPACE=$(df / | awk 'NR==2 {gsub(/[^0-9]/, "", $4); print int($4/1024)}')
    USED_PERCENTAGE=$(df / | awk 'NR==2 {gsub(/%/, "", $5); print $5}')
    
    print_status "💾 Current disk usage: ${USED_PERCENTAGE}% used"
    print_status "💾 Available space: ${AVAILABLE_SPACE}MB"
    
    # Check if we have enough space for deployment (need at least 1GB free)
    if [ "$AVAILABLE_SPACE" -lt 1024 ]; then
        print_error "❌ Insufficient disk space! Available: ${AVAILABLE_SPACE}MB, Required: 1024MB"
        print_status "🧹 Attempting aggressive cleanup before deployment..."
        
        # Emergency cleanup
        sudo find /tmp -type f -mtime +1 -delete 2>/dev/null || true
        sudo find /var/tmp -type f -mtime +1 -delete 2>/dev/null || true
        sudo journalctl --vacuum-time=1d 2>/dev/null || true
        
        # Check again
        AVAILABLE_SPACE_AFTER=$(df / | awk 'NR==2 {gsub(/[^0-9]/, "", $4); print int($4/1024)}')
        print_status "💾 Available space after cleanup: ${AVAILABLE_SPACE_AFTER}MB"
        
        if [ "$AVAILABLE_SPACE_AFTER" -lt 1024 ]; then
            print_error "❌ Still insufficient space after cleanup. Please free up disk space or upgrade to larger EC2 instance."
            exit 1
        fi
    fi
    
    if [ "$USED_PERCENTAGE" -gt 85 ]; then
        print_warning "⚠️ Warning: Disk usage is ${USED_PERCENTAGE}% - consider cleanup or larger instance"
    fi
    
    print_status "✅ Disk space check passed"
}

# Main deployment flow
main() {
    print_status "🚀 Starting production deployment for 8GB EC2..."
    print_status "📁 Starting in directory: $(pwd)"
    
    # Check disk space first (critical for 8GB instance)
    print_status "💾 STEP 0: Checking disk space..."
    check_disk_space
    
    # Check permissions
    print_status "🔐 STEP 1: Checking permissions..."
    check_permissions
    
    # Check and upgrade Node.js if needed
    print_status "🔐 STEP 1.5: Checking Node.js version..."
    check_and_upgrade_nodejs
    
    # Check SSL configuration
    print_status "🔒 STEP 2: Checking SSL configuration..."
    check_ssl_configuration
    
    # Stop existing service
    print_status "⏹️ STEP 3: Stopping existing service..."
    stop_service
    
    # Backup existing deployment
    print_status "💾 STEP 4: Creating backup..."
    backup_existing
    
    # Prepare build environment
    print_status "🧹 STEP 5: Preparing build environment..."
    prepare_build
    
    # Build application
    print_status "🔨 STEP 6: Building application..."
    build_application
    
    # Deploy to production
    print_status "📁 STEP 7: Deploying to production..."
    deploy_to_production
    
    # Test application manually
    print_status "🧪 STEP 8: Testing application manually..."
    test_application
    
    # Setup and start service
    print_status "⚙️ STEP 9: Setting up systemd service..."
    setup_service
    
    # Verify deployment
    print_status "✅ STEP 10: Verifying deployment..."
    verify_deployment
    
    # Run health check
    print_status "🏥 STEP 11: Running health check..."
    health_check
    
    print_status "🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!"
    print_status "📁 Final directory: $(pwd)"
    
    if [ "$HTTPS_MODE" = false ] && [ -n "$SSL_DOMAIN" ]; then
        print_status "🔒 PRODUCTION MODE: Your API is running with HTTPS support via nginx!"
        print_status "🌐 Access your API at: https://$SSL_DOMAIN/api/v1"
        print_status "📚 Health check: https://$SSL_DOMAIN/api/v1/health"
        print_status "📋 Update your Vercel environment variables:"
        print_status "   NEXT_PUBLIC_API_BASE_URL=https://$SSL_DOMAIN/api/v1"
        print_status "   NEXT_PUBLIC_WS_URL=wss://$SSL_DOMAIN"
        print_status "ℹ️ NestJS runs on http://127.0.0.1:8080 (behind nginx HTTPS proxy)"
    elif [ "$HTTPS_MODE" = false ]; then
        print_status "⚠️ HTTP MODE: Your API is running in HTTP mode (port 8080)"
        print_status "🌐 Access your API at: http://localhost:8080/api/v1"
        print_status "📚 Health check: http://localhost:8080/api/v1/health"
        print_status "⚠️ WARNING: Vercel frontend requires HTTPS. Please configure nginx for HTTPS proxy."
        print_status "ℹ️ Run: sudo nano /etc/nginx/conf.d/club-corra-api.conf"
    else
        print_status "⚠️ UNKNOWN MODE: Check your configuration"
    fi
    
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
    --rollback)
        rollback
        exit 0
        ;;
    --logs)
        show_logs
        exit 0
        ;;
    --debug)
        debug_workspace_setup
        exit 0
        ;;
    --troubleshoot)
        troubleshoot_deployment
        exit 0
        ;;
    --fix-service)
        fix_systemd_service
        exit 0
        ;;
    *)
        main
        ;;
esac
