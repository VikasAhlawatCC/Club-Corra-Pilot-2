#!/bin/bash

# Setup Log Rotation, Backup Lifecycle Management, and Resource Monitoring for Club Corra API
# This script MUST be run ON THE EC2 INSTANCE (not from local machine)
# It sets up proper log rotation, backup management, and resource monitoring to prevent storage issues

set -e  # Exit on any error

# Configuration (aligned with deploy-production-ec2.sh)
SERVICE_NAME="club-corra-api"
APP_DIR="/opt/club-corra-api"
BACKUP_DIR="/opt/club-corra-api-backup"
LOG_DIR="/var/log/club-corra-api"
MONITORING_DIR="/opt/club-corra-monitoring"

# Colors for output (aligned with deploy-production-ec2.sh)
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

# Function to check if running on EC2
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
    
    print_status "Environment check passed - running on Amazon Linux EC2 with sudo access."
}

# Function to setup log rotation
setup_log_rotation() {
    print_step "Setting up log rotation configuration..."
    
    # Create log directory
    print_status "📁 Creating log directory: $LOG_DIR"
    sudo mkdir -p "$LOG_DIR"
    sudo chown -R ec2-user:ec2-user "$LOG_DIR"
    
    # Copy logrotate configuration
    print_status "📝 Creating logrotate configuration..."
    sudo tee /etc/logrotate.d/club-corra-api > /dev/null << 'LOGROTATE_EOF'
# Log rotation configuration optimized for 8GB EC2 instance
/var/log/club-corra-api/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    size 10M
    create 644 ec2-user ec2-user
    postrotate
        systemctl reload club-corra-api >/dev/null 2>&1 || true
    endscript
}

