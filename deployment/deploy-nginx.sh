#!/bin/bash
# Deploy nginx configuration for Adventy
# This script copies the nginx configuration and sets it up
# Usage: ./deploy-nginx.sh [deployment-path]
# Default deployment path: /opt/adventy
# Run this script with sudo privileges

set -e

# Configuration
DEFAULT_DEPLOY_PATH="/opt/adventy"
DEPLOY_PATH="${1:-$DEFAULT_DEPLOY_PATH}"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
NGINX_CONFIG_SOURCE="$REPO_ROOT/nginx/adventy.conf"
NGINX_SITES_AVAILABLE="/etc/nginx/sites-available"
NGINX_SITES_ENABLED="/etc/nginx/sites-enabled"
NGINX_CONFIG_TARGET="$NGINX_SITES_AVAILABLE/adventy"

echo "=========================================="
echo "Deploying Nginx Configuration for Adventy"
echo "=========================================="
echo "Repository root: $REPO_ROOT"
echo "Deployment path: $DEPLOY_PATH"
echo ""

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then
    echo "Error: This script must be run with sudo"
    echo "Usage: sudo ./deployment/deploy-nginx.sh"
    exit 1
fi

# Check if nginx is installed
if ! command -v nginx &> /dev/null; then
    echo "Error: Nginx is not installed"
    echo "Please run: sudo ./deployment/install-nginx.sh"
    exit 1
fi

# Check if source config file exists
if [ ! -f "$NGINX_CONFIG_SOURCE" ]; then
    echo "Error: Nginx configuration file not found at $NGINX_CONFIG_SOURCE"
    exit 1
fi

# Step 1: Backup existing configuration if it exists
if [ -f "$NGINX_CONFIG_TARGET" ]; then
    echo "Backing up existing configuration..."
    BACKUP_FILE="${NGINX_CONFIG_TARGET}.backup.$(date +%Y%m%d_%H%M%S)"
    cp "$NGINX_CONFIG_TARGET" "$BACKUP_FILE"
    echo "Backup saved to: $BACKUP_FILE"
fi

# Step 2: Copy configuration file
echo "Copying nginx configuration..."
cp "$NGINX_CONFIG_SOURCE" "$NGINX_CONFIG_TARGET"
echo "Configuration copied to: $NGINX_CONFIG_TARGET"

# Step 3: Update configuration with deployment path
echo "Updating configuration with deployment path..."
sed -i "s|/opt/adventy|$DEPLOY_PATH|g" "$NGINX_CONFIG_TARGET"
echo "Deployment path updated to: $DEPLOY_PATH"

# Step 4: Create symlink to enable site
echo "Enabling nginx site..."
if [ -L "$NGINX_SITES_ENABLED/adventy" ]; then
    echo "Symlink already exists, removing old one..."
    rm "$NGINX_SITES_ENABLED/adventy"
fi

ln -s "$NGINX_CONFIG_TARGET" "$NGINX_SITES_ENABLED/adventy"
echo "Site enabled"

# Step 5: Remove default site (optional, with confirmation)
if [ -L "$NGINX_SITES_ENABLED/default" ]; then
    echo ""
    read -p "Remove default nginx site? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm "$NGINX_SITES_ENABLED/default"
        echo "Default site removed"
    else
        echo "Keeping default site"
    fi
fi

# Step 6: Test nginx configuration
echo ""
echo "Testing nginx configuration..."
if nginx -t; then
    echo "Configuration test passed"
else
    echo "Error: Nginx configuration test failed"
    echo "Please check the configuration file: $NGINX_CONFIG_TARGET"
    exit 1
fi

# Step 7: Reload nginx
echo "Reloading nginx..."
systemctl reload nginx

if [ $? -eq 0 ]; then
    echo "Nginx reloaded successfully"
else
    echo "Warning: Nginx reload failed, trying restart..."
    systemctl restart nginx
fi

# Step 8: Display status
echo ""
echo "=========================================="
echo "Deployment Complete!"
echo "=========================================="
echo "Nginx configuration deployed successfully"
echo ""
echo "Configuration file: $NGINX_CONFIG_TARGET"
echo "Enabled site: $NGINX_SITES_ENABLED/adventy"
echo ""
echo "Nginx status:"
systemctl status nginx --no-pager -l | head -n 5
echo ""
echo "Important: Before using HTTPS, configure SSL certificates"
echo "See: nginx/README.md for SSL configuration instructions"
echo ""
echo "To edit configuration:"
echo "  sudo nano $NGINX_CONFIG_TARGET"
echo "  sudo nginx -t && sudo systemctl reload nginx"
echo ""
echo "To view logs:"
echo "  sudo tail -f /var/log/nginx/adventy_access.log"
echo "  sudo tail -f /var/log/nginx/adventy_error.log"
echo "=========================================="

