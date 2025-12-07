# High Load Configuration Guide

This document describes the changes made to support high load scenarios with many concurrent users.

## Changes Made

### 1. Systemd Service File (`adventy.service`)

**Resource Limits Removed/Increased:**
- All resource limits set to `infinity` or maximum values
- Security restrictions relaxed (ProtectSystem and ProtectHome commented out)
- File descriptors: unlimited
- Memory: unlimited
- CPU: unlimited
- Process count: unlimited

**Important:** After updating the service file, you must:
```bash
sudo cp deployment/adventy.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl restart adventy.service
```

### 2. Nginx Configuration (`nginx/adventy.conf`)

**Changes Made:**
- **Keepalive connections**: Increased from 32 to 512
- **Keepalive requests**: Set to 10,000 per connection
- **Keepalive timeout**: Set to 75 seconds
- **Proxy timeouts**: Increased from 60s to 300s
- **Client timeouts**: Increased to 120s
- **Buffer sizes**: Increased for better performance
- **Connection pooling**: Enabled with proper headers

**Important:** After updating nginx config, you must:
```bash
sudo ./deployment/deploy-nginx.sh
# or manually:
sudo cp nginx/adventy.conf /etc/nginx/sites-available/adventy
sudo nginx -t
sudo systemctl restart nginx
```

### 3. Main Nginx Configuration (Optional but Recommended)

The main nginx configuration file (`/etc/nginx/nginx.conf`) may also need adjustments for high load. Check and update these settings:

```nginx
# At the top of /etc/nginx/nginx.conf
worker_processes auto;  # or set to number of CPU cores
worker_rlimit_nofile 65535;  # Increase file descriptor limit

events {
    worker_connections 4096;  # Increase from default 1024
    use epoll;  # Use efficient event model (Linux)
    multi_accept on;  # Accept multiple connections at once
}

http {
    # Increase buffer sizes
    client_body_buffer_size 128k;
    client_header_buffer_size 4k;
    large_client_header_buffers 4 32k;
    
    # Connection timeouts
    keepalive_timeout 75;
    keepalive_requests 10000;
    
    # ... rest of config
}
```

**To update main nginx config:**
```bash
sudo nano /etc/nginx/nginx.conf
# Make changes, then:
sudo nginx -t
sudo systemctl restart nginx
```

## System-Level Limits

You may also need to increase system-level limits:

### 1. File Descriptor Limits

Edit `/etc/security/limits.conf`:
```
www-data soft nofile 65535
www-data hard nofile 65535
root soft nofile 65535
root hard nofile 65535
```

### 2. System Limits

Edit `/etc/sysctl.conf`:
```
# Increase connection tracking
net.core.somaxconn = 4096
net.ipv4.tcp_max_syn_backlog = 4096

# Increase file descriptor limits
fs.file-max = 2097152

# TCP optimizations for high load
net.ipv4.tcp_fin_timeout = 30
net.ipv4.tcp_keepalive_time = 300
net.ipv4.tcp_max_tw_buckets = 2000000
net.ipv4.tcp_tw_reuse = 1
```

Apply changes:
```bash
sudo sysctl -p
```

## Monitoring

After applying these changes, monitor your application:

```bash
# Check service status
sudo systemctl status adventy.service

# Check nginx status
sudo systemctl status nginx

# Monitor resource usage
htop
# or
top

# Check file descriptors
sudo lsof -p $(pgrep -f "dotnet.*Api.dll") | wc -l

# Check nginx connections
sudo netstat -an | grep :80 | wc -l
```

## Troubleshooting

If the application still has issues under load:

1. **Check logs:**
   ```bash
   sudo journalctl -u adventy.service -f
   sudo tail -f /var/log/nginx/adventy_error.log
   ```

2. **Check system resources:**
   ```bash
   free -h  # Memory
   df -h    # Disk space
   ```

3. **Check for bottlenecks:**
   - Database connections
   - External API calls
   - Application code performance
   - Network bandwidth

4. **Consider horizontal scaling:**
   - Multiple application instances behind load balancer
   - Database connection pooling
   - Caching layer (Redis)

## Security Note

The changes relax some security restrictions to allow unlimited resource usage. In production:
- Monitor resource usage to prevent abuse
- Consider implementing rate limiting in nginx
- Set up proper monitoring and alerting
- Review security settings based on your threat model
