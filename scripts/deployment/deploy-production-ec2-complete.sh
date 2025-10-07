#!/bin/bash

# Club Corra Production Deployment Script (Complete EC2 Setup)
# This script provides a complete production deployment with HTTPS, monitoring, and security
# Optimized for t3.small instances with comprehensive setup

set -e  # Exit on any error

# Configuration
SERVICE_NAME="club-corra-api"
APP_DIR="/opt/club-corra-api"
BACKUP_DIR="/opt/club-corra-api-backup"
LOG_FILE="/var/log/club-corra-api.log"
DOMAIN="${DOMAIN:-}"  # Set via environment variable or prompt
EMAIL="${EMAIL:-}"    # Set via environment variable or prompt

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
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

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_header() {
    echo -e "${PURPLE}================================${NC}"
    echo -e "${PURPLE}$1${NC}"
    echo -e "${PURPLE}================================${NC}"
}

# Function to get user input
get_user_input() {
    local prompt="$1"
    local var_name="$2"
    local default_value="$3"
    
    if [ -z "${!var_name}" ]; then
        if [ -n "$default_value" ]; then
            read -p "$prompt [$default_value]: " input
            eval "$var_name=\${input:-$default_value}"
        else
            read -p "$prompt: " input
            eval "$var_name=\"$input\""
        fi
    else
        print_status "Using $var_name: ${!var_name}"
    fi
}

# Function to check system requirements
check_system_requirements() {
    print_header "SYSTEM REQUIREMENTS CHECK"
    
    # Check if running on Amazon Linux
    if [ ! -f /etc/os-release ] || ! grep -q "Amazon Linux" /etc/os-release; then
        print_warning "⚠️ This script is optimized for Amazon Linux. Other distributions may require modifications."
    fi
    
    # Check available disk space
    AVAILABLE_SPACE=$(df / | awk 'NR==2 {print $4}')
    AVAILABLE_GB=$((AVAILABLE_SPACE / 1024 / 1024))
    
    print_status "Available disk space: ${AVAILABLE_GB}GB"
    
    if [ "$AVAILABLE_GB" -lt 2 ]; then
        print_error "❌ Insufficient disk space (less than 2GB available)"
        print_error "Please run the disk cleanup script first:"
        print_error "  ./scripts/deployment/cleanup-disk-space.sh"
        exit 1
    fi
    
    # Check memory
    TOTAL_MEM=$(free -m | awk 'NR==2{print $2}')
    print_status "Total memory: ${TOTAL_MEM}MB"
    
    if [ "$TOTAL_MEM" -lt 1000 ]; then
        print_warning "⚠️ Low memory (${TOTAL_MEM}MB). Consider upgrading to t3.medium or larger."
    fi
    
    print_success "✅ System requirements check completed"
}

# Function to install system dependencies
install_system_dependencies() {
    print_header "INSTALLING SYSTEM DEPENDENCIES"
    
    print_status "Updating system packages..."
    sudo yum update -y
    
    print_status "Installing essential packages..."
    sudo yum install -y \
        curl \
        wget \
        git \
        unzip \
        htop \
        nginx \
        certbot \
        python3-certbot-nginx \
        postgresql15 \
        postgresql15-server \
        postgresql15-contrib
    
    print_status "Installing Node.js 20..."
    curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
    sudo yum install -y nodejs
    
    print_status "Installing Yarn..."
    sudo npm install -g yarn
    
    print_status "Installing PM2 for process management..."
    sudo npm install -g pm2
    
    print_success "✅ System dependencies installed"
}

# Function to setup PostgreSQL
setup_postgresql() {
    print_header "SETTING UP POSTGRESQL"
    
    print_status "Initializing PostgreSQL..."
    sudo /usr/pgsql-15/bin/postgresql-15-setup initdb
    
    print_status "Starting PostgreSQL service..."
    sudo systemctl enable postgresql-15
    sudo systemctl start postgresql-15
    
    print_status "Creating database and user..."
    sudo -u postgres psql << EOF
CREATE DATABASE club_corra_production;
CREATE USER clubcorra WITH ENCRYPTED PASSWORD 'your-secure-password-here';
GRANT ALL PRIVILEGES ON DATABASE club_corra_production TO clubcorra;
ALTER USER clubcorra CREATEDB;
\q
EOF
    
    print_success "✅ PostgreSQL setup completed"
    print_warning "⚠️ Remember to update the database password in your .env file"
}

