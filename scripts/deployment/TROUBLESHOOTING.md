# Club Corra Backend - Troubleshooting Guide

## 🚨 Critical Issues

### **1. Service Won't Start**

#### **Symptoms**
- `sudo systemctl status club-corra-api` shows failed status
- Service exits immediately after start
- No response on port 8080

#### **Immediate Actions**
```bash
# Check service status
sudo systemctl status club-corra-api --no-pager -l

# View recent logs
sudo journalctl -u club-corra-api -n 50

# Check if port is in use
sudo netstat -tlnp | grep :8080
```

#### **Common Causes & Solutions**

**A. Missing Dependencies**
```bash
# Check if Node.js is available
which node
node --version

# Check if dependencies are installed
ls -la /opt/club-corra-api/node_modules/@nestjs/

# Reinstall dependencies
cd /opt/club-corra-api
rm -rf node_modules
yarn install --production
```

**B. Environment File Issues**
```bash
# Check if .env file exists
ls -la /opt/club-corra-api/.env

# Check environment variables
cat /opt/club-corra-api/.env | grep -E "(DATABASE_URL|JWT_SECRET|PORT)"

# Verify file permissions
ls -la /opt/club-corra-api/.env
```

**C. Permission Issues**
```bash
# Fix ownership
sudo chown -R ec2-user:ec2-user /opt/club-corra-api

# Fix permissions
sudo chmod -R 755 /opt/club-corra-api
sudo chmod 600 /opt/club-corra-api/.env
```

**D. Manual Start Test**
```bash
# Try to start manually
cd /opt/club-corra-api
NODE_ENV=production node dist/src/main.js

# Check for specific errors
NODE_ENV=production node --trace-warnings dist/src/main.js
```

#### **Advanced Troubleshooting**
```bash
# Use the built-in troubleshoot flag
./scripts/deployment/deploy-production-ec2.sh --troubleshoot

# Debug workspace setup
./scripts/deployment/deploy-production-ec2.sh --debug

# Check system resources
/opt/club-corra-monitoring/monitor-resources.sh
```

---

### **2. High Resource Usage**

#### **Symptoms**
- High CPU usage (>95%)
- High memory usage (>90%)
- High disk usage (>85%)
- Slow response times

#### **Immediate Actions**
```bash
# Check resource usage
/opt/club-corra-monitoring/monitor-resources.sh

# View real-time monitoring
tail -f /opt/club-corra-monitoring/resource-monitoring.log

# Check system resources
htop
free -h
df -h
```

#### **Common Causes & Solutions**

**A. Memory Leaks**
```bash
# Check Node.js memory usage
ps aux | grep node | grep -v grep

# Check for memory leaks in logs
grep -i "memory\|leak\|out of memory" /opt/club-corra-monitoring/resource-monitoring.log

# Restart service to clear memory
sudo systemctl restart club-corra-api
```

**B. High CPU Usage**
```bash
# Check top CPU processes
ps aux --sort=-%cpu | head -10

# Check for infinite loops or heavy operations
sudo journalctl -u club-corra-api --since "1 hour ago" | grep -i "error\|warning"

# Check Node.js event loop
curl -s http://localhost:8080/api/v1/health
```

**C. Disk Space Issues**
```bash
# Check disk usage by directory
sudo du -sh /opt/* | sort -hr
sudo du -sh /var/log/* | sort -hr

# Check for large log files
find /var/log -name "*.log" -size +100M
find /opt/club-corra-api -name "*.log" -size +100M

# Clean up old logs
sudo find /var/log -name "*.log.*" -mtime +7 -delete
```

#### **Prevention Measures**
```bash
# Setup automatic cleanup
./scripts/deployment/setup-log-rotation.sh --setup

# Monitor resource trends
tail -f /opt/club-corra-monitoring/resource-monitoring.log | grep -E "(DISK|MEMORY|CPU)"

# Set up alerts for thresholds
# (Already configured in setup-log-rotation.sh)
```

---

### **3. SSL/HTTPS Issues**

#### **Symptoms**
- SSL certificate errors
- HTTPS not working
- Mixed content warnings
- Certificate expiration errors

#### **Immediate Actions**
```bash
# Check certificate status
sudo certbot certificates

# Check nginx configuration
sudo nginx -t

# Check nginx status
sudo systemctl status nginx

# Check SSL configuration
sudo cat /etc/nginx/conf.d/club-corra-api.conf
```

#### **Common Causes & Solutions**

