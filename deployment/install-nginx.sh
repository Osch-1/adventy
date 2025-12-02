#!/bin/bash
# Install and configure nginx on Ubuntu
# This script installs nginx and sets up basic configuration
# Run this script with sudo privileges

set -e

echo "=========================================="
echo "Installing Nginx for Adventy"
echo "=========================================="

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then
    echo "Please run this script with sudo: sudo ./install-nginx.sh"
    exit 1
fi

# Update package list
echo "Updating package list..."
apt-get update -y

# Install nginx
echo "Installing nginx..."
if command -v nginx &> /dev/null; then
    NGINX_VERSION=$(nginx -v 2>&1 | cut -d'/' -f2)
    echo "Nginx is already installed: $NGINX_VERSION"
    echo "Checking if update is needed..."
    apt-get install -y nginx
else
    apt-get install -y nginx
    echo "Nginx installed successfully"
fi

# Start and enable nginx
echo "Starting nginx service..."
systemctl start nginx
systemctl enable nginx

# Check nginx status
if systemctl is-active --quiet nginx; then
    echo "Nginx is running"
else
    echo "Warning: Nginx is not running. Check status with: sudo systemctl status nginx"
fi

# Display nginx version
NGINX_VERSION=$(nginx -v 2>&1 | cut -d'/' -f2)
echo ""
echo "=========================================="
echo "Installation Summary"
echo "=========================================="
echo "Nginx version: $NGINX_VERSION"
echo "Status: $(systemctl is-active nginx)"
echo ""
echo "Nginx is installed and ready!"
echo ""
echo "Next steps:"
echo "1. Deploy nginx configuration:"
echo "   sudo ./deployment/deploy-nginx.sh"
echo "2. Or manually configure:"
echo "   sudo cp nginx/adventy.conf /etc/nginx/sites-available/adventy"
echo "   sudo nano /etc/nginx/sites-available/adventy"
echo "   sudo ln -s /etc/nginx/sites-available/adventy /etc/nginx/sites-enabled/"
echo "   sudo nginx -t"
echo "   sudo systemctl reload nginx"
echo "=========================================="

