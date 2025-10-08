#!/bin/bash

# HTTPS Setup Script for Club Corra API on EC2
# Based on the old repository's setup-https-backend.sh
# Run this script directly on your EC2 instance
# Usage: ./setup-https-ec2.sh

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

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   print_error "This script must be run as root (use sudo)"
   exit 1
fi

print_step "Setting up HTTPS for Club Corra Backend Server"

# Get server IP address
print_status "Detecting server IP address..."
SERVER_IP=""

# Try AWS metadata first
if [ -z "$SERVER_IP" ]; then
    print_status "Trying AWS metadata endpoint..."
    SERVER_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null)
    if [ -n "$SERVER_IP" ]; then
        print_status "Found public IP from AWS metadata: $SERVER_IP"
    fi
fi

# Try external services
if [ -z "$SERVER_IP" ]; then
    print_status "Trying external IP detection services..."
    SERVER_IP=$(curl -s --max-time 10 https://checkip.amazonaws.com/ 2>/dev/null)
    if [ -n "$SERVER_IP" ]; then
        print_status "Found public IP from AWS checkip: $SERVER_IP"
    fi
fi

if [ -z "$SERVER_IP" ]; then
    print_status "Trying alternative external IP service..."
    SERVER_IP=$(curl -s --max-time 10 https://ipinfo.io/ip 2>/dev/null)
    if [ -n "$SERVER_IP" ]; then
        print_status "Found public IP from ipinfo: $SERVER_IP"
    fi
fi

if [ -z "$SERVER_IP" ]; then
    print_warning "Could not detect public IP automatically"
    print_status "Please provide your server's public IP address:"
    read -p "Enter your server's public IP address: " MANUAL_IP
    if [ -n "$MANUAL_IP" ]; then
        SERVER_IP="$MANUAL_IP"
        print_success "Using manually entered public IP: $SERVER_IP"
    else
        print_error "No IP address provided"
        exit 1
    fi
fi

print_status "Detected server IP: $SERVER_IP"

# Domain configuration
print_status "Domain configuration options:"
echo "1. Use nip.io domain (automatic, good for testing)"
echo "2. Use custom domain (manual, required for production)"
echo ""
read -p "Choose option (1 or 2): " DOMAIN_CHOICE

case $DOMAIN_CHOICE in
    1)
        DOMAIN_NAME="${SERVER_IP}.nip.io"
        print_status "Using nip.io domain: $DOMAIN_NAME"
        print_warning "Note: nip.io domains may have limitations for production use"
        ;;
    2)
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

print_status "Using domain: $DOMAIN_NAME"

# Install required packages
print_status "Installing required packages..."
dnf install -y certbot python3-certbot-nginx bind-utils cronie

# Start and enable services
print_status "Starting required services..."
systemctl start nginx
systemctl enable nginx
systemctl start crond
systemctl enable crond

# Stop any existing services on ports 80 and 443
print_status "Stopping services on ports 80 and 443..."
systemctl stop nginx 2>/dev/null || true

# Create temporary nginx config for certbot
print_status "Creating temporary nginx configuration for SSL certificate generation..."

cat > /etc/nginx/conf.d/temp-ssl.conf << EOF
server {
    listen 80;
    server_name $DOMAIN_NAME;
    
    location / {
        return 200 "SSL Certificate Generation in Progress";
        add_header Content-Type text/plain;
    }
}
EOF

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
rm -f /etc/nginx/conf.d/temp-ssl.conf

# Create production nginx config
print_status "Creating production nginx configuration..."

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

# Remove default nginx config
rm -f /etc/nginx/conf.d/default.conf 2>/dev/null || true

# Test nginx config
print_status "Testing production nginx configuration..."
nginx -t

# Start nginx
print_status "Starting nginx..."
systemctl start nginx
systemctl enable nginx

# Update API environment for HTTPS
print_status "Updating API environment for HTTPS..."

# Find the API directory
API_DIR=""
if [ -d "/home/ec2-user/club-corra-api/Club-Corra-Pilot-2/apps/api" ]; then
    API_DIR="/home/ec2-user/club-corra-api/Club-Corra-Pilot-2/apps/api"
elif [ -d "/home/ec2-user/Club-Corra-Pilot-2/apps/api" ]; then
    API_DIR="/home/ec2-user/Club-Corra-Pilot-2/apps/api"
