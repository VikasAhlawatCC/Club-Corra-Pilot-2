#!/bin/bash

# Disk Space Cleanup Script for Club Corra API on EC2 t3.small
# This script aggressively cleans up disk space to prevent ENOSPC errors
# Run this BEFORE running the deployment script

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

# Function to show disk usage
show_disk_usage() {
    print_step "Current disk usage:"
    df -h /
    echo ""
    print_step "Largest directories in /opt:"
    sudo du -sh /opt/* 2>/dev/null | sort -hr | head -10 || echo "No /opt directories found"
    echo ""
    print_step "Largest directories in /var/log:"
    sudo du -sh /var/log/* 2>/dev/null | sort -hr | head -10 || echo "No /var/log directories found"
    echo ""
    print_step "Largest directories in /home/ec2-user:"
    du -sh /home/ec2-user/* 2>/dev/null | sort -hr | head -10 || echo "No user directories found"
    echo ""
}

# Function to clean yarn cache
clean_yarn_cache() {
    print_step "Cleaning yarn cache..."
    
    # Clean global yarn cache
    if command -v yarn >/dev/null 2>&1; then
        print_status "Cleaning global yarn cache..."
        yarn cache clean --force 2>/dev/null || true
        print_status "✅ Global yarn cache cleaned"
    fi
    
    # Clean npm cache
    if command -v npm >/dev/null 2>&1; then
        print_status "Cleaning npm cache..."
        npm cache clean --force 2>/dev/null || true
        print_status "✅ NPM cache cleaned"
    fi
    
    # Remove yarn cache directories
    print_status "Removing yarn cache directories..."
    sudo rm -rf /home/ec2-user/.cache/yarn 2>/dev/null || true
    sudo rm -rf /home/ec2-user/.yarn 2>/dev/null || true
    sudo rm -rf /root/.cache/yarn 2>/dev/null || true
    sudo rm -rf /root/.yarn 2>/dev/null || true
    print_status "✅ Yarn cache directories removed"
}

# Function to clean npm cache
clean_npm_cache() {
    print_step "Cleaning npm cache..."
    
    # Clean npm cache
    if command -v npm >/dev/null 2>&1; then
        print_status "Cleaning npm cache..."
        npm cache clean --force 2>/dev/null || true
    fi
    
    # Remove npm cache directories
    print_status "Removing npm cache directories..."
    sudo rm -rf /home/ec2-user/.npm 2>/dev/null || true
    sudo rm -rf /root/.npm 2>/dev/null || true
    print_status "✅ NPM cache directories removed"
}

# Function to clean system logs
clean_system_logs() {
    print_step "Cleaning system logs..."
    
    # Clean journal logs (keep only last 3 days)
    print_status "Cleaning systemd journal logs..."
    sudo journalctl --vacuum-time=3d 2>/dev/null || true
    sudo journalctl --vacuum-size=50M 2>/dev/null || true
    print_status "✅ Systemd journal logs cleaned"
    
    # Clean old log files
    print_status "Cleaning old log files..."
    sudo find /var/log -name "*.log" -mtime +7 -delete 2>/dev/null || true
    sudo find /var/log -name "*.log.*" -mtime +7 -delete 2>/dev/null || true
    sudo find /var/log -name "*.gz" -mtime +7 -delete 2>/dev/null || true
    print_status "✅ Old log files cleaned"
    
    # Clean package manager logs
    print_status "Cleaning package manager logs..."
    sudo rm -rf /var/log/yum.log* 2>/dev/null || true
    sudo rm -rf /var/log/dnf.log* 2>/dev/null || true
    sudo rm -rf /var/log/apt/ 2>/dev/null || true
    print_status "✅ Package manager logs cleaned"
}

# Function to clean temporary files
clean_temp_files() {
    print_step "Cleaning temporary files..."
    
    # Clean /tmp
    print_status "Cleaning /tmp directory..."
    sudo find /tmp -type f -mtime +1 -delete 2>/dev/null || true
    sudo find /tmp -type d -empty -delete 2>/dev/null || true
    print_status "✅ /tmp directory cleaned"
    
    # Clean /var/tmp
    print_status "Cleaning /var/tmp directory..."
    sudo find /var/tmp -type f -mtime +1 -delete 2>/dev/null || true
    sudo find /var/tmp -type d -empty -delete 2>/dev/null || true
    print_status "✅ /var/tmp directory cleaned"
    
    # Clean user temp files
    print_status "Cleaning user temporary files..."
    rm -rf /home/ec2-user/.cache/* 2>/dev/null || true
    rm -rf /home/ec2-user/.tmp/* 2>/dev/null || true
    rm -rf /home/ec2-user/tmp/* 2>/dev/null || true
    print_status "✅ User temporary files cleaned"
}

# Function to clean old backups
clean_old_backups() {
    print_step "Cleaning old backups..."
    
    # Clean old deployment backups
    if [ -d "/opt/club-corra-api-backup" ]; then
        print_status "Cleaning old deployment backups..."
        sudo find /opt/club-corra-api-backup -name "backup-*" -mtime +7 -exec rm -rf {} \; 2>/dev/null || true
        print_status "✅ Old deployment backups cleaned"
    fi
    
    # Clean old system backups
    print_status "Cleaning old system backups..."
    sudo find /var/backups -type f -mtime +7 -delete 2>/dev/null || true
    sudo find /var/cache -type f -mtime +7 -delete 2>/dev/null || true
    print_status "✅ Old system backups cleaned"
}

# Function to clean package caches
clean_package_caches() {
    print_step "Cleaning package caches..."
    
    # Clean yum/dnf cache
    if command -v yum >/dev/null 2>&1; then
        print_status "Cleaning yum cache..."
        sudo yum clean all 2>/dev/null || true
        sudo rm -rf /var/cache/yum/* 2>/dev/null || true
        print_status "✅ Yum cache cleaned"
    fi
    
    if command -v dnf >/dev/null 2>&1; then
        print_status "Cleaning dnf cache..."
        sudo dnf clean all 2>/dev/null || true
        sudo rm -rf /var/cache/dnf/* 2>/dev/null || true
        print_status "✅ DNF cache cleaned"
    fi
    
    # Clean apt cache (if on Ubuntu)
    if command -v apt >/dev/null 2>&1; then
        print_status "Cleaning apt cache..."
        sudo apt clean 2>/dev/null || true
        sudo apt autoclean 2>/dev/null || true
        print_status "✅ APT cache cleaned"
    fi
}

# Function to clean old node_modules (if they exist)
clean_old_node_modules() {
    print_step "Cleaning old node_modules directories..."
    
    # Find and remove old node_modules in user directory
    print_status "Searching for old node_modules directories..."
    find /home/ec2-user -name "node_modules" -type d -mtime +1 -exec rm -rf {} \; 2>/dev/null || true
    print_status "✅ Old node_modules directories cleaned"
    
    # Clean any leftover build artifacts
    print_status "Cleaning build artifacts..."
    find /home/ec2-user -name "dist" -type d -mtime +1 -exec rm -rf {} \; 2>/dev/null || true
    find /home/ec2-user -name ".next" -type d -mtime +1 -exec rm -rf {} \; 2>/dev/null || true
    find /home/ec2-user -name ".turbo" -type d -mtime +1 -exec rm -rf {} \; 2>/dev/null || true
    print_status "✅ Build artifacts cleaned"
}

# Function to clean Docker (if installed)
clean_docker() {
    print_step "Cleaning Docker (if installed)..."
    
    if command -v docker >/dev/null 2>&1; then
        print_status "Cleaning Docker system..."
        sudo docker system prune -af 2>/dev/null || true
        sudo docker volume prune -f 2>/dev/null || true
        print_status "✅ Docker cleaned"
    else
        print_status "Docker not installed, skipping"
    fi
}

# Function to clean old kernels (Amazon Linux)
clean_old_kernels() {
    print_step "Cleaning old kernels..."
    
    if command -v package-cleanup >/dev/null 2>&1; then
        print_status "Cleaning old kernels with package-cleanup..."
        sudo package-cleanup --oldkernels --count=1 -y 2>/dev/null || true
        print_status "✅ Old kernels cleaned"
    else
        print_status "package-cleanup not available, skipping kernel cleanup"
    fi
}

# Function to optimize swap
optimize_swap() {
    print_step "Optimizing swap usage..."
    
    # Clear swap if it exists
    if [ -f /proc/swaps ] && [ -s /proc/swaps ]; then
        print_status "Clearing swap..."
        sudo swapoff -a 2>/dev/null || true
        sudo swapon -a 2>/dev/null || true
        print_status "✅ Swap optimized"
    else
        print_status "No swap configured, skipping"
    fi
}

# Function to clean specific project directories
clean_project_directories() {
    print_step "Cleaning project directories..."
    
    # Clean any existing club-corra directories
    if [ -d "/home/ec2-user/club-corra-api" ]; then
        print_status "Cleaning existing club-corra-api directory..."
        rm -rf /home/ec2-user/club-corra-api/node_modules 2>/dev/null || true
        rm -rf /home/ec2-user/club-corra-api/dist 2>/dev/null || true
        rm -rf /home/ec2-user/club-corra-api/.turbo 2>/dev/null || true
        print_status "✅ club-corra-api directory cleaned"
    fi
    
    if [ -d "/home/ec2-user/club-corra-pilot" ]; then
        print_status "Cleaning existing club-corra-pilot directory..."
        rm -rf /home/ec2-user/club-corra-pilot/node_modules 2>/dev/null || true
        rm -rf /home/ec2-user/club-corra-pilot/apps/*/node_modules 2>/dev/null || true
        rm -rf /home/ec2-user/club-corra-pilot/apps/*/dist 2>/dev/null || true
        rm -rf /home/ec2-user/club-corra-pilot/.turbo 2>/dev/null || true
        print_status "✅ club-corra-pilot directory cleaned"
    fi
}

# Function to show final disk usage
show_final_disk_usage() {
    print_step "Final disk usage after cleanup:"
    df -h /
    echo ""
    
    # Calculate space freed
    AVAILABLE_SPACE=$(df / | awk 'NR==2 {print $4}')
    print_status "Available space: ${AVAILABLE_SPACE}KB"
    
    if [ "$AVAILABLE_SPACE" -gt 1048576 ]; then  # More than 1GB
        print_status "✅ Sufficient space available for deployment"
    else
        print_warning "⚠️ Still low on space. Consider:"
        print_warning "  - Upgrading to a larger EC2 instance"
        print_warning "  - Adding additional EBS volume"
        print_warning "  - Further cleanup of application data"
    fi
}

# Main cleanup function
main() {
    print_status "🧹 Starting aggressive disk cleanup for EC2 t3.small..."
    print_warning "This will clean up caches, logs, and temporary files to free disk space"
    echo ""
    
    # Show initial disk usage
    show_disk_usage
    
    # Perform cleanup operations
    clean_yarn_cache
    clean_npm_cache
    clean_system_logs
    clean_temp_files
    clean_old_backups
    clean_package_caches
    clean_old_node_modules
    clean_docker
    clean_old_kernels
    optimize_swap
    clean_project_directories
    
    # Show final disk usage
    show_final_disk_usage
    
    print_status "🎉 Disk cleanup completed!"
    print_status "You can now run the deployment script safely."
}

# Handle script arguments
case "${1:-}" in
    --help|-h)
        echo "Usage: $0 [OPTION]"
        echo ""
        echo "Disk Space Cleanup Script for Club Corra API on EC2 t3.small"
        echo "This script aggressively cleans up disk space to prevent ENOSPC errors"
        echo ""
        echo "Options:"
        echo "  --help, -h    Show this help message"
        echo "  --dry-run     Show what would be cleaned without actually cleaning"
        echo ""
        echo "Run this script BEFORE running the deployment script to ensure sufficient space."
        exit 0
        ;;
    --dry-run)
        print_status "🔍 DRY RUN MODE - No files will be deleted"
        print_status "This would clean:"
        echo "  - Yarn and npm caches"
        echo "  - System logs (older than 7 days)"
        echo "  - Temporary files"
        echo "  - Old backups"
        echo "  - Package manager caches"
        echo "  - Old node_modules directories"
        echo "  - Docker system (if installed)"
        echo "  - Old kernels (if available)"
        echo ""
        show_disk_usage
        exit 0
        ;;
    *)
        main
        ;;
esac