**A. Certificate Expired**
```bash
# Renew certificates
sudo certbot renew

# Check renewal status
sudo certbot certificates

# Restart nginx
sudo systemctl restart nginx
```

**B. Nginx Configuration Issues**
```bash
# Test configuration
sudo nginx -t

# Check for syntax errors
sudo cat /etc/nginx/conf.d/club-corra-api.conf

# Reload configuration
sudo systemctl reload nginx
```

**C. Domain Resolution Issues**
```bash
# Check if domain resolves
nslookup your-domain.com

# Check DNS A record
dig your-domain.com A

# Verify domain points to EC2 IP
curl -I http://your-domain.com
```

#### **SSL Testing**
```bash
# Test SSL configuration
curl -I https://your-domain.com

# Check SSL certificate details
openssl s_client -connect your-domain.com:443 -servername your-domain.com

# Test SSL labs (external)
# Visit: https://www.ssllabs.com/ssltest/
```

---

### **4. Database Connection Issues**

#### **Symptoms**
- Database connection errors
- API endpoints returning 500 errors
- Connection timeout errors

#### **Immediate Actions**
```bash
# Check database URL in environment
grep DATABASE_URL /opt/club-corra-api/.env

# Test database connectivity
curl -I http://localhost:8080/api/v1/health

# Check service logs for DB errors
sudo journalctl -u club-corra-api | grep -i "database\|connection\|timeout"
```

#### **Common Causes & Solutions**

**A. Invalid Database URL**
```bash
# Verify DATABASE_URL format
cat /opt/club-corra-api/.env | grep DATABASE_URL

# Test connection string
# (Check if username, password, host, port are correct)

# Update environment file if needed
sudo nano /opt/club-corra-api/.env
```

**B. Network/Firewall Issues**
```bash
# Check if port is accessible
telnet your-db-host your-db-port

# Check security groups (AWS)
# Verify EC2 security group allows outbound to database

# Test from EC2 to database
curl -I https://your-db-host:your-db-port
```

**C. Database Service Issues**
```bash
# Check if database is running
# (Depends on your database provider)

# Check database logs
# (Provider-specific commands)

# Verify database credentials
# (Test with database client)
```

---

### **5. Log Rotation Issues**

#### **Symptoms**
- Log files growing too large
- Disk space filling up
- Old logs not being cleaned up

#### **Immediate Actions**
```bash
# Check logrotate configuration
sudo logrotate -d /etc/logrotate.d/club-corra-api

# Check cron jobs
ls -la /etc/cron.*/club-corra-*

# Check log sizes
du -sh /var/log/club-corra-api/*.log 2>/dev/null
du -sh /opt/club-corra-api/logs/*.log 2>/dev/null
```

#### **Common Causes & Solutions**

**A. Logrotate Not Running**
```bash
# Check cron service
sudo systemctl status cron
sudo systemctl status crond

# Check cron logs
sudo tail -f /var/log/cron

# Manually run logrotate
sudo logrotate -f /etc/logrotate.d/club-corra-api
```

**B. Permission Issues**
```bash
# Fix log file permissions
sudo chown -R ec2-user:ec2-user /var/log/club-corra-api
sudo chmod -R 644 /var/log/club-corra-api/*.log

# Fix logrotate permissions
sudo chmod 644 /etc/logrotate.d/club-corra-api
```

**C. Configuration Issues**
```bash
# Verify logrotate config
sudo cat /etc/logrotate.d/club-corra-api

# Test configuration
sudo logrotate -d /etc/logrotate.d/club-corra-api

# Reinstall log rotation
./scripts/deployment/setup-log-rotation.sh --logs
```

---

### **6. Backup Issues**

#### **Symptoms**
- Backup directory filling up
- Old backups not being cleaned up
- Backup verification failures

#### **Immediate Actions**
```bash
# Check backup status
ls -la /opt/club-corra-api-backup/

# Check backup cleanup logs
tail -f /var/log/club-corra-backup-cleanup.log

# Run backup verification manually
/opt/club-corra-monitoring/verify-backups.sh
```

#### **Common Causes & Solutions**

**A. Backup Cleanup Not Running**
```bash
# Check cron jobs
ls -la /etc/cron.weekly/cleanup-club-corra-backups

# Check cron service
sudo systemctl status cron

# Manually run cleanup
/opt/club-corra-monitoring/cleanup-backups.sh
```

