# Club Corra Backend - Quick Reference Guide

## 🚀 Daily Operations

### **Check Service Status**
```bash
# Quick health check
sudo systemctl status club-corra-api

# Check all services
sudo systemctl status club-corra-api nginx club-corra-monitoring
```

### **View Logs**
```bash
# Application logs (real-time)
sudo journalctl -u club-corra-api -f

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Resource monitoring
tail -f /opt/club-corra-monitoring/resource-monitoring.log
```

### **Resource Check**
```bash
# Quick resource overview
df -h                    # Disk usage
free -h                  # Memory usage
top                      # CPU and process info
netstat -tlnp | grep :8080  # Port status
```

---

## 🔧 Common Commands

### **Service Management**
```bash
# Start/Stop/Restart
sudo systemctl start club-corra-api
sudo systemctl stop club-corra-api
sudo systemctl restart club-corra-api

# Enable/Disable
sudo systemctl enable club-corra-api
sudo systemctl disable club-corra-api

# Check status
sudo systemctl is-active club-corra-api
sudo systemctl is-enabled club-corra-api
```

### **Nginx Management**
```bash
# Start/Stop/Restart
sudo systemctl start nginx
sudo systemctl stop nginx
sudo systemctl restart nginx

# Test configuration
sudo nginx -t

# Reload configuration
sudo systemctl reload nginx
```

### **SSL Certificate Management**
```bash
# Check certificates
sudo certbot certificates

# Renew manually
sudo certbot renew

# Check expiration
sudo openssl x509 -in /etc/letsencrypt/live/*/fullchain.pem -text -noout | grep "Not After"
```

---

## 📊 Monitoring Commands

### **Resource Monitoring**
```bash
# Run monitoring manually
/opt/club-corra-monitoring/monitor-resources.sh

# Check monitoring logs
tail -f /opt/club-corra-monitoring/resource-monitoring.log

# Check alert thresholds
grep "ALERT" /opt/club-corra-monitoring/resource-monitoring.log | tail -10
```

### **Backup Management**
```bash
# Check backup status
ls -la /opt/club-corra-api-backup/

# Run backup verification
/opt/club-corra-monitoring/verify-backups.sh

# Check backup logs
tail -f /var/log/club-corra-backup-verification.log
```

### **Log Management**
```bash
# Check log rotation
sudo logrotate -d /etc/logrotate.d/club-corra-api

# Force log rotation
sudo logrotate -f /etc/logrotate.d/club-corra-api

# Check log sizes
du -sh /var/log/club-corra-api/*.log 2>/dev/null
du -sh /opt/club-corra-api/logs/*.log 2>/dev/null
```

---

## 🚨 Emergency Commands

### **Service Issues**
```bash
# Service won't start
sudo systemctl status club-corra-api --no-pager -l
sudo journalctl -u club-corra-api -n 50

# Manual start test
cd /opt/club-corra-api
node dist/src/main.js
```

### **High Resource Usage**
```bash
# Check what's consuming resources
ps aux --sort=-%mem | head -10
ps aux --sort=-%cpu | head -10

# Check disk usage by directory
sudo du -sh /opt/* | sort -hr
sudo du -sh /var/log/* | sort -hr
```

### **SSL Issues**
```bash
# Check nginx configuration
sudo nginx -t

# Check certificate files
ls -la /etc/letsencrypt/live/*/

# Restart nginx
sudo systemctl restart nginx
```

---

## 📋 Deployment Commands

### **Full Deployment**
```bash
# Deploy with backup
./scripts/deployment/deploy-production-ec2.sh

# Verify deployment
./scripts/deployment/deploy-production-ec2.sh --verify

# Rollback if needed
./scripts/deployment/deploy-production-ec2.sh --rollback
```

### **Troubleshooting Deployment**
```bash
# Debug workspace setup
./scripts/deployment/deploy-production-ec2.sh --debug

# Auto-troubleshoot
./scripts/deployment/deploy-production-ec2.sh --troubleshoot

# View deployment logs
./scripts/deployment/deploy-production-ec2.sh --logs
```

---

## 🔍 Diagnostic Commands

### **System Health**
```bash
# Overall system status
htop
iotop
nethogs

# Check cron jobs
ls -la /etc/cron.*/club-corra-*
crontab -l

# Check systemd services
systemctl list-units --type=service --state=failed
```

### **Network Check**
```bash
# Check listening ports
sudo netstat -tlnp
sudo ss -tlnp

# Check firewall status
sudo ufw status
sudo firewall-cmd --list-all

# Test connectivity
curl -I http://localhost:8080/api/v1/health
curl -I https://your-domain.com/api/v1/health
```

### **File System Check**
```bash
# Check disk space
df -h
df -i

# Check inode usage
find /opt -type f | wc -l
find /var/log -type f | wc -l

# Check file permissions
ls -la /opt/club-corra-api/
ls -la /var/log/club-corra-api/
```

---

## ⏰ Cron Job Schedule

| Time | Job | Purpose |
|------|-----|---------|
| **Daily 00:00** | Log rotation | Rotate and compress logs |
| **Daily 02:00** | Backup verification | Verify backup integrity |
| **Daily 02:00** | Log cleanup | Clean old log files |
| **Every 5 min** | Resource monitoring | Monitor system resources |
| **Weekly Sunday 00:00** | Backup cleanup | Remove old backups |

---

## 📁 Key Directories

| Directory | Purpose | Owner |
|-----------|---------|-------|
| `/opt/club-corra-api/` | Application files | ec2-user |
| `/opt/club-corra-api-backup/` | Deployment backups | ec2-user |
| `/opt/club-corra-monitoring/` | Monitoring scripts | ec2-user |
| `/var/log/club-corra-api/` | Application logs | ec2-user |
| `/etc/nginx/conf.d/` | Nginx configuration | root |
| `/etc/letsencrypt/live/` | SSL certificates | root |

---

## 🔐 File Permissions

| File Type | Permission | Example |
|-----------|------------|---------|
| Application files | 755 (rwxr-xr-x) | `/opt/club-corra-api/` |
| Environment files | 600 (rw-------) | `.env` files |
| Log files | 644 (rw-r--r--) | `*.log` files |
| Scripts | 755 (rwxr-xr-x) | `*.sh` files |
| Configuration | 644 (rw-r--r--) | `*.conf` files |

---

## 📞 Support Contacts

### **Immediate Issues**
1. **Service down**: Check `sudo systemctl status club-corra-api`
2. **High resource usage**: Run monitoring script
3. **SSL issues**: Check certificate status
4. **Disk full**: Run cleanup scripts

### **Escalation**
1. Check logs and error messages
2. Run troubleshooting scripts
3. Manual investigation
4. Rollback to previous deployment
5. Contact DevOps team

---

## 💡 Pro Tips

- **Always check service status** before making changes
- **Monitor logs in real-time** during deployments
- **Use `--verify` flag** after any deployment
- **Keep backup directory clean** to prevent disk issues
- **Check resource monitoring** regularly for trends
- **Test SSL renewal** before certificates expire

---

*This quick reference covers the most common operations. For detailed procedures, refer to the main README.md documentation.*