else
    print_warning "Could not find API directory automatically"
    read -p "Enter the path to your API directory: " MANUAL_API_DIR
    if [ -n "$MANUAL_API_DIR" ] && [ -d "$MANUAL_API_DIR" ]; then
        API_DIR="$MANUAL_API_DIR"
    else
        print_error "Invalid API directory path"
        exit 1
    fi
fi

print_status "Using API directory: $API_DIR"

# Update environment file for HTTPS
if [ -f "$API_DIR/.env.production" ]; then
    print_status "Updating environment file for HTTPS..."
    
    # Update HTTPS settings
    sed -i 's/HTTPS_MODE=false/HTTPS_MODE=true/' "$API_DIR/.env.production"
    sed -i 's/HOST=127.0.0.1/HOST=127.0.0.1/' "$API_DIR/.env.production"
    
    # Add SSL domain
    if ! grep -q "SSL_DOMAIN=" "$API_DIR/.env.production"; then
        echo "SSL_DOMAIN=\"$DOMAIN_NAME\"" >> "$API_DIR/.env.production"
    else
        sed -i "s/SSL_DOMAIN=.*/SSL_DOMAIN=\"$DOMAIN_NAME\"/" "$API_DIR/.env.production"
    fi
    
    # Update SSL certificate paths
    sed -i "s|SSL_CERT_PATH=.*|SSL_CERT_PATH=/etc/letsencrypt/live/$DOMAIN_NAME/fullchain.pem|" "$API_DIR/.env.production"
    sed -i "s|SSL_KEY_PATH=.*|SSL_KEY_PATH=/etc/letsencrypt/live/$DOMAIN_NAME/privkey.pem|" "$API_DIR/.env.production"
    
    print_success "Environment file updated for HTTPS"
else
    print_warning "Environment file not found at $API_DIR/.env.production"
fi

# Update systemd service for HTTPS
print_status "Updating systemd service for HTTPS..."

# Update the service file
sed -i "s|EnvironmentFile=.*|EnvironmentFile=$API_DIR/.env.production|" /etc/systemd/system/club-corra-api.service

# Reload systemd and restart service
systemctl daemon-reload
systemctl restart club-corra-api

# Set up SSL renewal
print_status "Setting up automatic SSL renewal..."

# Create renewal cron job
cat > /etc/cron.d/certbot-renew << EOF
# Renew SSL certificates twice daily
0 12 * * * root certbot renew --quiet --deploy-hook "systemctl reload nginx"
EOF

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

# Set up firewall
print_status "Setting up firewall rules..."
if command -v firewall-cmd &> /dev/null; then
    systemctl start firewalld
    systemctl enable firewalld
    firewall-cmd --permanent --add-service=ssh
    firewall-cmd --permanent --add-service=http
    firewall-cmd --permanent --add-service=https
    firewall-cmd --reload
    print_success "Firewalld configured successfully"
else
    print_warning "Firewalld not available. Please configure firewall manually:"
    print_status "  - Allow SSH (port 22)"
    print_status "  - Allow HTTP (port 80)"
    print_status "  - Allow HTTPS (port 443)"
fi

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

# Check API service
if systemctl is-active --quiet club-corra-api; then
    print_success "API service is running"
else
    print_warning "API service is not running"
fi

echo ""
echo "🎉 HTTPS setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "   1. Update your Vercel environment variables:"
echo "      NEXT_PUBLIC_API_BASE_URL=https://$DOMAIN_NAME/api/v1"
echo "      NEXT_PUBLIC_WS_URL=wss://$DOMAIN_NAME"
echo ""
echo "   2. Test the HTTPS endpoint:"
echo "      curl -k https://$DOMAIN_NAME/api/v1/health"
echo ""
echo "   3. Monitor the service:"
echo "      systemctl status club-corra-api"
echo "      journalctl -u club-corra-api -f"
echo ""
echo "🔒 Your backend is now configured for HTTPS!"
echo "🌐 Access your API at: https://$DOMAIN_NAME/api/v1"
echo "📚 Health check: https://$DOMAIN_NAME/api/v1/health"
echo "📋 Environment file updated at: $API_DIR/.env.production"

# Exit successfully
exit 0
