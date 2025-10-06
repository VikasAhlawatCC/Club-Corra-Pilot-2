# Club Corra Backend Deployment Documentation

## 📋 Overview

This directory contains comprehensive deployment and operational scripts for the Club Corra API backend running on AWS EC2. The scripts provide a complete production deployment solution with HTTPS support, log management, backup lifecycle management, and resource monitoring.

## 🚀 Scripts Overview

### 1. `deploy-production-ec2.sh` - Main Production Deployment
**Purpose**: Complete production deployment of the Club Corra API to EC2
**Scope**: Full application deployment, service setup, and verification

### 2. `setup-https-backend.sh` - HTTPS & SSL Configuration  
**Purpose**: SSL certificate setup and nginx configuration for HTTPS
**Scope**: SSL certificates, nginx reverse proxy, firewall configuration

### 3. `setup-log-rotation.sh` - Operations & Monitoring
**Purpose**: Log rotation, backup management, and resource monitoring
**Scope**: Log lifecycle, backup cleanup, system monitoring, alerting

## 🏗️ Architecture Overview

```
Internet → Route 53 → EC2 Instance
                    ↓
                nginx (HTTPS:443)
                    ↓
            NestJS API (HTTP:8080)
                    ↓
            PostgreSQL Database
```

## 📁 Script Details

---

## 🔧 `deploy-production-ec2.sh`

### **Purpose**
Complete production deployment script that handles the entire deployment lifecycle from source code to running service.

### **Key Features**
- ✅ **Node.js Management**: Automatic version checking and upgrading (v18 → v20)
- ✅ **Yarn Workspace Support**: Full monorepo deployment with shared packages
- ✅ **Automatic Backups**: Creates timestamped backups before deployment
- ✅ **Service Management**: systemd service creation and management
- ✅ **Dependency Resolution**: Handles complex workspace dependencies
- ✅ **Rollback Support**: Automatic rollback to previous deployment
- ✅ **Comprehensive Testing**: Pre-deployment validation and testing
- ✅ **HTTPS Ready**: Configured for nginx reverse proxy deployment

### **Deployment Flow**
```
1. Environment Check → 2. Node.js Upgrade → 3. SSL Check → 4. Service Stop
    ↓
5. Backup Creation → 6. Build Environment → 7. Application Build → 8. Production Deploy
    ↓
9. Manual Testing → 10. Service Setup → 11. Verification → 12. Health Check
```

### **Usage**
```bash
# Full deployment
./deploy-production-ec2.sh

# Verification only
./deploy-production-ec2.sh --verify

# Rollback to previous deployment
./deploy-production-ec2.sh --rollback

# View service logs
./deploy-production-ec2.sh --logs

# Debug workspace setup
./deploy-production-ec2.sh --debug

# Auto-troubleshoot common issues
./deploy-production-ec2.sh --troubleshoot
```

### **Configuration**
- **Service Name**: `club-corra-api`
- **App Directory**: `/opt/club-corra-api`
- **Backup Directory**: `/opt/club-corra-api-backup`
- **Port**: 8080 (HTTP behind nginx)
- **User**: `ec2-user`

### **Dependencies**
- Amazon Linux 2/2023
- Node.js 20+
- Yarn package manager
- systemd
- nginx (for HTTPS)

---

## 🔒 `setup-https-backend.sh`

### **Purpose**
Sets up complete HTTPS infrastructure with SSL certificates, nginx reverse proxy, and firewall configuration.

### **Key Features**
- ✅ **SSL Certificate Management**: Let's Encrypt integration
- ✅ **Nginx Configuration**: Reverse proxy with security headers
- ✅ **Domain Support**: Custom domains or nip.io for testing
- ✅ **Firewall Setup**: Automatic security group configuration
- ✅ **SSL Renewal**: Automated certificate renewal via cron
- ✅ **Security Headers**: HSTS, X-Frame-Options, CSP
- ✅ **WebSocket Support**: Full WebSocket proxy configuration
- ✅ **Health Checks**: Built-in health check endpoints

