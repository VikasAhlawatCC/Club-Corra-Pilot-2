#!/bin/bash

# Script to set up HTTPS on Club Corra Backend Server
# This script will install SSL certificates and configure the backend for HTTPS

set -e  # Exit on any error

echo "🔒 Setting up HTTPS for Club Corra Backend Server"
echo "=================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   print_error "This script must be run as root (use sudo)"
   exit 1
fi

# Get server information
print_status "Detecting server IP address..."
SERVER_IP=""
PUBLIC_IP=""

# Function to validate if IP is public (not private)
is_public_ip() {
    local ip=$1
    if [[ $ip =~ ^10\. ]] || [[ $ip =~ ^172\.(1[6-9]|2[0-9]|3[0-1])\. ]] || [[ $ip =~ ^192\.168\. ]]; then
        return 1  # Private IP
    else
        return 0  # Public IP
    fi
}

# Try multiple methods to get the PUBLIC IP address
if [ -z "$PUBLIC_IP" ]; then
    print_status "Trying AWS metadata endpoint..."
    PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null)
    if [ -n "$PUBLIC_IP" ] && is_public_ip "$PUBLIC_IP"; then
        print_status "Found public IP from AWS metadata: $PUBLIC_IP"
        SERVER_IP="$PUBLIC_IP"
    fi
fi

if [ -z "$PUBLIC_IP" ]; then
    print_status "Trying external IP detection services..."
    # Try multiple external services
    PUBLIC_IP=$(curl -s --max-time 10 https://checkip.amazonaws.com/ 2>/dev/null)
    if [ -n "$PUBLIC_IP" ] && is_public_ip "$PUBLIC_IP"; then
        print_status "Found public IP from AWS checkip: $PUBLIC_IP"
        SERVER_IP="$PUBLIC_IP"
    fi
fi

if [ -z "$PUBLIC_IP" ]; then
    print_status "Trying alternative external IP service..."
    PUBLIC_IP=$(curl -s --max-time 10 https://ipinfo.io/ip 2>/dev/null)
    if [ -n "$PUBLIC_IP" ] && is_public_ip "$PUBLIC_IP"; then
        print_status "Found public IP from ipinfo: $PUBLIC_IP"
        SERVER_IP="$PUBLIC_IP"
    fi
fi

if [ -z "$PUBLIC_IP" ]; then
    print_status "Trying one more external IP service..."
    PUBLIC_IP=$(curl -s --max-time 10 https://icanhazip.com/ 2>/dev/null)
    if [ -n "$PUBLIC_IP" ] && is_public_ip "$PUBLIC_IP"; then
        print_status "Found public IP from icanhazip: $PUBLIC_IP"
        SERVER_IP="$PUBLIC_IP"
    fi
fi

# If we still don't have a public IP, check if we have a known public IP
if [ -z "$PUBLIC_IP" ]; then
    print_warning "Could not detect public IP automatically"
    print_status "Please provide your server's public IP address:"
    read -p "Enter your server's public IP address: " MANUAL_IP
    if [ -n "$MANUAL_IP" ] && is_public_ip "$MANUAL_IP"; then
        SERVER_IP="$MANUAL_IP"
        print_success "Using manually entered public IP: $SERVER_IP"
    else
        print_error "Invalid or private IP address provided. Please ensure you enter a public IP address."
        exit 1
    fi
fi

# Validate we have a public IP
if ! is_public_ip "$SERVER_IP"; then
    print_error "Detected IP $SERVER_IP appears to be private. SSL certificates require a public IP address."
    print_error "Please ensure your server has a public IP address and try again."
    exit 1
fi

# Domain configuration options
print_status "Domain configuration options:"
echo "1. Use nip.io domain (automatic, good for testing)"
echo "2. Use custom domain (manual, required for production)"
echo ""
read -p "Choose option (1 or 2): " DOMAIN_CHOICE

case $DOMAIN_CHOICE in
    1)
        # Set domain using the public IP with nip.io
        DOMAIN_NAME="${SERVER_IP}.nip.io"
        print_status "Using nip.io domain: $DOMAIN_NAME"
        print_status "This will create a domain that resolves to your public IP: $SERVER_IP"
        print_warning "Note: nip.io domains may have limitations for production use"
        ;;
    2)
        # Use custom domain
        print_status "Please provide your custom domain:"
        read -p "Enter your domain (e.g., api.clubcorra.com): " CUSTOM_DOMAIN
        if [ -n "$CUSTOM_DOMAIN" ]; then
            DOMAIN_NAME="$CUSTOM_DOMAIN"
            print_status "Using custom domain: $DOMAIN_NAME"
            print_status "IMPORTANT: Ensure DNS A record points to $SERVER_IP before continuing"
            print_status "Press Enter when DNS is configured..."
            read
        else
            print_error "No domain provided, falling back to nip.io"
            DOMAIN_NAME="${SERVER_IP}.nip.io"
        fi
        ;;
    *)
        print_warning "Invalid choice, using nip.io domain"
        DOMAIN_NAME="${SERVER_IP}.nip.io"
        ;;
