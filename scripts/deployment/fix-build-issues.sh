#!/bin/bash

# Quick Fix Script for Club Corra API Build Issues on EC2
# This script fixes the common build issues: missing types and NestJS CLI

set -e  # Exit on any error

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

# Function to check if we're in the right directory
check_directory() {
    print_step "Checking directory structure..."
    
    if [ ! -f "package.json" ] || [ ! -d "apps/api" ] || [ ! -d "packages/shared" ]; then
        print_error "❌ This script must be run from the club-corra-pilot root directory!"
        print_error "Please navigate to the correct directory first."
        exit 1
    fi
    
    print_status "✅ Directory structure verified"
}

# Function to fix shared package dependencies
fix_shared_package() {
    print_step "Fixing shared package dependencies..."
    
    print_status "📦 Installing missing @types/crypto-js in shared package..."
    cd packages/shared
    
    # Install the missing types
    yarn add --dev @types/crypto-js
    
    print_status "✅ @types/crypto-js installed"
    
    # CRITICAL FIX: Also install crypto-js if it's missing
    print_status "📦 Ensuring crypto-js is installed..."
    yarn add crypto-js
    
    print_status "✅ crypto-js ensured"
    
    # CRITICAL FIX: Install types at workspace root level too
    print_status "📦 Installing types at workspace root level..."
    cd ../..
    yarn add --dev @types/crypto-js
    
    print_status "✅ @types/crypto-js installed at workspace root"
    
    # Go back to shared package
    cd packages/shared
    
    # Try to build the shared package
    print_status "🔨 Building shared package..."
    if yarn build; then
        print_status "✅ Shared package built successfully"
    else
        print_error "❌ Shared package build failed"
        print_status "🔍 Debugging: Checking node_modules structure..."
        ls -la node_modules/@types/ 2>/dev/null || echo "No @types directory found"
        ls -la ../../node_modules/@types/ 2>/dev/null || echo "No root @types directory found"
        exit 1
    fi
    
    cd ../..
    print_status "✅ Shared package fixed"
}

# Function to fix API package dependencies
fix_api_package() {
    print_step "Fixing API package dependencies..."
    
    print_status "📦 Installing all dependencies (including dev dependencies) for API..."
    cd apps/api
    
    # Install all dependencies including dev dependencies
    yarn install --frozen-lockfile
    
    print_status "✅ API dependencies installed"
    
    # Try to build the API package
    print_status "🔨 Building API package..."
    if yarn build; then
        print_status "✅ API package built successfully"
    else
        print_error "❌ API package build failed"
        exit 1
    fi
    
    cd ../..
    print_status "✅ API package fixed"
}

# Function to clean up dev dependencies after build
cleanup_dev_dependencies() {
    print_step "Cleaning up dev dependencies to save space..."
    
    print_status "🧹 Removing dev dependencies from API package..."
    cd apps/api
    yarn install --production --frozen-lockfile
    cd ../..
    
    print_status "🧹 Removing dev dependencies from shared package..."
    cd packages/shared
    yarn install --production --frozen-lockfile
    cd ../..
    
    print_status "✅ Dev dependencies cleaned up"
}

# Function to verify the build
verify_build() {
    print_step "Verifying build output..."
    
    # Check shared package build
    if [ -f "packages/shared/dist/index.js" ]; then
        print_status "✅ Shared package build exists"
    else
        print_error "❌ Shared package build missing"
        exit 1
    fi
    
    # Check API package build
    if [ -f "apps/api/dist/src/main.js" ]; then
        print_status "✅ API package build exists"
    else
        print_error "❌ API package build missing"
        exit 1
    fi
    
    print_status "✅ Build verification completed"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Quick Fix Script for Club Corra API Build Issues on EC2"
    echo "This script fixes common build issues: missing types and NestJS CLI"
    echo ""
    echo "Options:"
    echo "  --fix        Fix all build issues"
    echo "  --shared     Fix only shared package issues"
    echo "  --api        Fix only API package issues"
    echo "  --cleanup    Clean up dev dependencies after build"
    echo "  --verify     Verify build output"
    echo "  --help, -h   Show this help message"
    echo ""
    echo "Prerequisites:"
    echo "  - Run from club-corra-pilot root directory"
    echo "  - Have yarn installed"
    echo "  - Have sufficient disk space"
}

# Main function
main() {
    case "${1:-}" in
        --fix)
            print_status "🔧 Fixing all build issues..."
            check_directory
            fix_shared_package
            fix_api_package
            cleanup_dev_dependencies
            verify_build
            print_status "🎉 All build issues fixed!"
            ;;
        --shared)
            print_status "🔧 Fixing shared package issues..."
            check_directory
            fix_shared_package
            print_status "✅ Shared package issues fixed!"
            ;;
        --api)
            print_status "🔧 Fixing API package issues..."
            check_directory
            fix_api_package
            print_status "✅ API package issues fixed!"
            ;;
        --cleanup)
            print_status "🧹 Cleaning up dev dependencies..."
            check_directory
            cleanup_dev_dependencies
            print_status "✅ Dev dependencies cleaned up!"
            ;;
        --verify)
            print_status "🔍 Verifying build output..."
            check_directory
            verify_build
            print_status "✅ Build verification completed!"
            ;;
        --help|-h)
            show_usage
            exit 0
            ;;
        *)
            print_error "Invalid option. Use --help for usage information."
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
