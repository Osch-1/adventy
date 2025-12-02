# Adventy Deployment Guide

This guide explains how to deploy the Adventy application on Ubuntu using the provided scripts.

## Prerequisites

- Ubuntu 20.04 or later
- sudo/root access
- Internet connection

## Quick Start

For a complete automated deployment, run these commands in order:

```bash
# 1. Install all dependencies
chmod +x deployment/install-dependencies.sh
sudo ./deployment/install-dependencies.sh

# 2. Build and deploy application
chmod +x deployment/build-all.sh
sudo ./deployment/build-all.sh

# 3. Install and start service
chmod +x deployment/manage-service.sh
sudo ./deployment/manage-service.sh install
sudo ./deployment/manage-service.sh start

# 4. Install and configure nginx
chmod +x deployment/install-nginx.sh
chmod +x deployment/deploy-nginx.sh
sudo ./deployment/install-nginx.sh
sudo ./deployment/deploy-nginx.sh
```

Your application should now be accessible via HTTP on port 80 (and HTTPS on port 443 if SSL is configured).

## Deployment Steps

Detailed step-by-step instructions:

### Step 1: Install Dependencies

Install all required dependencies (.NET SDK 9.0, Node.js, npm):

```bash
cd /path/to/Adventy
chmod +x deployment/install-dependencies.sh
sudo ./deployment/install-dependencies.sh
```

This script will:
- Update package lists
- Install .NET SDK 9.0
- Install Node.js (LTS version)
- Install npm
- Verify all installations

**Note:** This script requires sudo privileges.

### Step 2: Build Application

Build both backend and frontend, and copy everything to the deployment folder:

```bash
chmod +x deployment/build-all.sh
sudo ./deployment/build-all.sh
```

By default, files will be copied to `/opt/adventy`. You can specify a custom path:

```bash
sudo ./deployment/build-all.sh /custom/path
```

This script will:
1. Build the React frontend (outputs to `wwwroot`)
2. Build and publish the .NET backend
3. Copy all files to the deployment folder
4. Set proper permissions

### Step 3: Configure Application

Edit the application settings if needed:

```bash
sudo nano /opt/adventy/appsettings.json
```

Update any configuration values as required for your environment.

### Step 4: Install Systemd Service

Install and start the systemd service:

```bash
# Copy service file
sudo cp deployment/adventy.service /etc/systemd/system/

# Reload systemd
sudo systemctl daemon-reload

# Enable service to start on boot
sudo systemctl enable adventy.service

# Start the service
sudo systemctl start adventy.service

# Check status
sudo systemctl status adventy.service
```

The service will run the application as the `www-data` user on `http://localhost:5000`.

### Step 5: Install and Configure Nginx

#### Option A: Using Deployment Scripts (Recommended)

1. **Install nginx:**

```bash
chmod +x deployment/install-nginx.sh
sudo ./deployment/install-nginx.sh
```

2. **Deploy nginx configuration:**

```bash
chmod +x deployment/deploy-nginx.sh
sudo ./deployment/deploy-nginx.sh
```

The deployment script will:
- Copy the configuration file
- Update the deployment path automatically
- Enable the site
- Test the configuration
- Reload nginx

#### Option B: Manual Configuration

1. **Install nginx:**

```bash
sudo apt-get update
sudo apt-get install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

2. **Copy nginx configuration:**

```bash
sudo cp nginx/adventy.conf /etc/nginx/sites-available/adventy
```

3. **Edit configuration:**

```bash
sudo nano /etc/nginx/sites-available/adventy
```

Update:
- `server_name`: Your domain name (or leave `_` for IP access)
- `root`: Deployment path (default: `/opt/adventy/wwwroot`)
- `upstream server`: Backend port if different from 5000
- `ssl_certificate` paths: If using HTTPS

4. **Enable site:**

```bash
sudo ln -s /etc/nginx/sites-available/adventy /etc/nginx/sites-enabled/
```

5. **Remove default site (optional):**

```bash
sudo rm /etc/nginx/sites-enabled/default
```

6. **Test and reload:**

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Service Management

### Start Service

```bash
sudo systemctl start adventy.service
```

### Stop Service

```bash
sudo systemctl stop adventy.service
```

### Restart Service

```bash
sudo systemctl restart adventy.service
```

### View Logs

```bash
# View service logs
sudo journalctl -u adventy.service -f

# View recent logs
sudo journalctl -u adventy.service -n 100
```

### Check Status

```bash
sudo systemctl status adventy.service
```

## Updating the Application

To update the application after making changes:

1. **Pull latest changes** (if using git):
```bash
git pull
```

2. **Rebuild and redeploy:**
```bash
sudo ./deployment/build-all.sh
```

3. **Restart the service:**
```bash
sudo systemctl restart adventy.service
```

## Troubleshooting

### Service Won't Start

1. Check service status:
```bash
sudo systemctl status adventy.service
```

2. Check logs:
```bash
sudo journalctl -u adventy.service -n 50
```

3. Verify file permissions:
```bash
ls -la /opt/adventy
```

4. Check if port 5000 is in use:
```bash
sudo netstat -tlnp | grep 5000
```

### Nginx 502 Bad Gateway

This usually means the backend isn't running:

1. Check if service is running:
```bash
sudo systemctl status adventy.service
```

2. Test backend directly:
```bash
curl http://localhost:5000/api/Adventures
```

3. Check nginx error logs:
```bash
sudo tail -f /var/log/nginx/adventy_error.log
```

### Permission Issues

If you encounter permission issues:

```bash
sudo chown -R www-data:www-data /opt/adventy
sudo chmod -R 755 /opt/adventy
```

### Port Already in Use

If port 5000 is already in use, you can:

1. Change the port in the service file:
```bash
sudo nano /etc/systemd/system/adventy.service
```

Update `ASPNETCORE_URLS=http://localhost:5000` to a different port.

2. Update nginx configuration to match:
```bash
sudo nano /etc/nginx/sites-available/adventy
```

Update the upstream server address.

3. Reload both:
```bash
sudo systemctl daemon-reload
sudo systemctl restart adventy.service
sudo systemctl reload nginx
```

## File Structure

After deployment, your `/opt/adventy` folder should contain:

```
/opt/adventy/
├── Api.dll                    # Main application DLL
├── Api.runtimeconfig.json     # Runtime configuration
├── appsettings.json           # Application settings
├── wwwroot/                   # React frontend build
│   ├── index.html
│   ├── assets/
│   └── ...
└── [other .NET runtime files]
```

## Security Considerations

1. **Firewall**: Configure your firewall to only allow necessary ports (80, 443)
2. **SSL/TLS**: Enable HTTPS in production (see nginx/README.md)
3. **User Permissions**: The service runs as `www-data` with restricted permissions
4. **Updates**: Keep the system and dependencies updated:
   ```bash
   sudo apt-get update && sudo apt-get upgrade
   ```

## Additional Resources

- [Nginx Configuration Guide](../nginx/README.md)
- [Systemd Service Documentation](https://www.freedesktop.org/software/systemd/man/systemd.service.html)
- [.NET Deployment Documentation](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/linux-nginx)

