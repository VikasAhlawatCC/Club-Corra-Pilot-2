# EC2 Disk Space Fix Guide

## 🚨 **Problem: No Space Left on Device**

Your EC2 instance ran out of disk space during deployment. Here's how to fix it.

---

## 🔧 **Quick Fix Steps**

### **Step 1: Clean Up Disk Space on EC2**

Run this on your EC2 instance:

```bash
# Download and run the cleanup script
curl -O https://raw.githubusercontent.com/VikasAhlawatCC/Club-Corra-Pilot-2/main/scripts/deployment/fix-disk-space-ec2.sh
chmod +x fix-disk-space-ec2.sh
./fix-disk-space-ec2.sh
```

Or if you have the scripts already:

```bash
./scripts/deployment/fix-disk-space-ec2.sh
```

This will clean:
- ✅ Yarn cache
- ✅ NPM cache
- ✅ System package cache
- ✅ Old log files
- ✅ Temporary files

### **Step 2: Check Disk Usage**

```bash
# Check overall disk usage
df -h

# Check which directories are using space
sudo du -sh /* 2>/dev/null | sort -hr | head -10

# Find large node_modules directories
find ~ -name 'node_modules' -type d -prune -exec du -sh {} +
```

---

## 🌟 **Recommended Solution: Build Locally, Deploy to EC2**

Instead of building on EC2 (which uses a lot of disk space), build locally and upload the built files:

### **From Your Local Machine:**

```bash
# Navigate to your project
cd /Users/vikasahlawat/Documents/Club-Corra-Pilot-2

# Run the deployment script
./scripts/deployment/deploy-built-to-ec2.sh
```

**This approach:**
- ✅ Builds on your local machine (more resources)
- ✅ Only uploads built files to EC2
- ✅ Saves disk space on EC2
- ✅ Faster deployment

---

## 📊 **Option: Increase EC2 Disk Size**

If you need more permanent space:

### **1. Via AWS Console:**

1. Go to **AWS Console** → **EC2** → **Volumes**
2. Select your volume
3. **Actions** → **Modify Volume**
4. Increase size (e.g., from 8GB to 20GB)
5. Wait for modification to complete

### **2. On EC2 Instance (after resizing volume):**

```bash
# Check current partition
df -h

# Grow the partition (assuming /dev/xvda1)
sudo growpart /dev/xvda 1

# Resize the filesystem (for XFS)
sudo xfs_growfs -d /

# Or for ext4 filesystems
sudo resize2fs /dev/xvda1

# Verify new size
df -h
```

---

## 🗑️ **Manual Cleanup Commands**

If you need to clean up manually:

```bash
# Remove old node_modules
rm -rf ~/club-corra-api/Club-Corra-Pilot-2/node_modules
rm -rf ~/club-corra-api/Club-Corra-Pilot-2/apps/*/node_modules

# Clean yarn cache
yarn cache clean
sudo rm -rf /usr/local/share/.cache/yarn/*
rm -rf ~/.cache/yarn/*

# Clean npm cache
npm cache clean --force

# Clean package manager cache
sudo dnf clean all

# Clean old logs
sudo journalctl --vacuum-time=1d
sudo find /var/log -type f -name "*.log.*" -delete
sudo find /var/log -type f -name "*.gz" -delete

# Clean temp files
sudo find /tmp -type f -atime +1 -delete
sudo find /var/tmp -type f -atime +1 -delete

# Remove Docker if installed and not needed
sudo dnf remove docker docker-engine docker.io containerd runc
```

---

## 📈 **Current Disk Usage Analysis**

Based on your error, the issue occurred during `yarn install`. Common culprits:

1. **Yarn cache**: Can grow to several GB
2. **Node modules**: Each copy can be 200MB-500MB
3. **Package manager cache**: DNF/YUM cache
4. **Log files**: System and application logs
5. **Turbo cache**: Monorepo build cache

---

## ✅ **Recommended EC2 Setup**

For production, recommended disk sizes:

- **Minimum**: 20GB (for small apps)
- **Recommended**: 30GB (for monorepos)
- **Production**: 50GB+ (with logs and caching)

Your current instance likely has **8GB**, which is too small for a monorepo with Turbo.

---

## 🚀 **Quick Deployment (After Cleanup)**

Once you've freed up space OR increased disk size:

### **Option A: Deploy from Local (Recommended)**

```bash
# From your local machine
./scripts/deployment/deploy-built-to-ec2.sh
```

### **Option B: Deploy on EC2 (if you have enough space)**

```bash
# On EC2 instance
cd ~/club-corra-api/Club-Corra-Pilot-2
git pull
cd apps/api
yarn install --production
yarn build
sudo systemctl restart club-corra-api
```

---

## 🔍 **Verify Deployment**

After deployment:

```bash
# Check service status
sudo systemctl status club-corra-api

# Check logs
sudo journalctl -u club-corra-api -f

# Test API
curl http://localhost:8080/api/v1/health
curl -k https://16.170.179.71.nip.io/api/v1/health
```

---

## 📱 **Need Help?**

If issues persist:

1. **Check disk space**: `df -h`
2. **Check service logs**: `sudo journalctl -u club-corra-api -f`
3. **Check nginx logs**: `sudo journalctl -u nginx -f`
4. **Verify nginx config**: `sudo nginx -t`

---

## 💡 **Pro Tips**

1. **Use production installs**: `yarn install --production` (installs only production dependencies)
2. **Clean after build**: Remove `node_modules` after building
3. **Use .dockerignore**: If using Docker, ignore unnecessary files
4. **Monitor disk usage**: Set up CloudWatch alarms for disk space
5. **Regular cleanup**: Add cron job for cache cleanup

```bash
# Add to crontab for weekly cleanup
0 0 * * 0 yarn cache clean && npm cache clean --force && sudo journalctl --vacuum-time=7d
```

---

Your HTTPS setup is already complete! Just need to fix the disk space issue and you're good to go! 🎉