esac

# Detect OS and package manager
if command -v apt &> /dev/null; then
    PACKAGE_MANAGER="apt"
    UPDATE_CMD="apt update && apt upgrade -y"
    INSTALL_CMD="apt install -y"
    print_status "Detected Ubuntu/Debian system (using apt)"
elif command -v dnf &> /dev/null; then
    PACKAGE_MANAGER="dnf"
    UPDATE_CMD="dnf update -y"
    INSTALL_CMD="dnf install -y"
    print_status "Detected Amazon Linux 2023/RHEL 8+/Fedora system (using dnf)"
elif command -v yum &> /dev/null; then
    PACKAGE_MANAGER="yum"
    UPDATE_CMD="yum update -y"
    INSTALL_CMD="yum install -y"
    print_status "Detected Amazon Linux 2/RHEL 7/CentOS 7 system (using yum)"
else
    print_error "Unsupported package manager. This script supports apt, yum, and dnf."
    exit 1
fi

print_status "Detected server IP: $SERVER_IP"

# Update system
print_status "Updating system packages..."
eval $UPDATE_CMD

# Install required packages
print_status "Installing required packages..."
if [ "$PACKAGE_MANAGER" = "apt" ]; then
    $INSTALL_CMD certbot nginx certbot-nginx bind9-utils cron
elif [ "$PACKAGE_MANAGER" = "yum" ] || [ "$PACKAGE_MANAGER" = "dnf" ]; then
    if [ "$PACKAGE_MANAGER" = "dnf" ]; then
        print_status "Amazon Linux 2023 detected - installing packages from Amazon repositories..."
        
        # First, let's see what's available
        print_status "Checking available packages..."
        dnf list available | grep -E "(nginx|certbot)" | head -10
        
        # Install nginx (should be available in Amazon Linux 2023)
        print_status "Installing nginx..."
        $INSTALL_CMD nginx
        
        # Install certbot (should be available)
        print_status "Installing certbot..."
        $INSTALL_CMD certbot
        
        # Install DNS tools for validation
        print_status "Installing DNS tools..."
        $INSTALL_CMD bind-utils
        
        # Install cronie for crontab functionality
        print_status "Installing cronie for cron jobs..."
        $INSTALL_CMD cronie
        
        # Check if certbot-nginx plugin is available
        print_status "Checking for certbot-nginx plugin..."
        if dnf list available | grep -q "certbot-nginx"; then
            print_status "Installing certbot-nginx plugin..."
            $INSTALL_CMD certbot-nginx
        elif dnf list available | grep -q "python3-certbot-nginx"; then
            print_status "Installing python3-certbot-nginx..."
            $INSTALL_CMD python3-certbot-nginx
        else
            print_warning "certbot-nginx plugin not available, will use standalone mode for SSL certificates"
        fi
        
    elif [ "$PACKAGE_MANAGER" = "yum" ]; then
        print_status "Amazon Linux 2 detected - installing packages with EPEL..."
        $INSTALL_CMD epel-release
        $INSTALL_CMD nginx certbot python3-certbot-nginx bind-utils cronie
    fi
    
    # Start and enable nginx service
    print_status "Starting and enabling nginx service..."
    systemctl start nginx
    systemctl enable nginx
fi