**B. Permission Issues**
```bash
# Fix backup directory permissions
sudo chown -R ec2-user:ec2-user /opt/club-corra-api-backup
sudo chmod -R 755 /opt/club-corra-api-backup

# Fix cleanup script permissions
sudo chmod +x /opt/club-corra-monitoring/cleanup-backups.sh
```

**C. Disk Space Issues**
```bash
# Check backup directory size
du -sh /opt/club-corra-api-backup

# Remove old backups manually
find /opt/club-corra-api-backup -name "backup-*" -mtime +30 -exec rm -rf {} \;

# Reinstall backup management
./scripts/deployment/setup-log-rotation.sh --backups
```

---

## 🔧 Diagnostic Commands

### **System Health Check**
```bash
# Comprehensive system check
echo "=== System Information ==="
uname -a
cat /etc/os-release

echo "=== Resource Usage ==="
df -h
free -h
top -bn1 | head -20

echo "=== Service Status ==="
sudo systemctl status club-corra-api nginx

echo "=== Network Status ==="
netstat -tlnp | grep -E "(8080|443|80)"
```

### **Application Health Check**
```bash
# Check application files
echo "=== Application Files ==="
ls -la /opt/club-corra-api/
ls -la /opt/club-corra-api/dist/

# Check dependencies
echo "=== Dependencies ==="
ls -la /opt/club-corra-api/node_modules/@nestjs/

# Check environment
echo "=== Environment ==="
ls -la /opt/club-corra-api/.env
grep -E "(NODE_ENV|PORT|DATABASE_URL)" /opt/club-corra-api/.env
```

### **Log Analysis**
```bash
# Check recent errors
echo "=== Recent Errors ==="
sudo journalctl -u club-corra-api --since "1 hour ago" | grep -i "error\|fail\|exception"

# Check nginx errors
echo "=== Nginx Errors ==="
sudo tail -20 /var/log/nginx/error.log

# Check resource monitoring
echo "=== Resource Monitoring ==="
tail -20 /opt/club-corra-monitoring/resource-monitoring.log
```

---

## 🚀 Recovery Procedures

### **Service Recovery**
```bash
# 1. Stop service
sudo systemctl stop club-corra-api

# 2. Clear any locks
sudo rm -f /opt/club-corra-api/*.lock

# 3. Restart service
sudo systemctl start club-corra-api

# 4. Check status
sudo systemctl status club-corra-api

# 5. Verify health
curl -I http://localhost:8080/api/v1/health
```

### **Rollback Procedure**
```bash
# 1. Stop current service
sudo systemctl stop club-corra-api

# 2. Rollback to previous deployment
./scripts/deployment/deploy-production-ec2.sh --rollback

# 3. Verify rollback
./scripts/deployment/deploy-production-ec2.sh --verify

# 4. Check service health
curl -I http://localhost:8080/api/v1/health
```

### **Complete Reset**
```bash
# 1. Stop all services
sudo systemctl stop club-corra-api nginx

# 2. Clean up application
sudo rm -rf /opt/club-corra-api

# 3. Reinstall everything
./scripts/deployment/setup-https-backend.sh
./scripts/deployment/setup-log-rotation.sh --setup
./scripts/deployment/deploy-production-ec2.sh

# 4. Verify installation
./scripts/deployment/deploy-production-ec2.sh --verify
```

---

## 📞 Escalation Path

### **Level 1: Basic Troubleshooting**
- Check service status
- View recent logs
- Run diagnostic commands
- Use built-in troubleshoot flags

### **Level 2: Advanced Troubleshooting**
- Manual service start testing
- Configuration file analysis
- Permission and ownership fixes
- Resource monitoring analysis

### **Level 3: System Recovery**
- Service rollback
- Complete reinstallation
- Configuration restoration
- Performance optimization

### **Level 4: DevOps Team**
- Complex dependency issues
- Network configuration problems
- Security incidents
- Performance bottlenecks

---

## 💡 Prevention Tips

### **Regular Maintenance**
- Monitor resource usage daily
- Check backup status weekly
- Verify SSL certificates monthly
- Review log rotation monthly

### **Monitoring Setup**
- Set up resource monitoring alerts
- Configure log size monitoring
- Monitor backup verification
- Track service health metrics

### **Documentation**
- Document all configuration changes
- Keep deployment logs
- Record troubleshooting steps
- Maintain runbooks for common issues

---

*This troubleshooting guide covers the most common issues. For additional support, refer to the main README.md documentation or contact the DevOps team.*
