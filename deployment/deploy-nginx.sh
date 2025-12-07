#!/bin/bash
# Deployment pipeline script for Nginx configuration
# This script deploys nginx configuration and restarts nginx
# Usage: sudo ./deployment/deploy-nginx.sh [deployment-path]
# Default deployment path: /opt/adventy
#
# Pipeline stages:
#   1. Prerequisites check
#   2. Backup existing configuration
#   3. Deploy configuration
#   4. Enable site
#   5. Test configuration
#   6. Restart nginx
#   7. Verify deployment

set -e

# Configuration
DEFAULT_DEPLOY_PATH="/opt/adventy"
DEPLOY_PATH="${1:-$DEFAULT_DEPLOY_PATH}"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
NGINX_CONFIG_SOURCE="$REPO_ROOT/nginx/adventy.conf"
NGINX_SITES_AVAILABLE="/etc/nginx/sites-available"
NGINX_SITES_ENABLED="/etc/nginx/sites-enabled"
NGINX_CONFIG_TARGET="$NGINX_SITES_AVAILABLE/adventy"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper functions
log_stage() {
    echo ""
    echo -e "${GREEN}==========================================${NC}"
    echo -e "${GREEN}$1${NC}"
    echo -e "${GREEN}==========================================${NC}"
}

log_step() {
    echo -e "${YELLOW}→ $1${NC}"
}

log_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

log_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Start pipeline
echo ""
echo "=========================================="
echo "Nginx Configuration Deployment Pipeline"
echo "=========================================="
echo "Repository: $REPO_ROOT"
echo "Deployment path: $DEPLOY_PATH"
echo "Started at: $(date)"
echo ""

# Stage 1: Prerequisites Check
log_stage "Stage 1: Prerequisites Check"

log_step "Checking root privileges..."
if [ "$EUID" -ne 0 ]; then
    log_error "This script must be run with sudo"
    echo "Usage: sudo ./deployment/deploy-nginx.sh"
    exit 1
fi
log_success "Root privileges confirmed"

log_step "Checking nginx installation..."
if ! command -v nginx &> /dev/null; then
    log_error "Nginx is not installed"
    echo "Please run: sudo ./deployment/install-nginx.sh"
    exit 1
fi
log_success "Nginx found: $(nginx -v 2>&1 | head -n 1)"

log_step "Checking configuration source..."
if [ ! -f "$NGINX_CONFIG_SOURCE" ]; then
    log_error "Nginx configuration file not found at $NGINX_CONFIG_SOURCE"
    exit 1
fi
log_success "Configuration source found"

# Stage 2: Backup Existing Configuration
log_stage "Stage 2: Backup Existing Configuration"

if [ -f "$NGINX_CONFIG_TARGET" ]; then
    BACKUP_FILE="${NGINX_CONFIG_TARGET}.backup.$(date +%Y%m%d_%H%M%S)"
    log_step "Backing up existing configuration..."
    cp "$NGINX_CONFIG_TARGET" "$BACKUP_FILE"
    log_success "Backup saved to: $BACKUP_FILE"
else
    log_success "No existing configuration to backup"
fi

# Stage 3: Deploy Configuration
log_stage "Stage 3: Deploy Configuration"

log_step "Copying nginx configuration..."
cp "$NGINX_CONFIG_SOURCE" "$NGINX_CONFIG_TARGET"
log_success "Configuration copied to: $NGINX_CONFIG_TARGET"

log_step "Updating deployment path in configuration..."
sed -i "s|/opt/adventy|$DEPLOY_PATH|g" "$NGINX_CONFIG_TARGET"
log_success "Deployment path updated to: $DEPLOY_PATH"

# Stage 4: Enable Site
log_stage "Stage 4: Enable Site"

log_step "Creating symlink to enable site..."
if [ -L "$NGINX_SITES_ENABLED/adventy" ]; then
    rm "$NGINX_SITES_ENABLED/adventy"
    log_success "Removed existing symlink"
fi

ln -s "$NGINX_CONFIG_TARGET" "$NGINX_SITES_ENABLED/adventy"
log_success "Site enabled: $NGINX_SITES_ENABLED/adventy"

log_step "Checking default site..."
if [ -L "$NGINX_SITES_ENABLED/default" ]; then
    echo ""
    read -p "Remove default nginx site? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm "$NGINX_SITES_ENABLED/default"
        log_success "Default site removed"
    else
        log_success "Keeping default site"
    fi
else
    log_success "Default site is not enabled"
fi

# Stage 5: Test Configuration
log_stage "Stage 5: Test Configuration"

log_step "Testing nginx configuration..."
if nginx -t 2>&1; then
    log_success "Configuration test passed"
else
    log_error "Configuration test failed"
    echo "Please check the configuration file: $NGINX_CONFIG_TARGET"
    exit 1
fi

# Stage 6: Restart Nginx
log_stage "Stage 6: Restart Nginx"

log_step "Restarting nginx..."
if systemctl is-active --quiet nginx; then
    systemctl restart nginx
    log_success "Nginx restarted"
else
    systemctl start nginx
    log_success "Nginx started"
fi

log_step "Ensuring nginx is enabled on boot..."
if ! systemctl is-enabled nginx >/dev/null 2>&1; then
    systemctl enable nginx
    log_success "Nginx enabled to start on boot"
else
    log_success "Nginx is already enabled"
fi

# Stage 7: Verify Deployment
log_stage "Stage 7: Verify Deployment"

log_step "Checking nginx status..."
sleep 2  # Give nginx a moment to start
if systemctl is-active --quiet nginx; then
    log_success "Nginx is running"
    echo ""
    systemctl status nginx --no-pager -l | head -n 10
else
    log_error "Nginx is not running"
    echo ""
    systemctl status nginx --no-pager -l | head -n 20
    exit 1
fi

# Pipeline Complete
echo ""
echo "=========================================="
log_success "Deployment Pipeline Complete!"
echo "=========================================="
echo "Configuration file: $NGINX_CONFIG_TARGET"
echo "Enabled site: $NGINX_SITES_ENABLED/adventy"
echo "Completed at: $(date)"
echo ""
echo "To view logs:"
echo "  sudo tail -f /var/log/nginx/adventy_access.log"
echo "  sudo tail -f /var/log/nginx/adventy_error.log"
echo ""
echo "To edit configuration:"
echo "  sudo nano $NGINX_CONFIG_TARGET"
echo "  sudo nginx -t && sudo systemctl reload nginx"
echo "=========================================="