# Install Yarn if not present
print_status "Installing Yarn package manager..."
if ! command -v yarn &> /dev/null; then
    if [ "$PACKAGE_MANAGER" = "apt" ]; then
        curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
        echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
        apt update
        $INSTALL_CMD yarn
    elif [ "$PACKAGE_MANAGER" = "yum" ] || [ "$PACKAGE_MANAGER" = "dnf" ]; then
        # Install Node.js first if not present
        if ! command -v node &> /dev/null; then
            print_status "Installing Node.js..."
            curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
            $INSTALL_CMD nodejs
        fi
        # Install Yarn via npm
        npm install -g yarn
    fi
    print_success "Yarn installed successfully"
else
    print_status "✓ Yarn is already installed"
fi

# Stop any existing services on ports 80 and 443
print_status "Stopping services on ports 80 and 443..."
systemctl stop nginx 2>/dev/null || true
pkill -f "node.*main" 2>/dev/null || true

# Create temporary nginx config for certbot
print_status "Creating temporary nginx configuration for SSL certificate generation..."

# Check nginx configuration directory structure
if [ -d "/etc/nginx/conf.d" ]; then
    # Amazon Linux 2023 style
    NGINX_CONF_DIR="/etc/nginx/conf.d"
    NGINX_SITES_DIR="/etc/nginx/conf.d"
    print_status "Using Amazon Linux 2023 nginx configuration structure"
else
    # Ubuntu style
    NGINX_CONF_DIR="/etc/nginx/sites-available"
    NGINX_SITES_DIR="/etc/nginx/sites-enabled"
    print_status "Using Ubuntu-style nginx configuration structure"
fi

# Create temporary config
if [ -d "$NGINX_CONF_DIR" ]; then
    cat > $NGINX_CONF_DIR/temp-ssl.conf << EOF
server {
    listen 80;
    server_name $DOMAIN_NAME;
    
    location / {
        return 200 "SSL Certificate Generation in Progress";
        add_header Content-Type text/plain;
    }
}
EOF
    print_status "Created temporary nginx config in $NGINX_CONF_DIR/temp-ssl.conf"
else
    print_error "Could not find nginx configuration directory"
    exit 1
fi

# Test nginx config
print_status "Testing nginx configuration..."
nginx -t

# Start nginx
print_status "Starting nginx for certificate generation..."
systemctl start nginx

# DNS validation for custom domains
if [[ "$DOMAIN_NAME" != *".nip.io" ]]; then
    print_status "Validating DNS configuration for $DOMAIN_NAME..."
    print_status "Checking if domain resolves to server IP $SERVER_IP..."
    
    # Wait a moment for DNS propagation
    sleep 5
    
    # Check if domain resolves to our server IP
    RESOLVED_IP=$(dig +short $DOMAIN_NAME | head -1)
    if [ "$RESOLVED_IP" = "$SERVER_IP" ]; then
        print_success "DNS validation successful: $DOMAIN_NAME resolves to $SERVER_IP"
    else
        print_warning "DNS validation warning: $DOMAIN_NAME resolves to $RESOLVED_IP, expected $SERVER_IP"
        print_status "This might cause SSL certificate generation to fail."
        print_status "Please ensure your DNS A record is properly configured."
        read -p "Press Enter to continue anyway, or Ctrl+C to abort..."
    fi
fi

# Generate SSL certificate
print_status "Generating SSL certificate for $DOMAIN_NAME..."
if certbot certonly --webroot -w /var/www/html -d $DOMAIN_NAME --non-interactive --agree-tos --email admin@clubcorra.com; then
    print_success "SSL certificate generated successfully!"
else
    print_warning "Failed to generate certificate with webroot method. Trying standalone method..."
    
    # Stop nginx to free up port 80
    systemctl stop nginx
    
    if certbot certonly --standalone -d $DOMAIN_NAME --non-interactive --agree-tos --email admin@clubcorra.com; then
        print_success "SSL certificate generated successfully with standalone method!"
    else
        print_error "Failed to generate SSL certificate. Please check your domain configuration."
        exit 1
    fi
fi

# Stop nginx after certificate generation
systemctl stop nginx

# Remove temporary nginx config
if [ -d "/etc/nginx/conf.d" ]; then
    rm -f /etc/nginx/conf.d/temp-ssl.conf
else
    rm -f /etc/nginx/sites-enabled/temp-ssl
    rm -f /etc/nginx/sites-available/temp-ssl
fi

# Create production nginx config
print_status "Creating production nginx configuration..."
if [ -d "/etc/nginx/conf.d" ]; then
    # Amazon Linux 2023 style
    cat > /etc/nginx/conf.d/club-corra-api.conf << EOF
