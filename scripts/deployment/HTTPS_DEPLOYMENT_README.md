# Club Corra HTTPS Production Deployment Guide

This guide explains how to deploy the Club Corra API with full HTTPS support for production use.

## 🎯 Overview

The deployment process now supports two modes:
1. **HTTPS Mode** (Recommended for production) - Full SSL/TLS encryption with nginx reverse proxy
2. **HTTP Mode** (Fallback) - HTTP only, useful for development or when SSL setup fails

## 🚀 Quick Start

### Option 1: One-Command HTTPS Deployment (Recommended)

```bash
# From the club-corra-pilot directory
./scripts/deployment/deploy-https-production.sh
```

This script will:
- Set up SSL certificates automatically
- Configure nginx as a reverse proxy
- Deploy your API with HTTPS support
- Verify the deployment

### Option 2: Manual Step-by-Step Deployment

```bash
# 1. Set up HTTPS first
sudo ./scripts/deployment/setup-https-backend.sh

# 2. Deploy the application
./scripts/deployment/deploy-production-ec2.sh
```

## 🔒 HTTPS Architecture

```
Internet → HTTPS (443) → Nginx (SSL Termination) → HTTP (8080) → Node.js API
         → HTTP (80)  → Nginx (Redirect to HTTPS)
```

**Key Benefits:**
- SSL certificates handled by nginx (more efficient)
- Automatic HTTP to HTTPS redirects
- Better performance and security
- Automatic certificate renewal

## 📋 Prerequisites

- EC2 instance with public IP
- Domain name (or nip.io domain for testing)
- sudo access
- Ports 80, 443, and 8080 available

## 🛠️ Scripts Overview

### 1. `deploy-https-production.sh` (NEW - Recommended)
- **Purpose**: Complete HTTPS deployment in one command
- **Features**: 
  - Automatic SSL setup
  - Application deployment
  - Full verification
  - Production-ready configuration

### 2. `setup-https-backend.sh` (Existing)
- **Purpose**: SSL certificate generation and nginx configuration
- **Features**:
  - Let's Encrypt certificate generation
  - Nginx reverse proxy setup
  - Firewall configuration
  - Automatic renewal setup

### 3. `deploy-production-ec2.sh` (Updated)
- **Purpose**: Application deployment with HTTPS awareness
- **Features**:
  - Detects existing SSL configuration
  - Creates appropriate systemd service
  - Sets correct environment variables
  - Works with both HTTP and HTTPS modes

## 🔧 Configuration Details

### HTTPS Mode Environment Variables

When `HTTPS_MODE=true`:
```bash
NODE_ENV=production
PORT=8080
HOST=127.0.0.1  # Only accessible via nginx
HTTPS_MODE=true
SSL_CERT_PATH=/etc/letsencrypt/live/your-domain/fullchain.pem
SSL_KEY_PATH=/etc/letsencrypt/live/your-domain/privkey.pem
DOMAIN_NAME=your-domain.com
```

### HTTP Mode Environment Variables

When `HTTPS_MODE=false`:
```bash
NODE_ENV=production
PORT=8080
HOST=0.0.0.0  # Accessible directly
HTTPS_MODE=false
```

## 🌐 Vercel Frontend Configuration

After successful HTTPS deployment, update your Vercel environment variables:

```bash
NEXT_PUBLIC_API_BASE_URL=https://your-domain.com/api/v1
NEXT_PUBLIC_WS_URL=wss://your-domain.com
```

## 📊 Monitoring and Management

### Service Status
```bash
# API service
sudo systemctl status club-corra-api
sudo journalctl -u club-corra-api -f

# Nginx service
sudo systemctl status nginx
sudo journalctl -u nginx -f
```

### SSL Certificate Management
```bash
# Check certificate status
sudo certbot certificates

# Manual renewal
sudo certbot renew

# Check renewal logs
sudo journalctl -u certbot.timer
```

### Health Checks
```bash
# HTTPS health check
curl -k https://your-domain.com/api/v1/health

# HTTP redirect test
curl -I http://your-domain.com/api/v1/health
```

## 🔍 Troubleshooting

### Common Issues

1. **SSL Setup Fails**
   - Check if ports 80 and 443 are open
   - Verify domain DNS configuration
   - Ensure nginx is not already running

2. **API Service Won't Start**
   - Check service logs: `sudo journalctl -u club-corra-api -f`
   - Verify environment variables
   - Check file permissions

3. **HTTPS Not Working**
   - Verify nginx is running: `sudo systemctl status nginx`
   - Check SSL certificates: `sudo certbot certificates`
   - Test nginx config: `sudo nginx -t`

### Debug Commands

```bash
# Debug service issues
./scripts/deployment/debug-service.sh

# Verify HTTPS deployment
./scripts/deployment/deploy-https-production.sh --verify

# Check SSL configuration
sudo nginx -t
sudo certbot certificates
sudo systemctl status nginx
```

## 🔄 Deployment Workflow

### First Time Deployment
1. Run `./scripts/deployment/deploy-https-production.sh`
2. Wait for SSL setup and deployment
3. Update Vercel environment variables
4. Test the API endpoints

### Subsequent Deployments
1. Run `./scripts/deployment/deploy-production-ec2.sh`
2. The script will detect existing HTTPS configuration
3. Deploy with the same SSL settings

### SSL Certificate Renewal
- Automatic via cron (twice daily)
- Manual renewal: `sudo certbot renew`
- Nginx automatically reloads after renewal

## 🚨 Security Considerations

1. **Firewall**: Only ports 22 (SSH), 80 (HTTP), and 443 (HTTPS) should be open
2. **SSL**: Uses Let's Encrypt with automatic renewal
3. **Nginx**: Configured with security headers and HTTPS redirects
4. **API**: Runs on localhost (127.0.0.1) when in HTTPS mode

## 📚 Additional Resources

- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Nginx Configuration Guide](https://nginx.org/en/docs/)
- [Systemd Service Management](https://systemd.io/)

## 🆘 Support

If you encounter issues:
1. Check the debug script output
2. Review service logs
3. Verify SSL certificate status
4. Ensure all prerequisites are met

---

**Note**: This deployment process is designed for production use with full HTTPS support. The API will be accessible via HTTPS from the internet while maintaining security best practices.