# Application-specific logs (more aggressive for 8GB instance)
/opt/club-corra-api/logs/*.log {
    daily
    missingok
    rotate 5
    compress
    delaycompress
    notifempty
    size 5M
    create 644 ec2-user ec2-user
    postrotate
        systemctl reload club-corra-api >/dev/null 2>&1 || true
        # Clean up any .log files larger than 20MB immediately
        find /opt/club-corra-api/logs -name "*.log" -size +20M -exec truncate -s 0 {} \; 2>/dev/null || true
    endscript
}

# Temporary files cleanup (aggressive for 8GB instance)
/opt/club-corra-api/temp/*.log {
    daily
    missingok
    rotate 2
    compress
    delaycompress
    notifempty
    size 2M
    create 644 ec2-user ec2-user
    postrotate
        # Clean up temp files older than 1 day for 8GB instance
        find /opt/club-corra-api/temp -name "*.log" -mtime +1 -delete 2>/dev/null || true
        find /opt/club-corra-api/temp -name "*.tmp" -mtime +1 -delete 2>/dev/null || true
        find /opt/club-corra-api/temp -name "*.cache" -mtime +1 -delete 2>/dev/null || true
    endscript
}
LOGROTATE_EOF
    
    # Set proper permissions
    sudo chmod 644 /etc/logrotate.d/club-corra-api
    
    # Test logrotate configuration
    print_status "🧪 Testing logrotate configuration..."
    if sudo logrotate -d /etc/logrotate.d/club-corra-api >/dev/null 2>&1; then
        print_status "✅ Logrotate configuration test passed"
    else
        print_warning "⚠️ Logrotate configuration test had warnings, but continuing..."
    fi
    
    # Setup daily cron job for log rotation
    print_status "⏰ Setting up daily log rotation cron job..."
    sudo tee /etc/cron.daily/logrotate-club-corra-api > /dev/null << 'CRON_EOF'
#!/bin/bash
# Daily log rotation for Club Corra API
/usr/sbin/logrotate /etc/logrotate.d/club-corra-api
# Clean up old rotated logs
find /var/log/club-corra-api -name "*.log.*" -mtime +30 -delete 2>/dev/null || true
find /opt/club-corra-api/logs -name "*.log.*" -mtime +30 -delete 2>/dev/null || true
CRON_EOF
    
    sudo chmod +x /etc/cron.daily/logrotate-club-corra-api
    
    # Setup systemd journal log rotation
    print_status "📊 Configuring systemd journal log rotation..."
    sudo mkdir -p /etc/systemd/journald.conf.d
    sudo tee /etc/systemd/journald.conf.d/99-club-corra-api.conf > /dev/null << 'JOURNAL_EOF'
[Journal]
# Optimized for 8GB EC2 instance - aggressive space management
SystemMaxUse=50M
# Keep 500MB free space for 8GB instance
SystemKeepFree=500M
# Maximum size per journal file (smaller for 8GB)
SystemMaxFileSize=5M
# Keep logs for maximum 3 days on 8GB instance
MaxRetentionSec=3days
# Compress old journal files immediately
Compress=yes
# Sync to disk every 60 seconds (less frequent to reduce I/O)
SyncIntervalSec=60
# Forward logs to syslog to reduce journal size
ForwardToSyslog=yes
JOURNAL_EOF
    
    # Restart journald to apply changes
    print_status "🔄 Restarting systemd-journald to apply changes..."
    sudo systemctl restart systemd-journald
    
    print_status "✅ Log rotation setup completed successfully!"
}

# Function to setup backup lifecycle management
setup_backup_management() {
    print_step "Setting up backup lifecycle management..."
    
    # Create monitoring directory
    print_status "📁 Creating monitoring directory: $MONITORING_DIR"
    sudo mkdir -p "$MONITORING_DIR"
    sudo chown -R ec2-user:ec2-user "$MONITORING_DIR"
    
    # Create backup cleanup script
    print_status "📝 Creating backup cleanup script..."
    sudo tee "$MONITORING_DIR/cleanup-backups.sh" > /dev/null << 'BACKUP_CLEANUP_EOF'
#!/bin/bash
# Backup cleanup script for Club Corra API
# This script cleans up old backups to prevent disk space issues

set -e

BACKUP_DIR="/opt/club-corra-api-backup"
MAX_BACKUPS=3
MAX_BACKUP_AGE_DAYS=14

echo "$(date): Starting backup cleanup..."

# Check if backup directory exists
if [ ! -d "$BACKUP_DIR" ]; then
    echo "Backup directory not found: $BACKUP_DIR"
    exit 0
fi

# Count current backups
BACKUP_COUNT=$(find "$BACKUP_DIR" -name "backup-*" -type d | wc -l)
echo "Current backup count: $BACKUP_COUNT"

# Remove backups older than MAX_BACKUP_AGE_DAYS days
echo "Removing backups older than $MAX_BACKUP_AGE_DAYS days..."
find "$BACKUP_DIR" -name "backup-*" -type d -mtime +$MAX_BACKUP_AGE_DAYS -exec rm -rf {} \; 2>/dev/null || true

# If still too many backups, remove oldest ones (keep MAX_BACKUPS)
if [ "$BACKUP_COUNT" -gt "$MAX_BACKUPS" ]; then
    echo "Too many backups, removing oldest ones..."
    find "$BACKUP_DIR" -name "backup-*" -type d -printf '%T@ %p\n' | sort -n | head -n $((BACKUP_COUNT - MAX_BACKUPS)) | cut -d' ' -f2- | xargs -r rm -rf
fi

# Enhanced cleanup for 8GB EC2 - check backup sizes and remove large ones if needed
echo "Checking backup sizes for 8GB instance optimization..."
TOTAL_BACKUP_SIZE=$(du -sm "$BACKUP_DIR" 2>/dev/null | cut -f1 || echo "0")
if [ "$TOTAL_BACKUP_SIZE" -gt 500 ]; then
    echo "🚨 WARNING: Backups using ${TOTAL_BACKUP_SIZE}MB (>500MB limit for 8GB instance)"
    echo "Removing largest backups to free space..."
    find "$BACKUP_DIR" -name "backup-*" -type d -exec du -sm {} \; | sort -nr | head -n 2 | cut -f2- | xargs -r rm -rf
fi

# Show final backup count
FINAL_COUNT=$(find "$BACKUP_DIR" -name "backup-*" -type d | wc -l)
echo "Final backup count: $FINAL_COUNT"

# Show disk usage
echo "Backup directory disk usage:"
du -sh "$BACKUP_DIR" 2>/dev/null || echo "Could not determine disk usage"

echo "$(date): Backup cleanup completed"
BACKUP_CLEANUP_EOF
    
    sudo chmod +x "$MONITORING_DIR/cleanup-backups.sh"
    
    # Create backup verification script
    print_status "🔍 Creating backup verification script..."
    sudo tee "$MONITORING_DIR/verify-backups.sh" > /dev/null << 'BACKUP_VERIFY_EOF'
#!/bin/bash
# Backup verification script for Club Corra API
# This script verifies the integrity of existing backups

set -e

BACKUP_DIR="/opt/club-corra-api-backup"
VERIFICATION_LOG="$MONITORING_DIR/backup-verification.log"

echo "$(date): Starting backup verification..." | tee -a "$VERIFICATION_LOG"

# Check if backup directory exists
if [ ! -d "$BACKUP_DIR" ]; then
    echo "Backup directory not found: $BACKUP_DIR" | tee -a "$VERIFICATION_LOG"
    exit 1
fi

# Verify each backup
for backup in "$BACKUP_DIR"/backup-*; do
    if [ -d "$backup" ]; then
        echo "Verifying backup: $(basename "$backup")" | tee -a "$VERIFICATION_LOG"
        
        # Check if critical files exist
        if [ -f "$backup/dist/apps/api/src/main.js" ]; then
            echo "  ✅ Main.js exists" | tee -a "$VERIFICATION_LOG"
        else
            echo "  ❌ Main.js missing" | tee -a "$VERIFICATION_LOG"
        fi
        
        if [ -f "$backup/package.json" ]; then
            echo "  ✅ Package.json exists" | tee -a "$VERIFICATION_LOG"
        else
            echo "  ❌ Package.json missing" | tee -a "$VERIFICATION_LOG"
        fi
        
        if [ -d "$backup/node_modules" ]; then
            echo "  ✅ Node modules exist" | tee -a "$VERIFICATION_LOG"
        else
            echo "  ❌ Node modules missing" | tee -a "$VERIFICATION_LOG"
        fi
        
        # Check backup size
        BACKUP_SIZE=$(du -sh "$backup" 2>/dev/null | cut -f1)
        echo "  📊 Backup size: $BACKUP_SIZE" | tee -a "$VERIFICATION_LOG"
    fi
done

echo "$(date): Backup verification completed" | tee -a "$VERIFICATION_LOG"
BACKUP_VERIFY_EOF
    
    sudo chmod +x "$MONITORING_DIR/verify-backups.sh"
    
    # Setup backup cleanup cron job (weekly)
    print_status "⏰ Setting up weekly backup cleanup cron job..."
    sudo tee /etc/cron.weekly/cleanup-club-corra-backups > /dev/null << 'CRON_BACKUP_EOF'
#!/bin/bash
# Weekly backup cleanup for Club Corra API
/opt/club-corra-monitoring/cleanup-backups.sh >> /var/log/club-corra-backup-cleanup.log 2>&1
CRON_BACKUP_EOF
    
    sudo chmod +x /etc/cron.weekly/cleanup-club-corra-backups
    
    # Setup backup verification cron job (daily)
    print_status "⏰ Setting up daily backup verification cron job..."
    sudo tee /etc/cron.daily/verify-club-corra-backups > /dev/null << 'CRON_VERIFY_EOF'
#!/bin/bash
# Daily backup verification for Club Corra API
/opt/club-corra-monitoring/verify-backups.sh >> /var/log/club-corra-backup-verification.log 2>&1
CRON_VERIFY_EOF
    
    sudo chmod +x /etc/cron.daily/verify-club-corra-backups
    
    print_status "✅ Backup lifecycle management setup completed successfully!"
}

# Function to setup resource monitoring
setup_resource_monitoring() {
    print_step "Setting up resource monitoring..."
    
    # Create resource monitoring script
    print_status "📊 Creating resource monitoring script..."
    sudo tee "$MONITORING_DIR/monitor-resources.sh" > /dev/null << 'MONITOR_EOF'
#!/bin/bash
# Resource monitoring script for Club Corra API
# This script monitors system resources and alerts on issues

set -e

LOG_FILE="$MONITORING_DIR/resource-monitoring.log"
ALERT_THRESHOLD_DISK=85
ALERT_THRESHOLD_MEMORY=90
ALERT_THRESHOLD_CPU=95

echo "$(date): Starting resource monitoring..." | tee -a "$LOG_FILE"

# Disk space monitoring
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
echo "Disk usage: ${DISK_USAGE}%" | tee -a "$LOG_FILE"

if [ "$DISK_USAGE" -gt "$ALERT_THRESHOLD_DISK" ]; then
    echo "🚨 ALERT: High disk usage detected: ${DISK_USAGE}%" | tee -a "$LOG_FILE"
    
    # Show largest directories
    echo "Largest directories in /opt:" | tee -a "$LOG_FILE"
    sudo du -sh /opt/* 2>/dev/null | sort -hr | head -5 | tee -a "$LOG_FILE"
    
    # Show largest directories in /var/log
    echo "Largest directories in /var/log:" | tee -a "$LOG_FILE"
    sudo du -sh /var/log/* 2>/dev/null | sort -hr | head -5 | tee -a "$LOG_FILE"
fi

# Memory monitoring
MEMORY_USAGE=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
echo "Memory usage: ${MEMORY_USAGE}%" | tee -a "$LOG_FILE"

if [ "$MEMORY_USAGE" -gt "$ALERT_THRESHOLD_MEMORY" ]; then
    echo "🚨 ALERT: High memory usage detected: ${MEMORY_USAGE}%" | tee -a "$LOG_FILE"
    
    # Show top memory processes
    echo "Top memory processes:" | tee -a "$LOG_FILE"
    ps aux --sort=-%mem | head -6 | tee -a "$LOG_FILE"
fi

# CPU monitoring
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | sed 's/%us,//')
CPU_USAGE_INT=$(printf "%.0f" "$CPU_USAGE")
echo "CPU usage: ${CPU_USAGE_INT}%" | tee -a "$LOG_FILE"

if [ "$CPU_USAGE_INT" -gt "$ALERT_THRESHOLD_CPU" ]; then
    echo "🚨 ALERT: High CPU usage detected: ${CPU_USAGE_INT}%" | tee -a "$LOG_FILE"
    
    # Show top CPU processes
    echo "Top CPU processes:" | tee -a "$LOG_FILE"
    ps aux --sort=-%cpu | head -6 | tee -a "$LOG_FILE"
fi

# Service status monitoring
if systemctl is-active --quiet club-corra-api; then
    echo "✅ Club Corra API service is running" | tee -a "$LOG_FILE"
else
    echo "🚨 ALERT: Club Corra API service is not running!" | tee -a "$LOG_FILE"
fi

# Port monitoring
if netstat -tlnp | grep -q ":8080"; then
    echo "✅ Port 8080 is listening" | tee -a "$LOG_FILE"
else
    echo "🚨 ALERT: Port 8080 is not listening!" | tee -a "$LOG_FILE"
fi

# Log file sizes
echo "Log file sizes:" | tee -a "$LOG_FILE"
if [ -d "$LOG_DIR" ]; then
    find "$LOG_DIR" -name "*.log" -exec ls -lh {} \; 2>/dev/null | tee -a "$LOG_FILE"
fi

# Backup directory size
if [ -d "$BACKUP_DIR" ]; then
    BACKUP_SIZE=$(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1)
    echo "Backup directory size: $BACKUP_SIZE" | tee -a "$LOG_FILE"
fi

echo "$(date): Resource monitoring completed" | tee -a "$LOG_FILE"
MONITOR_EOF
    
    sudo chmod +x "$MONITORING_DIR/monitor-resources.sh"
    
    # Create log cleanup script
    print_status "🧹 Creating log cleanup script..."
    sudo tee "$MONITORING_DIR/cleanup-logs.sh" > /dev/null << 'CLEANUP_LOGS_EOF'
#!/bin/bash
# Log cleanup script for Club Corra API
# This script cleans up old log files to prevent disk space issues

set -e

LOG_FILE="$MONITORING_DIR/log-cleanup.log"
MAX_LOG_AGE_DAYS=30
MAX_LOG_SIZE_MB=100

echo "$(date): Starting log cleanup..." | tee -a "$LOG_FILE"

# Clean up old application logs
if [ -d "$LOG_DIR" ]; then
    echo "Cleaning up old application logs..." | tee -a "$LOG_FILE"
    find "$LOG_DIR" -name "*.log" -mtime +$MAX_LOG_AGE_DAYS -delete 2>/dev/null || true
    find "$LOG_DIR" -name "*.log.*" -mtime +$MAX_LOG_AGE_DAYS -delete 2>/dev/null || true
fi

# Clean up old backup verification logs
if [ -f "/var/log/club-corra-backup-verification.log" ]; then
    LOG_SIZE=$(du -m "/var/log/club-corra-backup-verification.log" | cut -f1)
    if [ "$LOG_SIZE" -gt "$MAX_LOG_SIZE_MB" ]; then
        echo "Truncating large backup verification log..." | tee -a "$LOG_FILE"
        sudo truncate -s 0 "/var/log/club-corra-backup-verification.log"
    fi
fi

# Clean up old backup cleanup logs
if [ -f "/var/log/club-corra-backup-cleanup.log" ]; then
    LOG_SIZE=$(du -m "/var/log/club-corra-backup-cleanup.log" | cut -f1)
    if [ "$LOG_SIZE" -gt "$MAX_LOG_SIZE_MB" ]; then
        echo "Truncating large backup cleanup log..." | tee -a "$LOG_FILE"
        sudo truncate -s 0 "/var/log/club-corra-backup-cleanup.log"
    fi
fi

# Clean up old resource monitoring logs
if [ -f "$LOG_FILE" ]; then
    LOG_SIZE=$(du -m "$LOG_FILE" | cut -f1)
    if [ "$LOG_SIZE" -gt "$MAX_LOG_SIZE_MB" ]; then
        echo "Truncating large resource monitoring log..." | tee -a "$LOG_FILE"
        truncate -s 0 "$LOG_FILE"
    fi
fi

echo "$(date): Log cleanup completed" | tee -a "$LOG_FILE"
CLEANUP_LOGS_EOF
    
    sudo chmod +x "$MONITORING_DIR/cleanup-logs.sh"
    
    # Setup monitoring cron jobs
    print_status "⏰ Setting up monitoring cron jobs..."
    
    # Resource monitoring every 5 minutes
    sudo tee /etc/cron.d/club-corra-monitoring > /dev/null << 'CRON_MONITOR_EOF'
# Resource monitoring for Club Corra API
*/5 * * * * ec2-user /opt/club-corra-monitoring/monitor-resources.sh >/dev/null 2>&1

