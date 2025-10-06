#!/bin/bash

# Complete Club Corra API Deployment Script for EC2 t3.small
# This script handles the complete deployment process including cleanup, HTTPS setup, and deployment
# Run this script on your EC2 instance after SSH connection

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

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Complete Club Corra API Deployment Script for EC2 t3.small"
    echo "This script handles the complete deployment process including cleanup, HTTPS setup, and deployment"
    echo ""
    echo "Options:"
    echo "  --full        Run complete deployment (cleanup + fix + HTTPS + deploy)"
    echo "  --cleanup     Run only disk cleanup"
    echo "  --fix         Run only build issue fixes"
    echo "  --https       Run only HTTPS setup"
    echo "  --deploy      Run only optimized deployment (includes fix)"
    echo "  --logs        Run only log rotation setup"
    echo "  --help, -h    Show this help message"
    echo ""
    echo "Prerequisites:"
    echo "  - SSH to your EC2 instance first"
    echo "  - Ensure you're in the club-corra-pilot directory"
    echo "  - Have sudo privileges"
    echo ""
    echo "Example:"
    echo "  ssh -i your-key.pem ec2-user@YOUR_EC2_IP"
    echo "  cd club-corra-pilot"
    echo "  ./scripts/deployment/deploy-complete.sh --full"
}

# Function to check if we're on EC2
check_environment() {
    print_step "Checking environment..."
    
    # Check if we're on EC2 (Amazon Linux)
    if [[ ! -f /etc/os-release ]] || ! grep -q "Amazon Linux" /etc/os-release; then
        print_error "This script must be run on an Amazon Linux EC2 instance!"
        print_error "Please SSH to your EC2 instance first, then run this script."
        exit 1
    fi
    
    # Check if we have sudo access
    if ! sudo -n true 2>/dev/null; then
        print_error "This script requires sudo access to configure system services."
        print_error "Please ensure you have sudo privileges."
        exit 1
    fi
    
    # Check if we're running as ec2-user (not root)
    if [ "$EUID" -eq 0 ]; then
        print_error "This script should not be run as root. Please run as ec2-user."
        exit 1
    fi
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ] || [ ! -d "apps/api" ]; then
        print_error "This script must be run from the club-corra-pilot directory!"
        print_error "Please navigate to the correct directory first."
        exit 1
    fi
    
    print_status "Environment check passed - running on Amazon Linux EC2 with sudo access."
}

# Function to run disk cleanup
run_cleanup() {
    print_step "Running disk cleanup..."
    
    if [ -f "scripts/deployment/cleanup-disk-space.sh" ]; then
        print_status "Running disk cleanup script..."
        chmod +x scripts/deployment/cleanup-disk-space.sh
        ./scripts/deployment/cleanup-disk-space.sh
        print_status "✅ Disk cleanup completed"
    else
        print_error "Disk cleanup script not found!"
        exit 1
    fi
}

# Function to run HTTPS setup
run_https_setup() {
    print_step "Running HTTPS setup..."
    
    if [ -f "scripts/deployment/setup-https-backend.sh" ]; then
        print_status "Running HTTPS setup script..."
        chmod +x scripts/deployment/setup-https-backend.sh
        sudo ./scripts/deployment/setup-https-backend.sh
        print_status "✅ HTTPS setup completed"
    else
        print_error "HTTPS setup script not found!"
        exit 1
    fi
}

# Function to fix build issues
fix_build_issues() {
    print_step "Fixing build issues..."
    
    if [ -f "scripts/deployment/fix-build-issues.sh" ]; then
        print_status "Running build fix script..."
        chmod +x scripts/deployment/fix-build-issues.sh
        ./scripts/deployment/fix-build-issues.sh --fix
        print_status "✅ Build issues fixed"
    else
        print_error "Build fix script not found!"
        exit 1
    fi
}

# Function to run optimized deployment
run_deployment() {
    print_step "Running optimized deployment..."
    
    if [ -f "scripts/deployment/deploy-production-ec2-optimized.sh" ]; then
        print_status "Running optimized deployment script..."
        chmod +x scripts/deployment/deploy-production-ec2-optimized.sh
        ./scripts/deployment/deploy-production-ec2-optimized.sh
        print_status "✅ Optimized deployment completed"
    else
        print_error "Optimized deployment script not found!"
        exit 1
    fi
}