# HTTP server - redirect to HTTPS
server {
    listen 80;
    server_name $DOMAIN_NAME;
    
    # Redirect all HTTP traffic to HTTPS
    return 301 https://\$server_name\$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name $DOMAIN_NAME;
    
    # SSL configuration
    ssl_certificate /etc/letsencrypt/live/$DOMAIN_NAME/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN_NAME/privkey.pem;
    
    # SSL security settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Proxy to Node.js backend
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # WebSocket support
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
    }
    
    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF
    print_status "Created production nginx config in /etc/nginx/conf.d/club-corra-api.conf"
else
    # Ubuntu style
    cat > /etc/nginx/sites-available/club-corra-api << EOF
# HTTP server - redirect to HTTPS
server {
    listen 80;
    server_name $DOMAIN_NAME;
    
    # Redirect all HTTP traffic to HTTPS
    return 301 https://\$server_name\$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name $DOMAIN_NAME;
    
    # SSL configuration
    ssl_certificate /etc/letsencrypt/live/$DOMAIN_NAME/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN_NAME/privkey.pem;
    
    # SSL security settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Proxy to Node.js backend
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # WebSocket support
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
    }
    
    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF
    print_status "Created production nginx config in /etc/nginx/sites-available/club-corra-api"
fi

# Enable the production site
if [ -d "/etc/nginx/conf.d" ]; then
    # Amazon Linux 2023 - config is already in conf.d, just remove default
    rm -f /etc/nginx/conf.d/default.conf 2>/dev/null || true
    print_status "Amazon Linux 2023 nginx configuration enabled"
else
    # Ubuntu style - create symlink
    ln -sf /etc/nginx/sites-available/club-corra-api /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true
    print_status "Ubuntu-style nginx configuration enabled"
fi

# Test nginx config
print_status "Testing production nginx configuration..."
nginx -t

# Start nginx
print_status "Starting nginx..."
systemctl start nginx
systemctl enable nginx

# Create systemd service for the Node.js backend
print_status "Creating systemd service for Club Corra API..."

# Detect the correct user for the service
if [ "$PACKAGE_MANAGER" = "apt" ]; then
    SERVICE_USER="ubuntu"
elif [ "$PACKAGE_MANAGER" = "yum" ] || [ "$PACKAGE_MANAGER" = "dnf" ]; then
    SERVICE_USER="ec2-user"
fi

# CRITICAL FIX: Detect API_DIR before using it
if [ -z "$API_DIR" ]; then
    print_status "Detecting API directory for systemd service..."
    if [ -d "/home/$SERVICE_USER/club-corra-api/club-corra-pilot/apps/api" ]; then
        API_DIR="/home/$SERVICE_USER/club-corra-api/club-corra-pilot/apps/api"
    elif [ -d "/home/$SERVICE_USER/club-corra-pilot/apps/api" ]; then
        API_DIR="/home/$SERVICE_USER/club-corra-pilot/apps/api"
    else
        print_error "Could not detect API directory. Please ensure the project is cloned."
        exit 1
    fi
    print_status "Using API directory: $API_DIR"
fi

cat > /etc/systemd/system/club-corra-api.service << EOF
[Unit]
Description=Club Corra API Backend
Documentation=https://github.com/VikasAhlawatCC/club-corra-pilot
After=network.target

[Service]
Type=simple
User=$SERVICE_USER
WorkingDirectory=$API_DIR
EnvironmentFile=-$API_DIR/.env.prod
Environment=NODE_ENV=production
Environment=SSL_CERT_PATH=/etc/letsencrypt/live/$DOMAIN_NAME/fullchain.pem
Environment=SSL_KEY_PATH=/etc/letsencrypt/live/$DOMAIN_NAME/privkey.pem
Environment=PORT=8080
Environment=HOST=0.0.0.0
ExecStart=/usr/bin/node dist/apps/api/src/main.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=club-corra-api

# Security settings
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ReadWritePaths=$API_DIR

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd and enable service
systemctl daemon-reload
systemctl enable club-corra-api

# Create SSL renewal script
print_status "Setting up automatic SSL renewal..."

# Ensure cron.d directory exists
if [ ! -d "/etc/cron.d" ]; then
    mkdir -p /etc/cron.d
    print_status "Created /etc/cron.d directory"
fi