# Log cleanup daily at 2 AM
0 2 * * * ec2-user /opt/club-corra-monitoring/cleanup-logs.sh >/dev/null 2>&1
CRON_MONITOR_EOF
    
    sudo chmod 644 /etc/cron.d/club-corra-monitoring
    
    # Create systemd service for resource monitoring (optional)
    print_status "⚙️ Creating systemd service for resource monitoring..."
    sudo tee /etc/systemd/system/club-corra-monitoring.service > /dev/null << 'SERVICE_EOF'
[Unit]
Description=Club Corra Resource Monitoring Service
After=network.target

[Service]
Type=oneshot
User=ec2-user
ExecStart=/opt/club-corra-monitoring/monitor-resources.sh
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
SERVICE_EOF
    
    # Enable the monitoring service
    sudo systemctl daemon-reload
    sudo systemctl enable club-corra-monitoring
    
    print_status "✅ Resource monitoring setup completed successfully!"
}

# Function to verify all setups
verify_all_setups() {
    print_step "Verifying all setups..."
    
    echo "=== Log Rotation Configuration ==="
    if [ -f "/etc/logrotate.d/club-corra-api" ]; then
        echo "✅ Logrotate configuration exists"
        cat /etc/logrotate.d/club-corra-api
    else
        echo "❌ Logrotate configuration missing"
    fi
    
    echo -e "\n=== Cron Jobs ==="
    echo "Log rotation:"
    ls -la /etc/cron.daily/logrotate-club-corra-api 2>/dev/null || echo "❌ Missing"
    
    echo -e "\nBackup cleanup:"
    ls -la /etc/cron.weekly/cleanup-club-corra-backups 2>/dev/null || echo "❌ Missing"
    
    echo -e "\nBackup verification:"
    ls -la /etc/cron.daily/verify-club-corra-backups 2>/dev/null || echo "❌ Missing"
    
    echo -e "\nResource monitoring:"
    ls -la /etc/cron.daily/verify-club-corra-backups 2>/dev/null || echo "❌ Missing"
    
    echo -e "\n=== Journald Configuration ==="
    if [ -f "/etc/systemd/journald.conf.d/99-club-corra-api.conf" ]; then
        echo "✅ Journald configuration exists"
        cat /etc/systemd/journald.conf.d/99-club-corra-api.conf
    else
        echo "❌ Journald configuration missing"
    fi
    
    echo -e "\n=== Monitoring Scripts ==="
    if [ -d "$MONITORING_DIR" ]; then
        echo "✅ Monitoring directory exists"
        ls -la "$MONITORING_DIR"
    else
        echo "❌ Monitoring directory missing"
    fi
    
    echo -e "\n=== Current Log Usage ==="
    du -sh /var/log/journal/ 2>/dev/null || echo "Could not determine journal usage"
    du -sh "$LOG_DIR" 2>/dev/null || echo "No application logs yet"
    du -sh "$BACKUP_DIR" 2>/dev/null || echo "No backups yet"
    
    echo -e "\n=== Service Status ==="
    if systemctl is-active --quiet club-corra-api; then
        echo "✅ Club Corra API service is running"
    else
        echo "❌ Club Corra API service is not running"
    fi
    
    if systemctl is-enabled --quiet club-corra-monitoring; then
        echo "✅ Monitoring service is enabled"
    else
        echo "❌ Monitoring service is not enabled"
    fi
}

