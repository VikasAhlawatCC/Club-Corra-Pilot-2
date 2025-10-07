# Deployment Scripts Guide

## Quick Deployment (Recommended)

### Prerequisites
1. Ensure your SSH key is in `~/.ssh/club-corra-api-key.pem`
2. EC2 instance is running at `16.170.179.71`
3. You're in the project root directory

### One-Command Deployment

```bash
chmod +x scripts/deployment/deploy-from-local.sh
./scripts/deployment/deploy-from-local.sh
```

This script will:
- ✅ Build the API locally
- ✅ Create deployment package (production dependencies only)
- ✅ Upload to EC2
- ✅ Install and configure
- ✅ Start the service

## Available Deployment Scripts

### 1. `deploy-from-local.sh` ⭐ **RECOMMENDED**
Build locally, deploy to EC2.

**Use when:**
- First deployment
- Regular deployments
- When EC2 build fails
- When you want fast, reliable deployments

**Advantages:**
- No platform compatibility issues
- Faster deployment
- Smaller production footprint
- Works around monorepo workspace issues

```bash
./scripts/deployment/deploy-from-local.sh
```

### 2. `deploy-simple-ec2.sh`
Build and deploy directly on EC2.

**Use when:**
- You don't have local build environment
- Simple deployment without workspace issues

**Note:** May fail due to workspace dependencies

```bash
# On EC2
./scripts/deployment/deploy-simple-ec2.sh
```

### 3. `deploy-production-ec2.sh`
Legacy deployment script from old monorepo.

**Note:** References shared packages that don't exist in this repo. Use `deploy-from-local.sh` instead.

## Post-Deployment

### Update Environment Variables

```bash
ssh -i ~/.ssh/club-corra-api-key.pem ec2-user@16.170.179.71
sudo nano /opt/club-corra-api/.env
```

Update these critical values:
- `DATABASE_URL`
- `JWT_SECRET`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `S3_BUCKET_NAME`

### Restart Service

```bash
ssh -i ~/.ssh/club-corra-api-key.pem ec2-user@16.170.179.71
sudo systemctl restart club-corra-api
```

### View Logs

```bash
ssh -i ~/.ssh/club-corra-api-key.pem ec2-user@16.170.179.71
sudo journalctl -u club-corra-api -f
```

### Test API

```bash
# From anywhere
curl http://16.170.179.71:8080/api/v1/health
```

## Troubleshooting

### SSH Key Permission Denied

```bash
chmod 400 ~/.ssh/club-corra-api-key.pem
```

### Build Fails Locally

```bash
# Clean and rebuild
cd apps/api
rm -rf dist node_modules
yarn install
yarn build
```

### Service Won't Start on EC2

```bash
# Connect to EC2
ssh -i ~/.ssh/club-corra-api-key.pem ec2-user@16.170.179.71

# Check logs
sudo journalctl -u club-corra-api -n 100 --no-pager

# Check service status
sudo systemctl status club-corra-api

# Test manually
cd /opt/club-corra-api
node dist/main.js
```

### Port Already in Use

```bash
# Find process using port 8080
sudo netstat -tlnp | grep :8080

# Kill the process
sudo fuser -k 8080/tcp

# Restart service
sudo systemctl restart club-corra-api
```

## Manual Deployment Steps

If automated scripts fail, follow these steps:

### 1. Build Locally
```bash
cd apps/api
yarn build
```

### 2. Create Package
```bash
mkdir -p ~/deploy-temp
cp -r dist ~/deploy-temp/
cp package.json ~/deploy-temp/
cd ~/deploy-temp
tar -czf ~/club-corra-api-deploy.tar.gz .
```

### 3. Upload to EC2
```bash
scp -i ~/.ssh/club-corra-api-key.pem \
    ~/club-corra-api-deploy.tar.gz \
    ec2-user@16.170.179.71:/tmp/
```

### 4. Deploy on EC2
```bash
ssh -i ~/.ssh/club-corra-api-key.pem ec2-user@16.170.179.71

# Stop service
sudo systemctl stop club-corra-api

# Backup current
sudo mv /opt/club-corra-api /opt/club-corra-api.backup.$(date +%Y%m%d-%H%M%S)

# Extract new version
cd /tmp
mkdir -p club-corra-api-deploy
tar -xzf club-corra-api-deploy.tar.gz -C club-corra-api-deploy

# Deploy
sudo mkdir -p /opt/club-corra-api
sudo cp -r club-corra-api-deploy/* /opt/club-corra-api/
sudo chown -R ec2-user:ec2-user /opt/club-corra-api

# Install dependencies
cd /opt/club-corra-api
npm install --production

# Start service
sudo systemctl start club-corra-api
```

## Useful Commands

### Service Management
```bash
# Start service
sudo systemctl start club-corra-api

# Stop service
sudo systemctl stop club-corra-api

# Restart service
sudo systemctl restart club-corra-api

# Check status
sudo systemctl status club-corra-api

# Enable auto-start on boot
sudo systemctl enable club-corra-api
```

### Logs
```bash
# Follow logs in real-time
sudo journalctl -u club-corra-api -f

# Last 100 lines
sudo journalctl -u club-corra-api -n 100

# Logs since yesterday
sudo journalctl -u club-corra-api --since yesterday

# Logs with priority level
sudo journalctl -u club-corra-api -p err
```

### System Info
```bash
# Check disk space
df -h

# Check memory
free -h

# Check processes
ps aux | grep node

# Check ports
sudo netstat -tlnp | grep :8080
```

## Best Practices

1. **Always use `deploy-from-local.sh`** for production deployments
2. **Test locally first** before deploying
3. **Backup environment files** before making changes
4. **Monitor logs** after deployment
5. **Keep deployment packages** for quick rollback

## Need Help?

See the detailed guides:
- `/docs/EC2_DEPLOYMENT_BEST_PRACTICE.md` - Best practice deployment guide
- `/docs/EC2_SETUP_GUIDE.md` - Initial EC2 setup guide
- `/scripts/deployment/TROUBLESHOOTING.md` - Common issues and solutions

## Quick Reference

| Task | Command |
|------|---------|
| Deploy | `./scripts/deployment/deploy-from-local.sh` |
| Update env | `ssh ... 'sudo nano /opt/club-corra-api/.env'` |
| Restart | `ssh ... 'sudo systemctl restart club-corra-api'` |
| Logs | `ssh ... 'sudo journalctl -u club-corra-api -f'` |
| Test | `curl http://16.170.179.71:8080/api/v1/health` |