# Function to run log rotation setup
run_log_rotation() {
    print_step "Running log rotation setup..."
    
    if [ -f "scripts/deployment/setup-log-rotation.sh" ]; then
        print_status "Running log rotation setup script..."
        chmod +x scripts/deployment/setup-log-rotation.sh
        ./scripts/deployment/setup-log-rotation.sh --setup
        print_status "✅ Log rotation setup completed"
    else
        print_error "Log rotation setup script not found!"
        exit 1
    fi
}

# Function to verify all scripts exist
verify_scripts() {
    print_step "Verifying all required scripts exist..."
    
    local missing_scripts=()
    
    if [ ! -f "scripts/deployment/cleanup-disk-space.sh" ]; then
        missing_scripts+=("cleanup-disk-space.sh")
    fi
    
    if [ ! -f "scripts/deployment/setup-https-backend.sh" ]; then
        missing_scripts+=("setup-https-backend.sh")
    fi
    
    if [ ! -f "scripts/deployment/deploy-production-ec2-optimized.sh" ]; then
        missing_scripts+=("deploy-production-ec2-optimized.sh")
    fi
    
    if [ ! -f "scripts/deployment/setup-log-rotation.sh" ]; then
        missing_scripts+=("setup-log-rotation.sh")
    fi
    
    if [ ${#missing_scripts[@]} -gt 0 ]; then
        print_error "Missing required scripts:"
        for script in "${missing_scripts[@]}"; do
            print_error "  - scripts/deployment/$script"
        done
        exit 1
    fi
    
    print_status "✅ All required scripts found"
}

# Function to show final status
show_final_status() {
    print_step "Final deployment status..."
    
    echo ""
    echo "🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!"
    echo ""
    echo "📋 Service Status:"
    sudo systemctl status club-corra-api --no-pager -l | head -10
    
    echo ""
    echo "📊 Disk Usage:"
    df -h /
    
    echo ""
    echo "🌐 Nginx Status:"
    sudo systemctl status nginx --no-pager -l | head -5
    
    echo ""
    echo "📝 Useful Commands:"
    echo "  - View API logs: sudo journalctl -u club-corra-api -f"
    echo "  - View nginx logs: sudo journalctl -u nginx -f"
    echo "  - Restart API: sudo systemctl restart club-corra-api"
    echo "  - Check API health: curl http://localhost:8080/api/v1/health"
    echo "  - Check disk space: df -h"
    echo "  - Monitor resources: tail -f /opt/club-corra-monitoring/resource-monitoring.log"
    
    echo ""
    echo "🔒 HTTPS Configuration:"
    if [ -d "/etc/letsencrypt/live" ]; then
        echo "  - SSL certificates are installed"
        echo "  - Check certificate expiry: sudo certbot certificates"
        echo "  - Renew certificates: sudo certbot renew"
    else
        echo "  - SSL certificates not found - check HTTPS setup"
    fi
    
    echo ""
    echo "📁 Important Directories:"
    echo "  - API application: /opt/club-corra-api"
    echo "  - API backups: /opt/club-corra-api-backup"
    echo "  - API logs: /var/log/club-corra-api"
    echo "  - Monitoring: /opt/club-corra-monitoring"
    echo "  - Nginx config: /etc/nginx/conf.d/club-corra-api.conf"
}

# Main function
main() {
    case "${1:-}" in
        --full)
            print_status "🚀 Starting complete deployment process..."
            check_environment
            verify_scripts
            run_cleanup
            fix_build_issues
            run_https_setup
            run_deployment
            run_log_rotation
            show_final_status
            ;;
        --cleanup)
            print_status "🧹 Running disk cleanup only..."
            check_environment
            run_cleanup
            ;;
        --https)
            print_status "🔒 Running HTTPS setup only..."
            check_environment
            run_https_setup
            ;;
        --deploy)
            print_status "🚀 Running deployment only..."
            check_environment
            fix_build_issues
            run_deployment
            ;;
        --fix)
            print_status "🔧 Fixing build issues only..."
            check_environment
            fix_build_issues
            ;;
        --logs)
            print_status "📊 Setting up log rotation only..."
            check_environment
            run_log_rotation
            ;;
        --help|-h)
            show_usage
            exit 0
            ;;
        *)
            print_error "Invalid option. Use --help for usage information."
            print_error "Remember: This script must run ON EC2, not from your local machine!"
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
