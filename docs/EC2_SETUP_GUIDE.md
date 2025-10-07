# Complete EC2 Setup Guide for Club Corra Backend

## Overview
This guide will walk you through setting up a new t3.small EC2 instance for your Club Corra backend with Elastic IP address `16.170.179.71`.

## Prerequisites
- AWS Account with EC2 access
- AWS CLI configured (optional but recommended)
- SSH client installed on your local machine
- Basic knowledge of Linux commands

---

## Step 1: Create EC2 Instance

### 1.1 Launch EC2 Instance
1. **Login to AWS Console**
   - Go to [AWS Console](https://console.aws.amazon.com)
   - Navigate to EC2 service

2. **Launch Instance**
   - Click "Launch Instance"
   - Name: `club-corra-backend`

3. **Choose AMI**
   - Select "Amazon Linux 2023" (recommended)
   - Architecture: x86_64

4. **Instance Type**
   - Select `t3.small`
   - vCPUs: 2, Memory: 2 GiB
   - Network performance: Up to 5 Gigabit

5. **Key Pair**
   - Create new key pair or use existing
   - Name: `club-corra-api-key`
   - Key pair type: RSA
   - Private key file format: .pem
   - **Download the .pem file and save it securely**

6. **Network Settings**
   - VPC: Default VPC (or your preferred VPC)
   - Subnet: Public subnet
   - Auto-assign public IP: Enable
   - Security group: Create new security group

### 1.2 Configure Security Group
Create a new security group with these rules:

**Inbound Rules:**
```
Type: SSH
Protocol: TCP
Port: 22
Source: Your IP address (0.0.0.0/0 for testing, restrict later)

Type: Custom TCP
Protocol: TCP
Port: 3000
Source: 0.0.0.0/0
Description: API Backend

Type: Custom TCP
Protocol: TCP
Port: 8080
Source: 0.0.0.0/0
Description: API Backend (Alternative)

Type: HTTP
Protocol: TCP
Port: 80
Source: 0.0.0.0/0
Description: HTTP

Type: HTTPS
Protocol: TCP
Port: 443
Source: 0.0.0.0/0
Description: HTTPS
```

**Outbound Rules:**
```
Type: All traffic
Protocol: All
Port: All
Destination: 0.0.0.0/0
```

### 1.3 Storage Configuration
- Root volume: 20 GiB (gp3)
- Add additional storage if needed

### 1.4 Launch Instance
- Review all settings
- Click "Launch Instance"
- Wait for instance to reach "Running" state

---

## Step 2: Associate Elastic IP

### 2.1 Allocate Elastic IP (if not already done)
1. Go to EC2 → Network & Security → Elastic IPs
2. Click "Allocate Elastic IP address"
3. Choose "Amazon's pool of IPv4 addresses"
4. Click "Allocate"

### 2.2 Associate Elastic IP
1. Select your Elastic IP: `16.170.179.71`
2. Click "Actions" → "Associate Elastic IP address"
3. Resource type: Instance
4. Instance: Select your new EC2 instance
5. Private IP address: Auto-assign
6. Click "Associate"

---

## Step 3: Download and Configure SSH Key

### 3.1 Download .pem File
1. Go to EC2 → Key Pairs
2. Find your key pair: `club-corra-api-key`
3. Click "Actions" → "Download"
4. Save to your local machine (e.g., `~/Downloads/club-corra-api-key.pem`)

### 3.2 Set Correct Permissions
```bash
# Navigate to where you saved the .pem file
cd ~/Downloads

# Set correct permissions (CRITICAL)
chmod 400 club-corra-api-key.pem

# Verify permissions
ls -la club-corra-api-key.pem
# Should show: -r--------
```

### 3.3 Test SSH Connection
```bash
# Test connection to your instance
ssh -i club-corra-api-key.pem ec2-user@16.170.179.71

# If connection fails, try with verbose output
ssh -v -i club-corra-api-key.pem ec2-user@16.170.179.71
```

---

## Step 4: Initial Server Setup

### 4.1 Connect to Instance
```bash
ssh -i club-corra-api-key.pem ec2-user@16.170.179.71
```

### 4.2 Update System
```bash
# Update package manager
sudo dnf update -y

# Install essential packages
sudo dnf install -y git curl wget unzip
```

### 4.3 Install Node.js 20
```bash
# Install Node.js 20 from NodeSource
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo dnf install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version
```

### 4.4 Install Yarn
```bash
# Install Yarn globally
sudo npm install -g yarn

# Verify installation
yarn --version
```

### 4.5 Install Additional Tools
```bash
# Install build tools
sudo dnf groupinstall -y "Development Tools"

# Install PostgreSQL client (if needed)
sudo dnf install -y postgresql15

# Install nginx (for reverse proxy)
sudo dnf install -y nginx

# Install PM2 (process manager)
sudo npm install -g pm2
```

---

## Step 5: Clone and Setup Backend

### 5.1 Clone Repository
```bash
# Create project directory
mkdir -p ~/club-corra-api
cd ~/club-corra-api

# Clone your repository
git clone https://github.com/your-username/club-corra-pilot.git
cd club-corra-pilot

# Or if using SSH
git clone git@github.com:your-username/club-corra-pilot.git
cd club-corra-pilot
```

### 5.2 Install Dependencies
```bash
# Install root dependencies
yarn install

# Build shared package first
yarn workspace @club-corra/shared build

# Build API
yarn workspace @club-corra/api build
```

### 5.3 Create Environment File
```bash
# Copy environment template
cp scripts/deployment/backend.env.example apps/api/.env.production

# Edit environment file
nano apps/api/.env.production
```

**Configure these essential variables:**
```bash
NODE_ENV=production
PORT=8080
HOST=127.0.0.1
DATABASE_URL=postgresql://username:password@hostname:5432/database_name
JWT_SECRET=your-super-secure-jwt-secret-key-here
CORS_ORIGIN=https://admin.clubcorra.com,https://clubcorra.com,https://*.clubcorra.com,https://*.vercel.app
```

---

## Step 6: Deploy Backend

### 6.1 Run Deployment Script
```bash
# Make deployment script executable
chmod +x scripts/deployment/deploy-production-ec2.sh

# Run deployment
./scripts/deployment/deploy-production-ec2.sh
```

### 6.2 Alternative Manual Deployment
If the script fails, follow these manual steps:

```bash
# Stop any existing services
sudo systemctl stop club-corra-api || true

# Create production directory
sudo mkdir -p /opt/club-corra-api

# Copy built application
sudo cp -r apps/api/dist /opt/club-corra-api/
sudo cp apps/api/package.json /opt/club-corra-api/
sudo cp apps/api/.env.production /opt/club-corra-api/.env

# Copy workspace structure
sudo cp -r packages /opt/club-corra-api/

# Set permissions
sudo chown -R ec2-user:ec2-user /opt/club-corra-api
sudo chmod -R 755 /opt/club-corra-api

# Install production dependencies
cd /opt/club-corra-api
yarn install --production
```

---

## Step 7: Setup Systemd Service

### 7.1 Create Service File
```bash
sudo nano /etc/systemd/system/club-corra-api.service
```

**Add this content:**
```ini
[Unit]
Description=Club Corra API Service
After=network.target
Wants=network.target

[Service]
Type=simple
User=ec2-user
Group=ec2-user
WorkingDirectory=/opt/club-corra-api
ExecStart=/usr/bin/node dist/apps/api/src/main.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=8080
Environment=HOST=127.0.0.1
EnvironmentFile=/opt/club-corra-api/.env

# Logging
StandardOutput=journal
StandardError=journal
SyslogIdentifier=club-corra-api

# Security
NoNewPrivileges=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

### 7.2 Enable and Start Service
```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable service
sudo systemctl enable club-corra-api

# Start service
sudo systemctl start club-corra-api

# Check status
sudo systemctl status club-corra-api
```

---

## Step 8: Setup Nginx Reverse Proxy

### 8.1 Configure Nginx
```bash
sudo nano /etc/nginx/conf.d/club-corra-api.conf
```

**Add this configuration:**
```nginx
server {
    listen 80;
    server_name 16.170.179.71;

    # API proxy
    location /api/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Health check
    location /health {
        proxy_pass http://127.0.0.1:8080/api/v1/health;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 8.2 Start Nginx
```bash
# Test nginx configuration
sudo nginx -t

# Start nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Check status
sudo systemctl status nginx
```

---

## Step 9: Verify Deployment

### 9.1 Check Service Status
```bash
# Check API service
sudo systemctl status club-corra-api

# Check nginx service
sudo systemctl status nginx

# Check if ports are listening
sudo netstat -tlnp | grep -E ':(80|8080)'
```

### 9.2 Test API Endpoints
```bash
# Test health endpoint
curl http://16.170.179.71/health

# Test API endpoint
curl http://16.170.179.71/api/v1/health

# Test from external machine
curl http://16.170.179.71/api/v1/health
```

### 9.3 Check Logs
```bash
# View API logs
sudo journalctl -u club-corra-api -f

# View nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## Step 10: Security Hardening

### 10.1 Configure Firewall
```bash
# Install and configure firewalld
sudo dnf install -y firewalld
sudo systemctl start firewalld
sudo systemctl enable firewalld

# Allow necessary ports
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --permanent --add-port=8080/tcp

# Reload firewall
sudo firewall-cmd --reload
```

### 10.2 Update Security Group
1. Go to AWS Console → EC2 → Security Groups
2. Edit your security group
3. Restrict SSH access to your IP only
4. Keep HTTP/HTTPS open for public access

### 10.3 Setup SSL (Optional but Recommended)
```bash
# Install Certbot
sudo dnf install -y certbot python3-certbot-nginx

# Get SSL certificate (replace with your domain)
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo systemctl enable certbot-renew.timer
```

---

## Step 11: Monitoring and Maintenance

### 11.1 Setup Log Rotation
```bash
# Create log rotation config
sudo nano /etc/logrotate.d/club-corra-api
```

**Add this content:**
```
/var/log/club-corra-api/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 644 ec2-user ec2-user
    postrotate
        systemctl reload club-corra-api
    endscript
}
```

### 11.2 Setup Health Monitoring
```bash
# Create health check script
sudo nano /usr/local/bin/health-check.sh
```

**Add this content:**
```bash
#!/bin/bash
HEALTH_URL="http://127.0.0.1:8080/api/v1/health"
if ! curl -f -s "$HEALTH_URL" > /dev/null; then
    echo "Health check failed, restarting service..."
    systemctl restart club-corra-api
fi
```

```bash
# Make executable
sudo chmod +x /usr/local/bin/health-check.sh

# Add to crontab
echo "*/5 * * * * /usr/local/bin/health-check.sh" | sudo crontab -
```

---

## Step 12: Backup and Recovery

### 12.1 Create Backup Script
```bash
sudo nano /usr/local/bin/backup-api.sh
```

**Add this content:**
```bash
#!/bin/bash
BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Backup application
tar -czf "$BACKUP_DIR/club-corra-api-$DATE.tar.gz" -C /opt club-corra-api

# Keep only last 7 days of backups
find "$BACKUP_DIR" -name "club-corra-api-*.tar.gz" -mtime +7 -delete

echo "Backup completed: club-corra-api-$DATE.tar.gz"
```

```bash
# Make executable
sudo chmod +x /usr/local/bin/backup-api.sh

# Add to crontab (daily at 2 AM)
echo "0 2 * * * /usr/local/bin/backup-api.sh" | sudo crontab -
```

---

## Troubleshooting

### Common Issues and Solutions

#### 1. SSH Connection Failed
```bash
# Check security group
# Verify .pem file permissions
chmod 400 club-corra-api-key.pem

# Try with verbose output
ssh -v -i club-corra-api-key.pem ec2-user@16.170.179.71
```

#### 2. Service Won't Start
```bash
# Check service status
sudo systemctl status club-corra-api

# View logs
sudo journalctl -u club-corra-api -f

# Check if port is in use
sudo netstat -tlnp | grep :8080
```

#### 3. API Not Responding
```bash
# Check if service is running
sudo systemctl is-active club-corra-api

# Test local connection
curl http://127.0.0.1:8080/api/v1/health

# Check nginx status
sudo systemctl status nginx
```

#### 4. Permission Issues
```bash
# Fix ownership
sudo chown -R ec2-user:ec2-user /opt/club-corra-api

# Fix permissions
sudo chmod -R 755 /opt/club-corra-api
```

---

## Useful Commands

### Service Management
```bash
# Start/stop/restart service
sudo systemctl start club-corra-api
sudo systemctl stop club-corra-api
sudo systemctl restart club-corra-api

# Check status
sudo systemctl status club-corra-api

# View logs
sudo journalctl -u club-corra-api -f
```

### Application Management
```bash
# View running processes
ps aux | grep node

# Check port usage
sudo netstat -tlnp | grep :8080

# Test API
curl http://16.170.179.71/api/v1/health
```

### System Monitoring
```bash
# Check disk usage
df -h

# Check memory usage
free -h

# Check system load
uptime
```

---

## Next Steps

1. **Configure Domain**: Point your domain to the Elastic IP
2. **Setup SSL**: Use Let's Encrypt for HTTPS
3. **Database Setup**: Configure PostgreSQL database
4. **Monitoring**: Setup CloudWatch or other monitoring
5. **CI/CD**: Configure automated deployments
6. **Backup**: Setup automated database backups

---

## Support

If you encounter issues:
1. Check the logs: `sudo journalctl -u club-corra-api -f`
2. Verify service status: `sudo systemctl status club-corra-api`
3. Test connectivity: `curl http://16.170.179.71/api/v1/health`
4. Check security group settings in AWS Console

Your backend should now be running at: `http://16.170.179.71/api/v1`