# Function to setup nginx
setup_nginx() {
    print_header "SETTING UP NGINX"
    
    print_status "Creating nginx configuration..."
    sudo tee /etc/nginx/conf.d/club-corra-api.conf > /dev/null << EOF
# Rate limiting
limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;

# Upstream backend
upstream club_corra_backend {
    server 127.0.0.1:8080;
    keepalive 32;
}

# HTTP to HTTPS redirect
server {
    listen 80;
    server_name ${DOMAIN:-_};
    
    # Let's Encrypt challenge
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    # Redirect all other traffic to HTTPS
    location / {
        return 301 https://\$server_name\$request_uri;
    }
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name ${DOMAIN:-_};
    
    # SSL configuration (will be updated by certbot)
    ssl_certificate /etc/letsencrypt/live/${DOMAIN:-}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${DOMAIN:-}/privkey.pem;
    
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
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # API proxy
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        
        proxy_pass http://club_corra_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
    }
    
    # WebSocket support
    location /socket.io/ {
        proxy_pass http://club_corra_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Health check endpoint
    location /health {
        proxy_pass http://club_corra_backend/api/v1/health;
        access_log off;
    }
    
    # Static files (if any)
    location /static/ {
        alias /opt/club-corra-api/public/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF
    
    print_status "Testing nginx configuration..."
    sudo nginx -t
    
    print_status "Starting nginx..."
    sudo systemctl enable nginx
    sudo systemctl start nginx
    
    print_success "✅ Nginx setup completed"
}

# Function to setup SSL certificates
setup_ssl() {
    print_header "SETTING UP SSL CERTIFICATES"
    
    if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ]; then
        print_warning "⚠️ Domain or email not provided. Skipping SSL setup."
        print_warning "You can set up SSL later with: sudo certbot --nginx -d your-domain.com"
        return 0
    fi
    
    print_status "Obtaining SSL certificate for $DOMAIN..."
    sudo certbot --nginx -d "$DOMAIN" --email "$EMAIL" --agree-tos --non-interactive
    
    print_status "Setting up automatic renewal..."
    echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
    
    print_success "✅ SSL setup completed"
}

# Function to setup firewall
setup_firewall() {
    print_header "SETTING UP FIREWALL"
    
    print_status "Configuring firewall rules..."
    
    # Allow SSH
    sudo firewall-cmd --permanent --add-service=ssh
    
    # Allow HTTP and HTTPS
    sudo firewall-cmd --permanent --add-service=http
    sudo firewall-cmd --permanent --add-service=https
    
    # Reload firewall
    sudo firewall-cmd --reload
    
    print_success "✅ Firewall configured"
}

# Function to create environment file
create_environment_file() {
    print_header "CREATING ENVIRONMENT FILE"
    
    print_status "Creating production environment file..."
    
    # Generate a secure JWT secret
    JWT_SECRET=$(openssl rand -base64 32)
    
    sudo tee "$APP_DIR/.env" > /dev/null << EOF
# Club Corra Backend Environment Variables (Production)
NODE_ENV=production
PORT=8080
HOST=127.0.0.1

# Database Configuration
DATABASE_URL=postgresql://clubcorra:your-secure-password-here@localhost:5432/club_corra_production
DB_SSL=false

# Authentication
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=86400
BCRYPT_ROUNDS=12

# CORS Configuration
CORS_ORIGIN=https://admin.clubcorra.com,https://clubcorra.com,https://*.clubcorra.com,https://*.vercel.app

# AWS S3 Configuration (update with your values)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
S3_BUCKET_NAME=club-corra-uploads
S3_BUCKET_REGION=us-east-1

# Monitoring
LOG_LEVEL=info
SENTRY_DSN=

# Rate Limiting
RATE_LIMIT_TTL=60
RATE_LIMIT_LIMIT=100

# File Upload
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp,application/pdf

# WebSocket
WS_PORT=8081
WS_PATH=/socket.io

# Security
HTTPS_MODE=false
DEBUG=false
ENABLE_SWAGGER=false

# Health Check
HEALTH_CHECK_PATH=/api/v1/health
HEALTH_CHECK_INTERVAL=30000
EOF
    
    # Set proper permissions
    sudo chown ec2-user:ec2-user "$APP_DIR/.env"
    sudo chmod 600 "$APP_DIR/.env"
    
    print_success "✅ Environment file created"
    print_warning "⚠️ Please update the database password and AWS credentials in $APP_DIR/.env"
}

# Function to build and deploy application
build_and_deploy() {
    print_header "BUILDING AND DEPLOYING APPLICATION"
    
    # Navigate to API directory
    cd apps/api
    
    print_status "Installing dependencies..."
    yarn install --frozen-lockfile
    
    print_status "Building application..."
    yarn build
    
    print_status "Installing production dependencies..."
    yarn install --production --frozen-lockfile
    
    print_status "Creating production directory..."
    sudo mkdir -p "$APP_DIR"
    
    print_status "Copying application files..."
    sudo cp -r dist "$APP_DIR/"
    sudo cp -r node_modules "$APP_DIR/"
    sudo cp package.json "$APP_DIR/"
    
    # Set proper permissions
    sudo chown -R ec2-user:ec2-user "$APP_DIR"
    sudo chmod -R 755 "$APP_DIR"
    
    print_success "✅ Application built and deployed"
}

# Function to setup systemd service
setup_systemd_service() {
    print_header "SETTING UP SYSTEMD SERVICE"
    
    print_status "Creating systemd service file..."
    
    sudo tee /etc/systemd/system/$SERVICE_NAME.service > /dev/null << EOF
[Unit]
Description=Club Corra API Service
After=network.target postgresql-15.service nginx.service
Wants=postgresql-15.service nginx.service
StartLimitIntervalSec=0

[Service]
Type=simple
User=ec2-user
Group=ec2-user
WorkingDirectory=$APP_DIR
ExecStart=/usr/bin/node dist/main.js
ExecReload=/bin/kill -HUP \$MAINPID
Restart=always
RestartSec=10
StartLimitBurst=5
StartLimitInterval=60

# Environment
Environment=NODE_ENV=production
EnvironmentFile=$APP_DIR/.env

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
    
    print_status "Reloading systemd and enabling service..."
    sudo systemctl daemon-reload
    sudo systemctl enable $SERVICE_NAME
    
    print_success "✅ Systemd service configured"
}

# Function to run database migrations
run_migrations() {
    print_header "RUNNING DATABASE MIGRATIONS"
    
    print_status "Running database migrations..."
    cd "$APP_DIR"
    
    # Load environment variables
    set -a
    source .env
    set +a
    
    # Run migrations
    if timeout 60s node -e '
        require("reflect-metadata");
        const { DataSource } = require("typeorm");
        let config;
        try {
          ({ typeOrmConfig: config } = require("./dist/config/typeorm.config.js"));
        } catch (e) {
          console.error("Failed to load config:", e.message);
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
        print_success "✅ Database migrations completed"
    else
        print_warning "⚠️ Database migrations failed - check configuration"
    fi
}

# Function to start services
start_services() {
    print_header "STARTING SERVICES"
    
    print_status "Starting PostgreSQL..."
    sudo systemctl start postgresql-15
    
    print_status "Starting nginx..."
    sudo systemctl start nginx
    
    print_status "Starting API service..."
    sudo systemctl start $SERVICE_NAME
    
    # Wait for service to start
    sleep 5
    
    print_status "Checking service status..."
    if sudo systemctl is-active --quiet $SERVICE_NAME; then
        print_success "✅ API service started successfully"
    else
        print_error "❌ API service failed to start"
        sudo systemctl status $SERVICE_NAME --no-pager -l
        exit 1
    fi
}

# Function to verify deployment
verify_deployment() {
    print_header "VERIFYING DEPLOYMENT"
    
    print_status "Checking service status..."
    sudo systemctl status $SERVICE_NAME --no-pager -l
    
    print_status "Checking port listening..."
    netstat -tlnp | grep :8080 || echo "Port 8080 not listening"
    
    print_status "Checking nginx status..."
    sudo systemctl status nginx --no-pager -l
    
    print_status "Testing API endpoint..."
    if curl -f -s "http://localhost:8080/api/v1/health" > /dev/null; then
        print_success "✅ API health check passed"
    else
        print_warning "⚠️ API health check failed"
    fi
    
    if [ -n "$DOMAIN" ]; then
        print_status "Testing HTTPS endpoint..."
        if curl -f -s -k "https://$DOMAIN/api/v1/health" > /dev/null; then
            print_success "✅ HTTPS API health check passed"
        else
            print_warning "⚠️ HTTPS API health check failed"
        fi
    fi
}

# Function to show deployment summary
show_deployment_summary() {
    print_header "DEPLOYMENT SUMMARY"
    
    echo "🎉 Club Corra API has been successfully deployed!"
    echo ""
    echo "📊 Service Information:"
    echo "  - Service Name: $SERVICE_NAME"
    echo "  - Application Directory: $APP_DIR"
    echo "  - Logs: sudo journalctl -u $SERVICE_NAME -f"
    echo "  - Status: sudo systemctl status $SERVICE_NAME"
    echo ""
    echo "🌐 Access Information:"
    if [ -n "$DOMAIN" ]; then
        echo "  - HTTPS API: https://$DOMAIN/api/v1"
        echo "  - Health Check: https://$DOMAIN/api/v1/health"
    else
        echo "  - HTTP API: http://$(curl -s ifconfig.me):8080/api/v1"
        echo "  - Health Check: http://$(curl -s ifconfig.me):8080/api/v1/health"
    fi
    echo ""
    echo "🔧 Management Commands:"
    echo "  - Restart API: sudo systemctl restart $SERVICE_NAME"
    echo "  - Restart Nginx: sudo systemctl restart nginx"
    echo "  - View Logs: sudo journalctl -u $SERVICE_NAME -f"
    echo "  - Check Status: sudo systemctl status $SERVICE_NAME"
    echo ""
    echo "⚠️ Next Steps:"
    echo "  1. Update database password in $APP_DIR/.env"
    echo "  2. Configure AWS S3 credentials in $APP_DIR/.env"
    echo "  3. Set up your domain DNS to point to this server"
    echo "  4. Update Vercel environment variables with your API URL"
    echo "  5. Test all API endpoints"
    echo ""
    echo "📚 Documentation:"
    echo "  - Deployment Guide: scripts/deployment/README.md"
    echo "  - Environment Variables: scripts/deployment/backend.env.example"
    echo "  - Troubleshooting: scripts/deployment/TROUBLESHOOTING.md"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --domain DOMAIN    Set the domain name for SSL certificate"
    echo "  --email EMAIL      Set the email for SSL certificate"
    echo "  --help             Show this help message"
    echo ""
    echo "Environment Variables:"
    echo "  DOMAIN             Domain name for SSL certificate"
    echo "  EMAIL              Email address for SSL certificate"
    echo ""
    echo "Examples:"
    echo "  $0 --domain api.clubcorra.com --email admin@clubcorra.com"
    echo "  DOMAIN=api.clubcorra.com EMAIL=admin@clubcorra.com $0"
    echo ""
    echo "This script will:"
    echo "  1. Install system dependencies (Node.js, nginx, PostgreSQL)"
    echo "  2. Set up PostgreSQL database"
    echo "  3. Configure nginx with SSL (if domain provided)"
    echo "  4. Build and deploy the API application"
    echo "  5. Set up systemd service"
    echo "  6. Run database migrations"
    echo "  7. Start all services"
    echo "  8. Verify deployment"
}

# Main deployment function
main() {
    print_header "CLUB CORRA PRODUCTION DEPLOYMENT"
    
    # Get user input for domain and email
    get_user_input "Enter your domain name (or press Enter to skip SSL setup)" "DOMAIN" ""
    get_user_input "Enter your email address for SSL certificate" "EMAIL" ""
    
    # Run deployment steps
    check_system_requirements
    install_system_dependencies
    setup_postgresql
    setup_nginx
    setup_ssl
    setup_firewall
    create_environment_file
    build_and_deploy
    setup_systemd_service
    run_migrations
    start_services
    verify_deployment
    show_deployment_summary
}

# Handle script arguments
case "${1:-}" in
    --help|-h)
        show_usage
        exit 0
        ;;
    --domain)
        DOMAIN="$2"
        shift 2
        ;;
    --email)
        EMAIL="$2"
        shift 2
        ;;
    *)
        main
        ;;
esac