# Create the renewal cron job
cat > /etc/cron.d/certbot-renew << EOF
# Renew SSL certificates twice daily
0 12 * * * root certbot renew --quiet --deploy-hook "systemctl reload nginx"
EOF

# Alternative: Also add to user's crontab as backup
print_status "Setting up backup SSL renewal in user crontab..."
if command -v crontab &> /dev/null; then
    (crontab -l 2>/dev/null; echo "0 12 * * * certbot renew --quiet --deploy-hook 'sudo systemctl reload nginx'") | crontab -
    print_success "Backup SSL renewal added to user crontab"
else
    print_warning "crontab command not found. Installing cronie package..."
    if [ "$PACKAGE_MANAGER" = "apt" ]; then
        apt install -y cron
    elif [ "$PACKAGE_MANAGER" = "yum" ] || [ "$PACKAGE_MANAGER" = "dnf" ]; then
        $INSTALL_CMD cronie
    fi
    
    # Try again after installation
    if command -v crontab &> /dev/null; then
        (crontab -l 2>/dev/null; echo "0 12 * * * certbot renew --quiet --deploy-hook 'sudo systemctl reload nginx'") | crontab -
        print_success "Backup SSL renewal added to user crontab"
    else
        print_warning "Could not install crontab. SSL renewal will only use system cron.d"
    fi
fi

# Set up logrotate for nginx
print_status "Setting up log rotation..."
cat > /etc/logrotate.d/nginx << EOF
/var/log/nginx/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 640 nginx adm
    postrotate
        if [ -f /var/run/nginx.pid ]; then
            kill -USR1 \$(cat /var/run/nginx.pid)
        fi
    endscript
}
EOF

# Create firewall rules
print_status "Setting up firewall rules..."

# Check if ufw is available, otherwise use firewalld
if command -v ufw &> /dev/null; then
    print_status "Using ufw firewall..."
    ufw allow 22/tcp    # SSH
    ufw allow 80/tcp    # HTTP
    ufw allow 443/tcp   # HTTPS
    ufw --force enable
elif command -v firewall-cmd &> /dev/null; then
    print_status "Using firewalld firewall..."
    systemctl start firewalld
    systemctl enable firewalld
    firewall-cmd --permanent --add-service=ssh
    firewall-cmd --permanent --add-service=http
    firewall-cmd --permanent --add-service=https
    firewall-cmd --reload
    print_success "Firewalld configured successfully"
else
    print_warning "No firewall detected. Please configure firewall manually:"
    print_status "  - Allow SSH (port 22)"
    print_status "  - Allow HTTP (port 80)"
    print_status "  - Allow HTTPS (port 443)"
fi

# Detect the actual project directory structure
print_status "Detecting project directory structure..."
PROJECT_DIR=""
API_DIR=""

# Debug: Show what directories exist
print_status "Checking for existing directories..."
if [ -d "/home/$SERVICE_USER/club-corra-api/club-corra-pilot" ]; then
    print_status "✓ Found: /home/$SERVICE_USER/club-corra-api/club-corra-pilot"
    if [ -d "/home/$SERVICE_USER/club-corra-api/club-corra-pilot/apps" ]; then
        print_status "✓ Found: /home/$SERVICE_USER/club-corra-api/club-corra-pilot/apps"
        if [ -d "/home/$SERVICE_USER/club-corra-api/club-corra-pilot/apps/api" ]; then
            print_status "✓ Found: /home/$SERVICE_USER/club-corra-api/club-corra-pilot/apps/api"
        else
            print_status "✗ Missing: /home/$SERVICE_USER/club-corra-api/club-corra-pilot/apps/api"
        fi
    else
        print_status "✗ Missing: /home/$SERVICE_USER/club-corra-api/club-corra-pilot/apps"
    fi
fi

if [ -d "/home/$SERVICE_USER/club-corra-pilot" ]; then
    print_status "✓ Found: /home/$SERVICE_USER/club-corra-pilot"
    if [ -d "/home/$SERVICE_USER/club-corra-pilot/apps" ]; then
        print_status "✓ Found: /home/$SERVICE_USER/club-corra-pilot/apps"
        if [ -d "/home/$SERVICE_USER/club-corra-pilot/apps/api" ]; then
            print_status "✓ Found: /home/$SERVICE_USER/club-corra-pilot/apps/api"
        else
            print_status "✗ Missing: /home/$SERVICE_USER/club-corra-pilot/apps/api"
        fi
    else
        print_status "✗ Missing: /home/$SERVICE_USER/club-corra-pilot/apps"
    fi
