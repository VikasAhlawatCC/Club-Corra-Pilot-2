#!/bin/bash

# Club Corra Backend Monitoring Script
# Monitors service health, logs, and performance

set -e

# Configuration
SERVER_USER="ec2-user"
SERVER_HOST="16.170.179.71.nip.io"
API_PORT="8080"
HEALTH_ENDPOINT="https://$SERVER_HOST/api/v1/health"

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

# Function to check service status
check_service_status() {
    print_step "Checking systemd service status..."
    
    ssh -i club-corra-api-key.pem "$SERVER_USER@16.170.179.71" << 'EOF'
        echo "=== Service Status ==="
        sudo systemctl status club-corra-api --no-pager -l
        
        echo -e "\n=== Service Enabled ==="
        sudo systemctl is-enabled club-corra-api
        
        echo -e "\n=== Service Active ==="
        sudo systemctl is-active club-corra-api
EOF
}

# Function to check process status
check_process_status() {
    print_step "Checking process status..."
    
    ssh -i club-corra-api-key.pem "$SERVER_USER@16.170.179.71" << 'EOF'
        echo "=== Node.js Processes ==="
        ps aux | grep "node.*dist/main.js" | grep -v grep || echo "No Node.js process found"
        
        echo -e "\n=== Port Listening ==="
        netstat -tlnp | grep :8080 || echo "Port 8080 not listening"
        
        echo -e "\n=== Memory Usage ==="
        free -h
        
        echo -e "\n=== Disk Usage ==="
        df -h
EOF
}

# Function to check API health
check_api_health() {
    print_step "Checking API health endpoint..."
    
    if command -v curl >/dev/null 2>&1; then
        if curl -f -s "$HEALTH_ENDPOINT" > /dev/null; then
            print_status "Health check passed - API is responding"
            
            # Get detailed health info
            echo "=== Detailed Health Check ==="
            curl -s "$HEALTH_ENDPOINT" | jq '.' 2>/dev/null || curl -s "$HEALTH_ENDPOINT"
        else
            print_error "Health check failed - API is not responding"
        fi
    else
        print_warning "curl not available - skipping API health check"
    fi
}

# Function to check logs
check_logs() {
    print_step "Checking recent logs..."
    
    ssh -i club-corra-api-key.pem "$SERVER_USER@16.170.179.71" << 'EOF'
        echo "=== Recent Service Logs (last 20 lines) ==="
        sudo journalctl -u club-corra-api -n 20 --no-pager
        
        echo -e "\n=== Error Logs (last 10 lines) ==="
        sudo journalctl -u club-corra-api -p err -n 10 --no-pager
        
        echo -e "\n=== Warning Logs (last 10 lines) ==="
        sudo journalctl -u club-corra-api -p warning -n 10 --no-pager
EOF
}

# Function to check performance metrics
check_performance() {
    print_step "Checking performance metrics..."
    
    ssh -i club-corra-api-key.pem "$SERVER_USER@16.170.179.71" << 'EOF'
        echo "=== CPU Usage ==="
        top -bn1 | grep "Cpu(s)" | awk '{print $2}' | awk -F'%' '{print $1}'
        
        echo -e "\n=== Memory Usage by Node.js ==="
        ps aux | grep "node.*dist/main.js" | grep -v grep | awk '{print $6}' | numfmt --to=iec || echo "No Node.js process found"
        
        echo -e "\n=== Open File Descriptors ==="
        lsof -p $(pgrep -f "node.*dist/main.js") 2>/dev/null | echo "No Node.js process found"
        
        echo -e "\n=== Network Connections ==="
        netstat -an | grep :8080 | wc -l
EOF
}

# Function to check environment
check_environment() {
    print_step "Checking environment configuration..."
    
    ssh -i club-corra-api-key.pem "$SERVER_USER@16.170.179.71" << 'EOF'
        echo "=== Environment Variables ==="
        sudo cat /opt/club-corra-api/.env.production 2>/dev/null || echo "No .env.production file found"
        
        echo -e "\n=== Node.js Version ==="
        /usr/bin/node --version
        
        echo -e "\n=== Working Directory ==="
        ls -la /opt/club-corra-api/
        
        echo -e "\n=== Package.json ==="
        cat /opt/club-corra-api/package.json | grep -E '"name"|"version"|"scripts"'
EOF
}

# Function to restart service if needed
restart_service() {
    print_step "Restarting service..."
    
    ssh -i club-corra-api-key.pem "$SERVER_USER@16.170.179.71" << 'EOF'
        echo "Restarting club-corra-api service..."
        sudo systemctl restart club-corra-api
        
        echo "Waiting for service to start..."
        sleep 5
        
        echo "Checking service status..."
        sudo systemctl status club-corra-api --no-pager -l
EOF
}

# Function to show real-time logs
show_realtime_logs() {
    print_step "Showing real-time logs (Ctrl+C to stop)..."
    
    ssh -i club-corra-api-key.pem "$SERVER_USER@16.170.179.71" << 'EOF'
        sudo journalctl -u club-corra-api -f
EOF
}

# Main monitoring function
main() {
    print_status "Starting backend monitoring for $SERVER_HOST (EC2: 16.170.179.71)..."
    
    case "${1:-}" in
        --status)
            check_service_status
            ;;
        --process)
            check_process_status
            ;;
        --health)
            check_api_health
            ;;
        --logs)
            check_logs
            ;;
        --performance)
            check_performance
            ;;
        --environment)
            check_environment
            ;;
        --restart)
            restart_service
            ;;
        --follow)
            show_realtime_logs
            ;;
        --all)
            check_service_status
            echo
            check_process_status
            echo
            check_api_health
            echo
            check_logs
            echo
            check_performance
            echo
            check_environment
            ;;
        --help|-h)
            echo "Usage: $0 [OPTION]"
            echo "Options:"
            echo "  --status      Check systemd service status"
            echo "  --process     Check process and port status"
            echo "  --health      Check API health endpoint"
            echo "  --logs        Check recent logs"
            echo "  --performance Check performance metrics"
            echo "  --environment Check environment configuration"
            echo "  --restart     Restart the service"
            echo "  --follow      Show real-time logs"
            echo "  --all         Run all checks"
            echo "  --help        Show this help message"
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
