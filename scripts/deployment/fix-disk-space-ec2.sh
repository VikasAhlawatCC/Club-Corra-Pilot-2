#!/bin/bash

# Disk Space Fix Script for EC2
# This script cleans up disk space and shows usage

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

echo "🔍 Checking Disk Space on EC2 Instance"
echo "========================================"
echo ""

# Check current disk usage
print_step "Current disk usage:"
df -h

echo ""
print_step "Disk usage by directory:"
sudo du -sh /* 2>/dev/null | sort -hr | head -20

echo ""
print_step "Checking yarn cache size:"
du -sh ~/.cache/yarn 2>/dev/null || echo "No yarn cache found"
du -sh /usr/local/share/.cache/yarn 2>/dev/null || echo "No system yarn cache found"

echo ""
print_step "Checking npm cache size:"
du -sh ~/.npm 2>/dev/null || echo "No npm cache found"

echo ""
print_step "🧹 Cleaning up disk space..."

# Clean yarn cache
print_status "Cleaning yarn cache..."
yarn cache clean 2>/dev/null || true
sudo rm -rf /usr/local/share/.cache/yarn/* 2>/dev/null || true
sudo rm -rf ~/.cache/yarn/* 2>/dev/null || true
print_success "Yarn cache cleaned"

# Clean npm cache
print_status "Cleaning npm cache..."
npm cache clean --force 2>/dev/null || true
print_success "NPM cache cleaned"

# Clean DNF/YUM cache
print_status "Cleaning package manager cache..."
sudo dnf clean all 2>/dev/null || sudo yum clean all 2>/dev/null || true
print_success "Package manager cache cleaned"

# Clean journal logs (keep last 2 days)
print_status "Cleaning old system logs..."
sudo journalctl --vacuum-time=2d 2>/dev/null || true
print_success "System logs cleaned"

# Remove old log files
print_status "Cleaning old log files..."
sudo find /var/log -type f -name "*.log.*" -mtime +7 -delete 2>/dev/null || true
sudo find /var/log -type f -name "*.gz" -mtime +7 -delete 2>/dev/null || true
print_success "Old log files cleaned"

# Clean tmp directories
print_status "Cleaning temporary files..."
sudo find /tmp -type f -atime +7 -delete 2>/dev/null || true
sudo find /var/tmp -type f -atime +7 -delete 2>/dev/null || true
print_success "Temporary files cleaned"

echo ""
print_step "Disk usage after cleanup:"
df -h

echo ""
print_success "✅ Disk cleanup completed!"
echo ""
echo "📊 Next steps:"
echo "1. If you still don't have enough space, consider:"
echo "   - Increasing EC2 volume size (EBS)"
echo "   - Using a larger instance type"
echo "   - Removing old node_modules directories"
echo ""
echo "2. To increase EBS volume size:"
echo "   a. Go to AWS Console → EC2 → Volumes"
echo "   b. Select your volume and modify size"
echo "   c. Run: sudo growpart /dev/xvda 1"
echo "   d. Run: sudo xfs_growfs -d /"
echo ""
echo "3. To check for large node_modules:"
echo "   find ~ -name 'node_modules' -type d -prune -exec du -sh {} +"