### **SSL Configuration**
```nginx
# HTTP → HTTPS redirect
server {
    listen 80;
    server_name api.clubcorra.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS proxy to NestJS
server {
    listen 443 ssl http2;
    server_name api.clubcorra.com;
    
    ssl_certificate /etc/letsencrypt/live/api.clubcorra.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.clubcorra.com/privkey.pem;
    
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        # ... additional proxy headers
    }
}
```

### **Usage**
```bash
# Run on EC2 instance (requires root/sudo)
sudo ./setup-https-backend.sh

# The script will:
# 1. Detect server IP and OS
# 2. Install required packages (nginx, certbot)
# 3. Generate SSL certificates
# 4. Configure nginx reverse proxy
# 5. Setup firewall rules
# 6. Configure automatic renewal
```

### **Domain Options**
1. **nip.io Domain**: Automatic domain creation using public IP
   - Example: `16.170.179.71.nip.io`
   - Good for testing and development
   
2. **Custom Domain**: Manual domain configuration
   - Example: `api.clubcorra.com`
   - Required for production use
   - DNS must point to EC2 public IP

### **Security Features**
- **SSL/TLS 1.2+**: Modern encryption protocols
- **HSTS**: HTTP Strict Transport Security
- **Security Headers**: X-Frame-Options, X-Content-Type-Options
- **Firewall Rules**: Only necessary ports open (22, 80, 443)
- **Automatic Renewal**: SSL certificates renewed automatically

---

## 📊 `setup-log-rotation.sh`

### **Purpose**
Comprehensive operational management including log rotation, backup lifecycle management, and resource monitoring.

### **Key Features**
- ✅ **Log Rotation**: 14-day retention with compression
- ✅ **Backup Management**: Automatic cleanup (keep 5, max 30 days)
- ✅ **Resource Monitoring**: Real-time monitoring with alerting
- ✅ **Automated Maintenance**: Cron jobs for all maintenance tasks
- ✅ **Alerting System**: Threshold-based alerts for critical issues
- ✅ **Log Cleanup**: Automatic truncation of large log files
- ✅ **Health Monitoring**: Service status and port monitoring

### **Monitoring Thresholds**
```bash
# Alert thresholds
DISK_USAGE_THRESHOLD=85%      # 🚨 Alert when disk > 85%
MEMORY_USAGE_THRESHOLD=90%    # 🚨 Alert when memory > 90%
CPU_USAGE_THRESHOLD=95%       # 🚨 Alert when CPU > 95%
```

### **Log Retention Policies**
```bash
# Application logs: 14 days
/var/log/club-corra-api/*.log {
    daily
    rotate 14
    compress
}

# Backup verification logs: 30 days
# Resource monitoring logs: 30 days
# System logs: 7 days
```

### **Usage**
```bash
# Setup everything
./setup-log-rotation.sh --setup

# Setup individual components
./setup-log-rotation.sh --logs      # Log rotation only
./setup-log-rotation.sh --backups   # Backup management only
./setup-log-rotation.sh --monitor   # Resource monitoring only

# Verification and testing
./setup-log-rotation.sh --verify    # Verify all configurations
./setup-log-rotation.sh --test      # Test all functionalities
```

### **Cron Jobs Created**
```bash
# Log rotation: Daily
0 0 * * * /usr/sbin/logrotate /etc/logrotate.d/club-corra-api

# Backup cleanup: Weekly
0 0 * * 0 /opt/club-corra-monitoring/cleanup-backups.sh

# Backup verification: Daily
0 2 * * * /opt/club-corra-monitoring/verify-backups.sh

# Resource monitoring: Every 5 minutes
*/5 * * * * /opt/club-corra-monitoring/monitor-resources.sh

# Log cleanup: Daily at 2 AM
0 2 * * * /opt/club-corra-monitoring/cleanup-logs.sh
```

---

## 🚀 Deployment Workflow

### **Initial Setup (First Time)**
```bash
# 1. SSH to EC2 instance
ssh -i your-key.pem ec2-user@your-ec2-ip

# 2. Clone repository
git clone https://github.com/vikasahlawat/club-corra-pilot.git
cd club-corra-pilot

# 3. Setup HTTPS infrastructure
sudo ./scripts/deployment/setup-https-backend.sh

# 4. Setup operations and monitoring
./scripts/deployment/setup-log-rotation.sh --setup

# 5. Deploy application
./scripts/deployment/deploy-production-ec2.sh
```

