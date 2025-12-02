# Troubleshooting Deployment Issues

## .NET SDK Installation Issues

### Issue: "Couldn't find any package by regex 'dotnet-sdk-9.0'"

This error occurs when the .NET SDK 9.0 package is not available in the Microsoft package repository for your Ubuntu version.

#### Solution 1: Use the Updated Installation Script

The `install-dependencies.sh` script has been updated to automatically fall back to the official `dotnet-install` script if the package is not available. Simply run:

```bash
sudo ./deployment/install-dependencies.sh
```

#### Solution 2: Manual Installation Using dotnet-install Script

If the automated script still fails, install manually:

```bash
# Install prerequisites
sudo apt-get update
sudo apt-get install -y wget curl libicu-dev libssl-dev

# Download and run dotnet-install script
curl -sSL https://dot.net/v1/dotnet-install.sh | bash /dev/stdin \
    --version latest \
    --channel 9.0 \
    --install-dir /usr/share/dotnet

# Add to PATH
export PATH="/usr/share/dotnet:$PATH"

# Create symlink for system-wide access
sudo ln -s /usr/share/dotnet/dotnet /usr/local/bin/dotnet

# Verify installation
dotnet --version
```

#### Solution 3: Install Specific .NET Version

If you need a specific version:

```bash
# List available versions
curl -sSL https://dot.net/v1/dotnet-install.sh | bash /dev/stdin --list-versions

# Install specific version (e.g., 9.0.100)
curl -sSL https://dot.net/v1/dotnet-install.sh | bash /dev/stdin \
    --version 9.0.100 \
    --install-dir /usr/share/dotnet
```

#### Solution 4: Check Ubuntu Version Compatibility

Some older Ubuntu versions may not have .NET 9.0 in the repository. Check your Ubuntu version:

```bash
lsb_release -a
```

For Ubuntu 20.04 or earlier, you may need to use the dotnet-install script method.

#### Solution 5: Verify Microsoft Repository

Ensure the Microsoft repository is properly configured:

```bash
# Check if repository is added
cat /etc/apt/sources.list.d/microsoft-prod.list

# If missing, add it manually
wget https://packages.microsoft.com/config/ubuntu/$(lsb_release -rs)/packages-microsoft-prod.deb
sudo dpkg -i packages-microsoft-prod.deb
sudo apt-get update

# Check available packages
apt-cache search dotnet-sdk
```

### Issue: "dotnet: command not found" After Installation

This means dotnet is installed but not in your PATH.

#### Solution:

```bash
# Add to current session
export PATH="/usr/share/dotnet:$PATH"

# Add permanently to ~/.bashrc or ~/.profile
echo 'export PATH="/usr/share/dotnet:$PATH"' >> ~/.bashrc
source ~/.bashrc

# Or create system-wide symlink
sudo ln -s /usr/share/dotnet/dotnet /usr/local/bin/dotnet
```

### Issue: Wrong .NET Version Installed

If a different version was installed than expected:

#### Check Installed Versions:

```bash
dotnet --list-sdks
dotnet --version
```

#### Install Additional SDK Version:

```bash
# Using apt (if available)
sudo apt-get install -y dotnet-sdk-9.0

# Or using dotnet-install script
curl -sSL https://dot.net/v1/dotnet-install.sh | bash /dev/stdin \
    --version latest \
    --channel 9.0
```

## Nginx Issues

### Issue: Nginx Configuration Test Fails

```bash
# Test configuration
sudo nginx -t

# Check error logs
sudo tail -f /var/log/nginx/error.log
```

Common fixes:
- Check file paths in configuration
- Ensure deployment directory exists
- Verify port 80/443 are not in use by another service

### Issue: 502 Bad Gateway

This usually means the .NET backend isn't running:

```bash
# Check if service is running
sudo systemctl status adventy.service

# Check backend directly
curl http://localhost:5000/api/Adventures

# View service logs
sudo journalctl -u adventy.service -n 50
```

## Build Issues

### Issue: Frontend Build Fails

```bash
# Clear node_modules and reinstall
cd src/Api/ClientApp
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Issue: Backend Build Fails

```bash
# Restore packages
dotnet restore

# Clean and rebuild
dotnet clean
dotnet build --configuration Release

# Check for specific errors
dotnet build --verbosity detailed
```

## Service Issues

### Issue: Service Won't Start

```bash
# Check service status
sudo systemctl status adventy.service

# View detailed logs
sudo journalctl -u adventy.service -n 100 --no-pager

# Check file permissions
ls -la /opt/adventy
sudo chown -R www-data:www-data /opt/adventy
```

### Issue: Port Already in Use

```bash
# Check what's using port 5000
sudo netstat -tlnp | grep 5000
sudo lsof -i :5000

# Change port in service file
sudo nano /etc/systemd/system/adventy.service
# Update: ASPNETCORE_URLS=http://localhost:NEW_PORT
sudo systemctl daemon-reload
sudo systemctl restart adventy.service
```

## Getting Help

If you continue to experience issues:

1. Check the logs:
   - Service logs: `sudo journalctl -u adventy.service`
   - Nginx logs: `sudo tail -f /var/log/nginx/adventy_error.log`
   - Application logs: Check `/opt/adventy` for log files

2. Verify all prerequisites:
   ```bash
   dotnet --version
   node --version
   npm --version
   nginx -v
   ```

3. Review the deployment documentation:
   - [DEPLOYMENT.md](./DEPLOYMENT.md)
   - [README.md](./README.md)