fi

# Check if we need to clone the repository
if [ ! -d "/home/$SERVICE_USER/club-corra-pilot" ] && [ ! -d "/home/$SERVICE_USER/club-corra-api/club-corra-pilot" ]; then
    print_status "No project directory found. Would you like to clone the repository?"
    read -p "Clone repository? (y/n): " CLONE_REPO
    if [[ $CLONE_REPO =~ ^[Yy]$ ]]; then
        print_status "Cloning repository..."
        cd /home/$SERVICE_USER
        if [ -d "club-corra-api" ]; then
            cd club-corra-api
        fi
        git clone https://github.com/vikasahlawat/club-corra-pilot.git
        print_success "Repository cloned successfully"
    fi
fi

# Try to find the project directory
if [ -d "/home/$SERVICE_USER/club-corra-api/club-corra-pilot/apps/api" ]; then
    PROJECT_DIR="/home/$SERVICE_USER/club-corra-api/club-corra-pilot"
    API_DIR="/home/$SERVICE_USER/club-corra-api/club-corra-pilot/apps/api"
    print_status "Found project at: $PROJECT_DIR (API directory exists)"
elif [ -d "/home/$SERVICE_USER/club-corra-pilot/apps/api" ]; then
    PROJECT_DIR="/home/$SERVICE_USER/club-corra-pilot"
    API_DIR="/home/$SERVICE_USER/club-corra-pilot/apps/api"
    print_status "Found project at: $PROJECT_DIR (API directory exists)"
elif [ -d "/home/$SERVICE_USER/club-corra-api/club-corra-pilot" ]; then
    # Check if apps/api exists in this directory
    if [ -d "/home/$SERVICE_USER/club-corra-api/club-corra-pilot/apps" ]; then
        PROJECT_DIR="/home/$SERVICE_USER/club-corra-api/club-corra-pilot"
        API_DIR="/home/$SERVICE_USER/club-corra-api/club-corra-pilot/apps/api"
        print_status "Found project at: $PROJECT_DIR (checking API structure)"
    else
        PROJECT_DIR="/home/$SERVICE_USER/club-corra-api/club-corra-pilot"
        API_DIR="/home/$SERVICE_USER/club-corra-api/club-corra-pilot/apps/api"
        print_status "Found project at: $PROJECT_DIR (creating API structure)"
    fi
elif [ -d "/home/$SERVICE_USER/club-corra-pilot" ]; then
    PROJECT_DIR="/home/$SERVICE_USER/club-corra-pilot"
    API_DIR="/home/$SERVICE_USER/club-corra-pilot/apps/api"
    print_status "Found project at: $PROJECT_DIR (checking API structure)"
else
    print_warning "Could not find project directory automatically"
    print_status "Please provide the path to your project directory:"
    read -p "Enter project path (e.g., /home/$SERVICE_USER/club-corra-api/club-corra-pilot): " MANUAL_PROJECT_DIR
    if [ -n "$MANUAL_PROJECT_DIR" ]; then
        PROJECT_DIR="$MANUAL_PROJECT_DIR"
        API_DIR="$MANUAL_PROJECT_DIR/apps/api"
        print_success "Using manually entered project path: $PROJECT_DIR"
    else
        print_error "Invalid project path"
        exit 1
    fi
fi

# Verify API directory exists and create if necessary
if [ ! -d "$API_DIR" ]; then
    print_status "Creating API directory structure: $API_DIR"
    mkdir -p "$API_DIR"
else
    print_status "API directory already exists: $API_DIR"
    # Check if it's a complete API directory
    if [ -f "$API_DIR/package.json" ] && [ -d "$API_DIR/src" ]; then
        print_status "✓ API directory appears to be complete (has package.json and src/)"
    else
        print_status "⚠ API directory exists but may be incomplete"
    fi
fi

