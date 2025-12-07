# Adventy Deployment Guide

This guide explains how to deploy the Adventy application on Ubuntu using the provided scripts.

## Prerequisites

- Ubuntu 20.04 or later
- sudo/root access
- Internet connection

## Quick Start

### Option 1: Single Deployment Scripts (Recommended)

For streamlined deployment using pipeline scripts that handle everything automatically:

```bash
# 1. Install all dependencies (one-time setup)
chmod +x deployment/install-dependencies.sh
sudo ./deployment/install-dependencies.sh

# 2. Deploy application (builds, copies, and restarts service)
chmod +x deployment/deploy-app.sh
sudo ./deployment/deploy-app.sh

# 3. Deploy nginx configuration (configures and restarts nginx)
chmod +x deployment/deploy-nginx.sh
sudo ./deployment/deploy-nginx.sh
```

**Note:** Both `deploy-app.sh` and `deploy-nginx.sh` are idempotent - you can run them multiple times safely. They will:
- Build and deploy the application
- Install/update the systemd service
- Restart services automatically
- Verify deployment status

### Option 2: Manual Step-by-Step Deployment

For a complete automated deployment using individual scripts:

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

## Production Server

**Production Domain:** http://2966415-bp32333.twc1.net/  
**Production IP:** http://81.17.154.37/

The application is deployed and accessible at both the domain and IP address. Use the domain URL for production access.

For testing instructions, see: [TESTING_GUIDE_RU.md](../docs/TESTING_GUIDE_RU.md)

### Domain and SSL Configuration

- **Domain Management:** See [DOMAIN_MANAGEMENT.md](DOMAIN_MANAGEMENT.md) for DNS setup and domain configuration
- **SSL Certificates:** See [SSL_CERTIFICATES.md](SSL_CERTIFICATES.md) for HTTPS setup and certificate management

## Single Deployment Scripts

The project includes two streamlined deployment pipeline scripts that automate the entire deployment process:

### `deploy-app.sh` - Application Deployment Pipeline

This script handles the complete application deployment lifecycle:

**Usage:**
```bash
sudo ./deployment/deploy-app.sh [deployment-path]
```

**Default deployment path:** `/opt/adventy`

**What it does:**
1. **Prerequisites Check** - Verifies .NET SDK, Node.js, and npm are installed
2. **Clean Build Artifacts** - Removes old build outputs
3. **Build Frontend** - Builds React application
4. **Build Backend** - Builds and publishes .NET application
5. **Deploy to Target Folder** - Copies all files to deployment directory
6. **Install/Update Service** - Installs or updates systemd service file
7. **Restart Service** - Restarts the application service
8. **Verify Deployment** - Checks service status

**Features:**
- ✅ Idempotent - safe to run multiple times
- ✅ Automatic service management
- ✅ Colored output for easy reading
- ✅ Error handling with clear messages
- ✅ Deployment verification

**Example:**
```bash
# Deploy to default path (/opt/adventy)
sudo ./deployment/deploy-app.sh

# Deploy to custom path
sudo ./deployment/deploy-app.sh /custom/path
```

### `deploy-nginx.sh` - Nginx Configuration Deployment Pipeline

This script handles nginx configuration deployment:

**Usage:**
```bash
sudo ./deployment/deploy-nginx.sh [deployment-path]
```

**Default deployment path:** `/opt/adventy`

**What it does:**
1. **Prerequisites Check** - Verifies root privileges and nginx installation
2. **Backup Existing Configuration** - Creates timestamped backup
3. **Deploy Configuration** - Copies and updates nginx config
4. **Enable Site** - Creates symlink to enable the site
5. **Test Configuration** - Validates nginx configuration
6. **Restart Nginx** - Restarts nginx service
7. **Verify Deployment** - Checks nginx status

**Features:**
- ✅ Idempotent - safe to run multiple times
- ✅ Automatic backup of existing config
- ✅ Configuration validation before deployment
- ✅ Colored output for easy reading
- ✅ Deployment verification

**Example:**
```bash
# Deploy nginx config for default path
sudo ./deployment/deploy-nginx.sh

# Deploy nginx config for custom path
sudo ./deployment/deploy-nginx.sh /custom/path
```

**Note:** Both scripts require sudo/root privileges for service management and file operations.

## Deployment Steps

Detailed step-by-step instructions (for manual deployment):

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
- `server_name`: Your domain name (currently configured for `2966415-bp32333.twc1.net` and IP access via `_`)
- `root`: Deployment path (default: `/opt/adventy/wwwroot`)
- `upstream server`: Backend port if different from 5000
- `ssl_certificate` paths: If using HTTPS (see [SSL_CERTIFICATES.md](SSL_CERTIFICATES.md))

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

### Using Single Deployment Script (Recommended)

Simply run the deployment script - it handles everything:

```bash
# Pull latest changes (if using git)
git pull

# Deploy application (builds, copies, and restarts service automatically)
sudo ./deployment/deploy-app.sh
```

The script will:
- Clean build artifacts
- Build frontend and backend
- Copy files to deployment folder
- Update service configuration if needed
- Restart the service automatically
- Verify deployment

### Manual Update Process

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

### Updating Nginx Configuration

If you need to update nginx configuration:

```bash
# Deploy nginx configuration (idempotent - safe to run multiple times)
sudo ./deployment/deploy-nginx.sh
```

This will:
- Backup existing configuration
- Deploy new configuration
- Test configuration
- Restart nginx automatically
- Verify deployment

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
2. **SSL/TLS**: Enable HTTPS in production (see [SSL_CERTIFICATES.md](SSL_CERTIFICATES.md) for detailed SSL setup)
3. **User Permissions**: The service runs as `www-data` with restricted permissions
4. **Updates**: Keep the system and dependencies updated:
   ```bash
   sudo apt-get update && sudo apt-get upgrade
   ```

## Additional Resources

- [Nginx Configuration Guide](../nginx/README.md)
- [SSL Certificates Guide](SSL_CERTIFICATES.md) - Complete guide for SSL/HTTPS setup
- [Domain Management Guide](DOMAIN_MANAGEMENT.md) - DNS configuration and domain setup
- [Systemd Service Documentation](https://www.freedesktop.org/software/systemd/man/systemd.service.html)
- [.NET Deployment Documentation](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/linux-nginx)

