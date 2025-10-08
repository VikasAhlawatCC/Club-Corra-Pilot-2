# Club Corra API - EC2 Deployment Guide

This guide provides step-by-step instructions for deploying the Club Corra API directly on your EC2 instance.

## 🎯 Overview

The deployment process consists of three main scripts:
1. **Initial Setup** - Install dependencies and configure the system
2. **HTTPS Setup** - Configure SSL certificates and nginx
3. **Deployment** - Deploy and update your application

## 📋 Prerequisites

- EC2 instance running Amazon Linux 2023
- SSH access to your EC2 instance
- Your SSH key file (`club-corra-api-key.pem`)
- EC2 instance IP: `16.170.179.71`

## 🚀 Step-by-Step Deployment

### Step 1: Connect to Your EC2 Instance

```bash
# Connect to your EC2 instance
ssh -i ~/.ssh/club-corra-api-key.pem ec2-user@16.170.179.71
```

### Step 2: Upload the Scripts

You have two options:

#### Option A: Upload from Local Machine
```bash
# From your local machine, upload the scripts
scp -i ~/.ssh/club-corra-api-key.pem scripts/deployment/setup-ec2-direct.sh ec2-user@16.170.179.71:~/
scp -i ~/.ssh/club-corra-api-key.pem scripts/deployment/setup-https-ec2.sh ec2-user@16.170.179.71:~/
scp -i ~/.ssh/club-corra-api-key.pem scripts/deployment/deploy-ec2-direct.sh ec2-user@16.170.179.71:~/
```

#### Option B: Download from GitHub (Recommended)
```bash
# On your EC2 instance, download the scripts
cd ~
curl -O https://raw.githubusercontent.com/VikasAhlawatCC/Club-Corra-Pilot-2/main/scripts/deployment/setup-ec2-direct.sh
curl -O https://raw.githubusercontent.com/VikasAhlawatCC/Club-Corra-Pilot-2/main/scripts/deployment/setup-https-ec2.sh
curl -O https://raw.githubusercontent.com/VikasAhlawatCC/Club-Corra-Pilot-2/main/scripts/deployment/deploy-ec2-direct.sh

# Make scripts executable
chmod +x setup-ec2-direct.sh setup-https-ec2.sh deploy-ec2-direct.sh
```

### Step 3: Initial System Setup

```bash
# Run the initial setup script
./setup-ec2-direct.sh
```

**What this script does:**
- Updates system packages
- Installs Node.js 20, Yarn, nginx, certbot
- Clones the repository
- Installs dependencies and builds the API
- Creates production environment file
- Sets up systemd service
- Configures nginx reverse proxy
- Starts the API service

**Expected output:**
```
✅ System setup completed!
✅ Project setup completed!
✅ Production environment created!
✅ Systemd service created!
✅ Nginx configured!
✅ API service started successfully!
🎉 EC2 setup completed successfully!
```

### Step 4: Set Up HTTPS (Optional but Recommended)

```bash
# Run the HTTPS setup script
sudo ./setup-https-ec2.sh
```

**What this script does:**
- Detects your server IP
- Asks for domain configuration (nip.io or custom domain)
- Installs SSL certificates using Let's Encrypt
- Configures nginx for HTTPS
- Sets up automatic certificate renewal
- Updates API environment for HTTPS
- Configures firewall rules

**Domain Options:**
1. **nip.io domain** (automatic): `16.170.179.71.nip.io`
2. **Custom domain**: Your own domain pointing to the server

### Step 5: Verify Deployment

```bash
# Test the API endpoints
curl http://localhost:8080/api/v1/health
curl http://localhost/health

# If HTTPS is set up, test HTTPS
curl -k https://16.170.179.71.nip.io/api/v1/health
```

### Step 6: Future Deployments

For future updates, use the deployment script:

```bash
# Deploy updates
./deploy-ec2-direct.sh
```

**What this script does:**
- Pulls latest changes from GitHub
- Installs new dependencies
- Rebuilds the application
- Restarts the API service
- Tests the deployment

## 🔧 Useful Commands

### Service Management
```bash
# Check API service status
sudo systemctl status club-corra-api

# View API logs
sudo journalctl -u club-corra-api -f

# Restart API service
sudo systemctl restart club-corra-api

# Check nginx status
sudo systemctl status nginx

# View nginx logs
sudo journalctl -u nginx -f
```

### SSL Certificate Management
```bash
# Check SSL certificate status
sudo certbot certificates

# Manual certificate renewal
sudo certbot renew

# Check renewal logs
sudo journalctl -u certbot.timer
```

### Environment Management
```bash
# Edit environment file
nano ~/club-corra-api/Club-Corra-Pilot-2/apps/api/.env.production

# View environment file
cat ~/club-corra-api/Club-Corra-Pilot-2/apps/api/.env.production
```

## 🌐 Access Your API

After successful deployment, your API will be available at:

- **HTTP**: `http://16.170.179.71:8080/api/v1`
- **Through nginx**: `http://16.170.179.71/api/v1`
- **HTTPS** (if set up): `https://16.170.179.71.nip.io/api/v1`
- **Health check**: `http://16.170.179.71/health`

## 🔍 Troubleshooting

### Common Issues

1. **Service won't start**
   ```bash
   sudo systemctl status club-corra-api --no-pager -l
   sudo journalctl -u club-corra-api --no-pager -l
   ```

2. **SSL certificate issues**
   ```bash
   sudo certbot certificates
   sudo nginx -t
   ```

3. **Port conflicts**
   ```bash
   sudo netstat -tlnp | grep :8080
   sudo netstat -tlnp | grep :80
   ```

4. **Permission issues**
   ```bash
   sudo chown -R ec2-user:ec2-user ~/club-corra-api/
   ```

### Log Locations
- API logs: `sudo journalctl -u club-corra-api -f`
- Nginx logs: `sudo journalctl -u nginx -f`
- System logs: `sudo journalctl -f`

## 📊 Monitoring

### Health Checks
```bash
# API health
curl http://localhost:8080/api/v1/health

# Nginx health
curl http://localhost/health

# System resources
htop
df -h
free -h
```

### Performance Monitoring
```bash
# Check API response time
time curl http://localhost:8080/api/v1/health

# Monitor system resources
watch -n 1 'free -h && echo && df -h'
```

## 🔄 Update Process

For future updates:

1. **Connect to EC2**:
   ```bash
   ssh -i ~/.ssh/club-corra-api-key.pem ec2-user@16.170.179.71
   ```

2. **Run deployment script**:
   ```bash
   ./deploy-ec2-direct.sh
   ```

3. **Verify deployment**:
   ```bash
   curl http://localhost:8080/api/v1/health
   ```

## 🆘 Support

If you encounter issues:

1. Check the service status and logs
2. Verify environment variables
3. Test individual components
4. Check firewall and network settings

## 📚 Next Steps

After successful deployment:

1. **Update Vercel environment variables**:
   ```
   NEXT_PUBLIC_API_BASE_URL=https://16.170.179.71.nip.io/api/v1
   NEXT_PUBLIC_WS_URL=wss://16.170.179.71.nip.io
   ```

2. **Test your frontend** with the new API endpoint

3. **Set up monitoring** and alerting

4. **Configure backups** for your database

---

**🎉 Congratulations!** Your Club Corra API is now running on EC2 with production-ready configuration!