# Create basic package.json if it doesn't exist
if [ ! -f "$API_DIR/package.json" ]; then
    print_status "Creating basic package.json for API"
    cat > "$API_DIR/package.json" << 'PKGEOF'
{
  "name": "club-corra-api",
  "version": "1.0.0",
  "description": "Club Corra API Backend",
      "main": "dist/src/main.js",
  "scripts": {
    "build": "tsc",
    "start": "node dist/src/main.js",
    "start:dev": "ts-node src/main.ts"
  },
  "dependencies": {
    "@nestjs/core": "^10.0.0",
    "@nestjs/common": "^10.0.0",
    "@nestjs/platform-express": "^10.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "ts-node": "^10.9.0"
  }
}
PKGEOF
    print_success "Created package.json"
fi

# Create basic source structure if it doesn't exist
if [ ! -d "$API_DIR/src" ]; then
    print_status "Creating basic source structure"
    mkdir -p "$API_DIR/src"
    
    # Create a basic main.ts file
    cat > "$API_DIR/src/main.ts" << 'MAINEOF'
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT || 8080);
}
bootstrap();
MAINEOF

    # Create a basic app.module.ts
    cat > "$API_DIR/src/app.module.ts" << 'MODULEEOF'
import { Module } from '@nestjs/common';

@Module({
  imports: [],
  controllers: [],
  providers: [],
})
export class AppModule {}
MODULEEOF

    # Create tsconfig.json
    cat > "$API_DIR/tsconfig.json" << 'TSCONFIGEOF'
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2020",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true
  }
}
TSCONFIGEOF

    chown -R $SERVICE_USER:$SERVICE_USER "$API_DIR"
    print_success "Basic source structure created"
fi

# Set proper ownership for the API directory
print_status "Setting proper ownership for API directory..."
chown -R $SERVICE_USER:$SERVICE_USER "$API_DIR"
print_success "Ownership set successfully"

# Install dependencies if needed
if [ -f "$API_DIR/package.json" ]; then
    # First, build the shared package
    if [ -d "$PROJECT_DIR/packages/shared" ]; then
        print_status "Building shared package first..."
        su - $SERVICE_USER -c "cd $PROJECT_DIR/packages/shared && yarn build"
        print_success "Shared package built successfully"
    fi
    
    if [ ! -d "$API_DIR/node_modules" ]; then
        print_status "Installing Node.js dependencies with Yarn..."
        cd "$API_DIR"
        su - $SERVICE_USER -c "cd $API_DIR && yarn install"
        print_success "Dependencies installed successfully"
    else
        print_status "✓ Dependencies already installed (node_modules exists)"
    fi
    
    # Build the project if needed
    if [ ! -d "$API_DIR/dist" ]; then
        print_status "Building the project..."
        su - $SERVICE_USER -c "cd $API_DIR && yarn build"
        print_success "Project built successfully"
    else
        print_status "✓ Project already built (dist directory exists)"
    fi
else
    print_warning "No package.json found in API directory. Skipping dependency installation and build."
fi

# Create environment file
print_status "Creating environment file at: $API_DIR/.env.prod"
cat > "$API_DIR/.env.prod" << EOF
# Club Corra API Environment Configuration
NODE_ENV=production
PORT=8080
HOST=0.0.0.0

# SSL Configuration
SSL_CERT_PATH=/etc/letsencrypt/live/$DOMAIN_NAME/fullchain.pem
SSL_KEY_PATH=/etc/letsencrypt/live/$DOMAIN_NAME/privkey.pem

# Database
DATABASE_URL=postgresql://ccdb_ixu6_user:iBp1hVVJ9LdO6NGrEKzr5PNIUK0n3lBy@dpg-d2j02b2li9vc73dpd19g-a.oregon-postgres.render.com/ccdb_ixu6?sslmode=require

# CORS for production domains (including Vercel)
CORS_ORIGIN=https://club-corra-pilot-admin.vercel.app,https://club-corra-pilot-admin-git-master-vikas-ahlawats-projects.vercel.app,https://club-corra-pilot-admin-d8hqxkw2x-vikas-ahlawats-projects.vercel.app,https://*.vercel.app,https://admin.clubcorra.com,https://clubcorra.com,https://*.clubcorra.com

# CORS_DISABLE=true

# Sentry (Recommended for production)
SENTRY_DSN=YOUR_SENTRY_DSN