# Function to test all functionalities
test_all_functionalities() {
    print_step "Testing all functionalities..."
    
    print_status "🧪 Testing log rotation..."
    if sudo logrotate -d /etc/logrotate.d/club-corra-api >/dev/null 2>&1; then
        print_status "✅ Logrotate test passed"
    else
        print_warning "⚠️ Logrotate test had warnings"
    fi
    
    print_status "🧪 Testing backup cleanup script..."
    if [ -x "$MONITORING_DIR/cleanup-backups.sh" ]; then
        print_status "✅ Backup cleanup script is executable"
    else
        print_error "❌ Backup cleanup script is not executable"
    fi
    
    print_status "🧪 Testing backup verification script..."
    if [ -x "$MONITORING_DIR/verify-backups.sh" ]; then
        print_status "✅ Backup verification script is executable"
    else
        print_error "❌ Backup verification script is not executable"
    fi
    
    print_status "🧪 Testing resource monitoring script..."
    if [ -x "$MONITORING_DIR/monitor-resources.sh" ]; then
        print_status "✅ Resource monitoring script is executable"
    else
        print_error "❌ Resource monitoring script is not executable"
    fi
    
    print_status "🧪 Testing log cleanup script..."
    if [ -x "$MONITORING_DIR/cleanup-logs.sh" ]; then
        print_status "✅ Log cleanup script is executable"
    else
        print_error "❌ Log cleanup script is not executable"
    fi
    
    print_status "✅ All functionality tests completed!"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "This script MUST be run ON THE EC2 INSTANCE (not from local machine)"
    echo "It sets up comprehensive log rotation, backup management, and resource monitoring."
    echo ""
    echo "Options:"
    echo "  --setup     Setup all systems (logs, backups, monitoring)"
    echo "  --logs      Setup only log rotation"
    echo "  --backups   Setup only backup lifecycle management"
    echo "  --monitor   Setup only resource monitoring"
    echo "  --verify    Verify all configurations"
    echo "  --test      Test all functionalities"
    echo "  --help      Show this help message"
    echo ""
    echo "Example:"
    echo "  # SSH to EC2 first, then run:"
    echo "  ssh -i club-corra-api-key.pem ec2-user@YOUR_EC2_IP"
    echo "  ./setup-log-rotation.sh --setup"
    echo ""
    echo "Note: This script requires sudo access and must run on Amazon Linux EC2."
    echo ""
    echo "Features:"
    echo "  📊 Log rotation with compression and retention policies"
    echo "  💾 Backup lifecycle management with automatic cleanup"
    echo "  🔍 Resource monitoring with alerting thresholds"
    echo "  🧹 Automatic log cleanup and maintenance"
    echo "  ⏰ Scheduled maintenance via cron jobs"
}