### **Regular Deployment (Updates)**
```bash
# 1. Pull latest changes
git pull origin main

# 2. Deploy with automatic backup
./scripts/deployment/deploy-production-ec2.sh

# 3. Verify deployment
./scripts/deployment/deploy-production-ec2.sh --verify
```

### **Emergency Procedures**
```bash
# Rollback to previous deployment
./scripts/deployment/deploy-production-ec2.sh --rollback

# Troubleshoot deployment issues
./scripts/deployment/deploy-production-ec2.sh --troubleshoot

# View real-time logs
./scripts/deployment/deploy-production-ec2.sh --logs
```

---

## 🔍 Monitoring & Debugging

### **Service Status**
```bash
# Check service status
sudo systemctl status club-corra-api

# Check nginx status
sudo systemctl status nginx

# Check monitoring service
sudo systemctl status club-corra-monitoring
```

### **Log Access**
```bash
# Application logs (journald)
sudo journalctl -u club-corra-api -f

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Resource monitoring logs
tail -f /opt/club-corra-monitoring/resource-monitoring.log

# Backup verification logs
tail -f /var/log/club-corra-backup-verification.log
```

### **Resource Monitoring**
```bash
# Real-time resource usage
tail -f /opt/club-corra-monitoring/resource-monitoring.log

# Manual resource check
/opt/club-corra-monitoring/monitor-resources.sh

# Check disk usage
df -h
du -sh /opt/*

# Check memory usage
free -h
top

# Check process status
ps aux | grep node
netstat -tlnp | grep :8080
```

### **SSL Certificate Status**
```bash
# Check certificate expiration
sudo certbot certificates

# Check nginx configuration
sudo nginx -t

# View SSL configuration
sudo cat /etc/nginx/conf.d/club-corra-api.conf
```

---

## 🛠️ Troubleshooting

### **Common Issues & Solutions**

#### **1. Service Won't Start**
```bash
# Check service status
sudo systemctl status club-corra-api

# View detailed logs
sudo journalctl -u club-corra-api -n 50

# Check configuration
sudo systemctl cat club-corra-api

# Manual start test
cd /opt/club-corra-api
node dist/src/main.js
```

#### **2. SSL Certificate Issues**
```bash
# Check certificate status
sudo certbot certificates

# Renew certificates manually
sudo certbot renew

# Check nginx configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

#### **3. High Resource Usage**
```bash
# Check resource monitoring logs
tail -f /opt/club-corra-monitoring/resource-monitoring.log

# Manual resource check
/opt/club-corra-monitoring/monitor-resources.sh

# Check for large log files
find /var/log -name "*.log" -size +100M

# Check backup directory size
du -sh /opt/club-corra-api-backup
```

#### **4. Log Rotation Issues**
```bash
# Test logrotate configuration
sudo logrotate -d /etc/logrotate.d/club-corra-api

# Force log rotation
sudo logrotate -f /etc/logrotate.d/club-corra-api

# Check cron jobs
ls -la /etc/cron.*/club-corra-*

# Check logrotate logs
sudo tail -f /var/log/cron
```

### **Debug Commands**
```bash
# Debug workspace setup
./scripts/deployment/deploy-production-ec2.sh --debug

# Verify all configurations
./scripts/deployment/setup-log-rotation.sh --verify

# Test all functionalities
./scripts/deployment/setup-log-rotation.sh --test

# Check system resources
htop
iotop
nethogs
```

---

## 📈 Performance & Optimization

### **Resource Limits**
```bash
# systemd service limits
LimitNOFILE=65536        # File descriptors
LimitNPROC=4096          # Process limit
MemoryMax=2G             # Memory limit (if configured)
```

### **Nginx Optimization**
```nginx
# Gzip compression
gzip on;
gzip_types text/plain text/css application/json application/javascript;

# Proxy buffering
proxy_buffering on;
proxy_buffer_size 4k;
proxy_buffers 8 4k;
```

### **Log Optimization**
```bash
# Journald limits
SystemMaxUse=100M        # Max journal size
SystemKeepFree=200M      # Keep free space
MaxRetentionSec=1week    # Log retention
```

---

## 🔐 Security Considerations

### **File Permissions**
```bash
# Application files: 755 (rwxr-xr-x)
sudo chmod -R 755 /opt/club-corra-api