# Rate Limiting (More restrictive for production)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# JWT
JWT_SECRET=50b7a8cc31ec6572a3d2b5a859b80749a0fa077e6cddf9315498b037cf6f97b670ce28b03cb6a26319856e9f49ca2729a99812171c2ff2605407a0d537712b58
JWT_REFRESH_SECRET=8b0a86f6d5dfd1c9f1273f74b6624531e19c4635c890b4e97c14b216eae67cf63cf2552147e486dd65f0aed44d637ca5bfe31799c5dae9631cf7c72c87c01920

# Twilio (for SMS)
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_PHONE_NUMBER=your_twilio_phone_number_here

# SMTP (for emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=vikasahlawat228@gmail.com
SMTP_PASS=Vicky@0910
SMTP_FROM_EMAIL=v.ahlawat@clubcorra.com

# Google OAuth
GOOGLE_CLIENT_ID=1001053464584-9kpabid1vko6prnpugilbjru60cvjlrb.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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

# S3 Configuration
S3_BUCKET=your_s3_bucket_name_here
S3_REGION=your_s3_region_here
S3_ACCESS_KEY_ID=your_s3_access_key_id_here
S3_SECRET_ACCESS_KEY=your_s3_secret_access_key_here

# CDN Configuration
CLOUDFRONT_URL=https://d3apij49dzeclm.cloudfront.net

# Security Headers
HELMET_ENABLED=true
RATE_LIMIT_ENABLED=true

# Logging
LOG_LEVEL=info
EOF

# Set proper permissions
chown $SERVICE_USER:$SERVICE_USER "$API_DIR/.env.prod"
chmod 600 "$API_DIR/.env.prod"

# Create deployment script
print_status "Creating deployment script..."
cat > /home/$SERVICE_USER/deploy-api.sh << EOF
#!/bin/bash
set -e

echo "🚀 Deploying Club Corra API..."

# Navigate to project directory
cd "$API_DIR"

# Pull latest changes from stage branch
git pull origin stage

# Install dependencies
yarn install

# Build the application
yarn build

# Copy environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "📋 Copying production environment file..."
    cp .env.prod .env
fi

# Restart the service
sudo systemctl restart club-corra-api

echo "✅ Deployment completed successfully!"
echo "🔍 Check service status: sudo systemctl status club-corra-api"
echo "📊 Check logs: sudo journalctl -u club-corra-api -f"
EOF

chmod +x /home/$SERVICE_USER/deploy-api.sh

# Final status check
print_status "Performing final status check..."

# Check nginx status
if systemctl is-active --quiet nginx; then
    print_success "Nginx is running"
else
    print_error "Nginx is not running"
fi

# Check SSL certificate
if [ -f "/etc/letsencrypt/live/$DOMAIN_NAME/fullchain.pem" ]; then
    print_success "SSL certificate is installed"
    print_status "Certificate expires: $(openssl x509 -in /etc/letsencrypt/live/$DOMAIN_NAME/fullchain.pem -text -noout | grep 'Not After' | cut -d: -f2-)"
else
    print_error "SSL certificate not found"
fi

# Check firewall
if command -v ufw &> /dev/null && ufw status | grep -q "Status: active"; then
    print_success "ufw firewall is active"
elif command -v firewall-cmd &> /dev/null && firewall-cmd --state | grep -q "running"; then
    print_success "firewalld firewall is active"
else
    print_warning "Firewall status could not be determined"
fi

echo ""
echo "🎉 HTTPS setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "   1. Update your Vercel environment variables:"
echo "      NEXT_PUBLIC_API_BASE_URL=https://$DOMAIN_NAME/api/v1"
echo "      NEXT_PUBLIC_WS_URL=wss://$DOMAIN_NAME"
echo ""
echo "   2. Deploy your updated backend:"
echo "      cd $API_DIR"
echo "      yarn build"
echo "      sudo systemctl start club-corra-api"
echo ""
echo "   3. Test the HTTPS endpoint:"
echo "      curl -k https://$DOMAIN_NAME/api/v1/health"
echo ""
echo "   4. Monitor the service:"
echo "      sudo systemctl status club-corra-api"
echo "      sudo journalctl -u club-corra-api -f"
echo ""
echo "🔒 Your backend is now configured for HTTPS!"
echo "🌐 Access your API at: https://$DOMAIN_NAME/api/v1"
echo "📚 Health check: https://$DOMAIN_NAME/api/v1/health"
echo "📋 Environment file created at: $API_DIR/.env.prod"
echo "📁 Project directory detected at: $PROJECT_DIR"

# Exit successfully
exit 0
