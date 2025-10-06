# Optimized EC2 Deployment Guide for 8GB Instances

## 🚨 Critical Fixes Applied

### Fixed Issues:
1. **HTTPS Script Variable Error**: Fixed undefined `$API_DIR` in `setup-https-backend.sh`
2. **Path Inconsistencies**: Standardized all scripts to use `dist/apps/api/src/main.js`
3. **Log Rotation**: Optimized for 8GB instances with aggressive space management
4. **Cache Cleanup**: Enhanced comprehensive cache cleanup during deployment
5. **Process Cleanup**: Improved stopping of previous deployments

## 📋 Correct Deployment Order for 8GB EC2

Run these commands in **EXACT** order for sustainable deployments:

```bash
# 1. Set up HTTPS first (now fixed)
sudo ./scripts/deployment/setup-https-backend.sh

# 2. Deploy the application (enhanced for 8GB)
./scripts/deployment/deploy-production-ec2.sh

# 3. Set up log rotation and monitoring (optimized for 8GB)
./scripts/deployment/setup-log-rotation.sh --setup
```

## 🔧 Optimizations for 8GB EC2

### Log Rotation (Now Optimized):
- **System logs**: 7-day retention, 10MB max size
- **App logs**: 5-day retention, 5MB max size  
- **Temp logs**: 2-day retention, 2MB max size
- **Journal**: 50MB max, 3-day retention
- **Free space**: Maintains 500MB free

### Cache Management (Enhanced):
- Cleans yarn/npm caches before each deployment
- Removes Docker cache if Docker is installed
- Cleans system temp files and build artifacts
- Removes old deployment artifacts automatically
- Emergency cleanup triggers if <1GB space available

### Backup Management (Optimized):
- Keeps only **3 backups** (reduced from 5)
- **14-day** max retention (reduced from 30)
- Automatically removes backups if total size >500MB
- Size-based cleanup for large backups

## 🚀 Pre-Deployment Checklist

Before running deployment scripts:

```bash
# Check available space
df -h /

# Should show at least 2GB available for safe deployment
# If less than 1GB available, deployment will fail with cleanup attempt
```

## 📊 Monitoring After Deployment

```bash
# Check service status
sudo systemctl status club-corra-api

# Monitor logs
sudo journalctl -u club-corra-api -f

# Check disk usage
df -h /

# Monitor resource usage
tail -f /opt/club-corra-monitoring/resource-monitoring.log
```

## 🔍 Troubleshooting Commands

```bash
# If deployment fails with space issues:
sudo ./scripts/deployment/deploy-production-ec2.sh --troubleshoot

# Manual cleanup if needed:
sudo journalctl --vacuum-time=1d
sudo docker system prune -f
sudo find /tmp -type f -mtime +1 -delete

# Check what's using space:
sudo du -sh /* | sort -hr | head -10
```

## ⚠️ Important Notes for 8GB EC2

1. **Always monitor disk usage** - deployment will fail if <1GB available
2. **Run log rotation setup** after every deployment to prevent space issues
3. **Backups are aggressive** - only keeps 3 backups max 14 days
4. **Journal logs limited** to 50MB with 3-day retention
5. **Cache cleanup is automatic** but aggressive to preserve space

## 🎯 Expected Space Usage

After optimized deployment on 8GB EC2:

- **System + OS**: ~2GB
- **Application**: ~1GB
- **Dependencies**: ~1.5GB  
- **Logs**: <100MB
- **Backups**: <500MB
- **Free space**: ~3GB (safe margin)

## 🚨 Emergency Commands

If you run out of space during deployment:

```bash
# Emergency cleanup
sudo journalctl --vacuum-time=12h
sudo rm -rf /opt/club-corra-api-backup/backup-* 
sudo find /var/log -name "*.log.*" -delete
sudo docker system prune -af
```

This optimized configuration ensures sustainable deployments on 8GB EC2 instances with proper space management.

## 🔧 CRITICAL FIX: Shared Package Build Issue

### Problem Identified
The deployment was failing because the shared package (`@club-corra/shared`) was not being built before the API package, causing the error:
```
[ERROR] ❌ ERROR: Shared package not accessible - @club-corra/shared/dist/index.js not found
```

### Solution Implemented
1. **Enhanced Build Process**: Added verification steps to ensure shared package is built first
2. **Improved Error Handling**: Added comprehensive checks for shared package accessibility
3. **Better Symlink Management**: Enhanced the symlink creation and verification process
4. **Test Script**: Created `test-shared-package-build.sh` to verify the build process

### Key Changes Made
- **Build Order**: Ensured `yarn workspace @club-corra/shared build` runs before API build
- **Verification Steps**: Added checks to verify shared package build output exists
- **Symlink Creation**: Enhanced symlink creation with proper error handling
- **Accessibility Checks**: Added verification that API can access shared package via both symlink and relative path
- **Build Verification Fix**: Updated build verification to check both `node_modules/@club-corra/shared/dist/index.js` and `../../packages/shared/dist/index.js` paths

### Files Modified
- `scripts/deployment/deploy-production-ec2.sh` - Enhanced build process and verification
- `scripts/deployment/test-shared-package-build.sh` - New test script for verification

### Testing
Run the test script to verify the fix:
```bash
./scripts/deployment/test-shared-package-build.sh
```

This fix ensures that the shared package is properly built and accessible during deployment, resolving the workspace dependency issues.