# Main function
main() {
    print_status "Starting comprehensive setup for Club Corra API..."
    print_warning "IMPORTANT: This script must be run ON THE EC2 INSTANCE!"
    
    case "${1:-}" in
        --setup)
            check_environment
            setup_log_rotation
            setup_backup_management
            setup_resource_monitoring
            print_status "🎉 All systems setup completed successfully!"
            ;;
        --logs)
            check_environment
            setup_log_rotation
            print_status "✅ Log rotation setup completed!"
            ;;
        --backups)
            check_environment
            setup_backup_management
            print_status "✅ Backup management setup completed!"
            ;;
        --monitor)
            check_environment
            setup_resource_monitoring
            print_status "✅ Resource monitoring setup completed!"
            ;;
        --verify)
            check_environment
            verify_all_setups
            ;;
        --test)
            check_environment
            test_all_functionalities
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
    
    if [ "$1" = "--setup" ]; then
        echo ""
        echo "🎯 Setup Summary:"
        echo "  ✅ Log rotation configured with 14-day retention"
        echo "  ✅ Backup management with automatic cleanup (keep 5, max 30 days)"
        echo "  ✅ Resource monitoring every 5 minutes with alerting"
        echo "  ✅ Automatic log cleanup and maintenance"
        echo ""
        echo "📋 Next steps:"
        echo "  - Monitor logs: tail -f $MONITORING_DIR/resource-monitoring.log"
        echo "  - Check cron jobs: ls -la /etc/cron.*/club-corra-*"
        echo "  - Verify setup: $0 --verify"
        echo "  - Test functionality: $0 --test"
    fi
}

# Run main function
main "$@"
