# EC2 Backend Deployment Guide (Club Corra Pilot 2)

## Prerequisites

1. **EC2 Instance Running**
   - Instance ID: Your EC2 instance
   - IP: 16.170.179.71
   - User: ec2-user
   - Key: club-corra-api-key.pem

2. **Security Group Configuration**
   ```
   Inbound Rules:
   - SSH (22): Your IP or 0.0.0.0/0
   - Custom TCP (3001): 0.0.0.0/0 (for API access)
   - HTTP (80): 0.0.0.0/0 (if using load balancer)
   - HTTPS (443): 0.0.0.0/0 (if using load balancer)
   ```

3. **Local Requirements**
   - AWS CLI configured
   - SSH key with correct permissions
   - Yarn installed (v1)

## Quick Deployment

### Step 1: Fix SSH Connection

```bash
# Set correct key permissions
chmod 400 club-corra-api-key.pem

# Test SSH connection
ssh -i club-corra-api-key.pem ec2-user@16.170.179.71

# If still timing out, check security group and try:
ssh -o ConnectTimeout=10 -o ServerAliveInterval=60 -i club-corra-api-key.pem ec2-user@16.170.179.71
```

### Step 2: Deploy Backend (Optimized script)

```bash
chmod +x scripts/deployment/deploy-production-ec2-optimized.sh
./scripts/deployment/deploy-production-ec2-optimized.sh
```

### Step 3: Check Deployment Status

```bash
./scripts/deployment/deploy-production-ec2-optimized.sh --verify
```

## Manual Deployment (if script fails)

### Step 1: Build Locally (apps/api only)

```bash
# Build API only
cd apps/api && yarn install && yarn build && ls -la dist/
```

### Step 2: Copy to EC2 (minimal payload)

```bash
# Create deployment package (API only)
mkdir -p deploy-package
cp -r apps/api/dist deploy-package/
cp -r apps/api/node_modules deploy-package/
cp apps/api/package.json deploy-package/
cp apps/api/yarn.lock deploy-package/ 2>/dev/null || true
tar -czf club-corra-api-deploy.tar.gz deploy-package/
scp -i club-corra-api-key.pem club-corra-api-deploy.tar.gz ec2-user@16.170.179.71:/tmp/
```

### Step 3: Deploy on EC2

```bash
# SSH to EC2
ssh -i club-corra-api-key.pem ec2-user@16.170.179.71

# On EC2, extract and deploy
cd /tmp
tar -xzf club-corra-api-deploy.tar.gz
cd deploy-package

# Create deployment directory
sudo mkdir -p /opt/club-corra-api
sudo cp -r * /opt/club-corra-api/
sudo chown -R ec2-user:ec2-user /opt/club-corra-api

# Setup environment variables (note: app listens on 8080, behind nginx)
sudo tee /opt/club-corra-api/.env << 'EOF'
NODE_ENV=production
PORT=8080
HOST=127.0.0.1
DATABASE_URL=your_database_url_here
DB_SSL=true
JWT_SECRET=your_jwt_secret_here
CORS_ORIGIN=https://admin.clubcorra.com,https://clubcorra.com,https://*.clubcorra.com,https://*.vercel.app
EOF

# Setup systemd service
sudo cp scripts/deployment/club-corra-api.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable club-corra-api
sudo systemctl start club-corra-api

# Check status
sudo systemctl status club-corra-api
```

## Troubleshooting

### SSH Connection Issues

1. **Check Security Group**
   ```bash
   # Go to AWS Console → EC2 → Security Groups
   # Ensure SSH (22) is open from your IP
   ```

2. **Check Instance Status**
   ```bash
   # In AWS Console, verify instance is "running"
   # Check if you can ping the instance
   ping 16.170.179.71
   ```

3. **Check Key Permissions**
   ```bash
   chmod 400 club-corra-api-key.pem
   ```

### Deployment Issues

1. **Check Service Status**
   ```bash
   ssh -i club-corra-api-key.pem ec2-user@16.170.179.71
   sudo systemctl status club-corra-api
   sudo journalctl -u club-corra-api -f
   ```

2. **Check Port Listening**
   ```bash
   netstat -tlnp | grep :8080
   ```

3. **Check File Permissions**
   ```bash
   ls -la /opt/club-corra-api/
   sudo chown -R ec2-user:ec2-user /opt/club-corra-api/
   ```

## Environment Variables (production)

Create `/opt/club-corra-api/.env` with:

```bash
NODE_ENV=production
PORT=8080
HOST=127.0.0.1
DATABASE_URL=postgresql://user:password@host:port/database
DB_SSL=true
JWT_SECRET=your_secure_jwt_secret
CORS_ORIGIN=https://admin.clubcorra.com,https://clubcorra.com,https://*.clubcorra.com,https://*.vercel.app
```

## Monitoring

### Check Logs
```bash
# Real-time logs
sudo journalctl -u club-corra-api -f

# Last 100 lines
sudo journalctl -u club-corra-api -n 100

# Logs since yesterday
sudo journalctl -u club-corra-api --since yesterday
```

### Check Performance
```bash
# Check memory usage
free -h

# Check disk usage
df -h

# Check running processes
ps aux | grep node
```

## Security Notes

1. **Firewall**: Ensure only necessary ports are open
2. **Updates**: Keep system and Node.js updated
3. **Monitoring**: Set up CloudWatch alarms
4. **Backups**: Regular backups of configuration and data
5. **SSL**: Use HTTPS in production with proper certificates

## Next Steps

After successful deployment:

1. **Test API endpoints** at `http://16.170.179.71:8080`
2. **Set up domain** pointing to your EC2 instance
3. **Configure load balancer** if needed
4. **Set up monitoring** and alerting
5. **Configure CI/CD** for automated deployments