# Environment files: 600 (rw-------)
sudo chmod 600 /opt/club-corra-api/.env

# Log files: 644 (rw-r--r--)
sudo chmod 644 /var/log/club-corra-api/*.log
```

### **Network Security**
- **SSH**: Port 22 (key-based authentication)
- **HTTP**: Port 80 (redirect to HTTPS)
- **HTTPS**: Port 443 (main application)
- **API**: Port 8080 (internal, nginx proxy)

### **SSL Security**
- **Protocols**: TLS 1.2, TLS 1.3
- **Ciphers**: ECDHE-RSA-AES128-GCM-SHA256, ECDHE-RSA-AES256-GCM-SHA384
- **HSTS**: max-age=31536000; includeSubDomains
- **Security Headers**: X-Frame-Options, X-Content-Type-Options, X-XSS-Protection

---

## 📋 Maintenance Schedule

### **Daily Tasks**
- ✅ **Resource monitoring** (every 5 minutes)
- ✅ **Backup verification** (2 AM)
- ✅ **Log rotation** (midnight)
- ✅ **Service health checks**

### **Weekly Tasks**
- ✅ **Backup cleanup** (Sunday midnight)
- ✅ **Log cleanup** (Sunday 2 AM)
- ✅ **SSL certificate renewal check**

### **Monthly Tasks**
- ✅ **System updates** (security patches)
- ✅ **Performance review** (resource usage analysis)
- ✅ **Backup restoration test**

---

## 🎯 Best Practices

### **Deployment**
1. **Always backup** before deployment
2. **Test in staging** before production
3. **Monitor deployment** logs in real-time
4. **Verify health** after deployment
5. **Keep deployment history** for rollback

### **Monitoring**
1. **Set appropriate thresholds** for alerts
2. **Monitor resource trends** over time
3. **Set up log aggregation** for better visibility
4. **Regular backup verification** testing
5. **Document incident responses**

### **Security**
1. **Regular SSL certificate renewal**
2. **Monitor security logs** for anomalies
3. **Keep systems updated** with security patches
4. **Use strong authentication** (SSH keys)
5. **Regular security audits**

---

## 📞 Support & Escalation

### **Immediate Actions (Critical Issues)**
1. **Service down**: Check `sudo systemctl status club-corra-api`
2. **High resource usage**: Run `/opt/club-corra-monitoring/monitor-resources.sh`
3. **SSL issues**: Check `sudo certbot certificates`
4. **Disk full**: Run cleanup scripts manually

### **Escalation Path**
1. **Check logs** and error messages
2. **Run troubleshooting scripts**: `--troubleshoot` flag
3. **Manual investigation** using debug commands
4. **Rollback** to previous working deployment
5. **Contact DevOps team** for complex issues

---

## 📚 Additional Resources

### **Script Locations**
- **Deployment**: `scripts/deployment/deploy-production-ec2.sh`
- **HTTPS Setup**: `scripts/deployment/setup-https-backend.sh`
- **Operations**: `scripts/deployment/setup-log-rotation.sh`

### **Configuration Files**
- **Service**: `/etc/systemd/system/club-corra-api.service`
- **Nginx**: `/etc/nginx/conf.d/club-corra-api.conf`
- **Logrotate**: `/etc/logrotate.d/club-corra-api`
- **Cron**: `/etc/cron.d/club-corra-monitoring`

### **Log Locations**
- **Application**: `/var/log/club-corra-api/`
- **System**: `/var/log/journal/`
- **Nginx**: `/var/log/nginx/`
- **Monitoring**: `/opt/club-corra-monitoring/`

### **Documentation**
- **API Documentation**: Check API endpoints and schemas
- **Deployment Guide**: This document
- **Troubleshooting**: Common issues and solutions
- **Monitoring**: Resource thresholds and alerting

---

*This documentation covers the complete backend deployment and operational procedures for the Club Corra API. For additional support or questions, refer to the troubleshooting section or contact the DevOps team.*
