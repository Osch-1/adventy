#!/bin/bash
# Deployment pipeline script for Adventy application
# This script builds, deploys, and restarts the application service
# Usage: sudo ./deployment/deploy-app.sh [deployment-path]
# Default deployment path: /opt/adventy
#
# Pipeline stages:
#   1. Prerequisites check
#   2. Clean build artifacts
#   3. Build frontend
#   4. Build backend
#   5. Deploy to target folder
#   6. Install/update service
#   7. Restart service
#   8. Verify deployment

set -e

# Configuration
DEFAULT_DEPLOY_PATH="/opt/adventy"
DEPLOY_PATH="${1:-$DEFAULT_DEPLOY_PATH}"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CLIENT_APP_PATH="$REPO_ROOT/src/Api/ClientApp"
API_PATH="$REPO_ROOT/src/Api"
BUILD_OUTPUT_DIR="$REPO_ROOT/publish"
SERVICE_NAME="adventy.service"
SERVICE_FILE="$REPO_ROOT/deployment/$SERVICE_NAME"
SYSTEMD_SERVICE_PATH="/etc/systemd/system/$SERVICE_NAME"

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
echo "Adventy Application Deployment Pipeline"
echo "=========================================="
echo "Repository: $REPO_ROOT"
echo "Deployment path: $DEPLOY_PATH"
echo "Started at: $(date)"
echo ""

# Stage 1: Prerequisites Check
log_stage "Stage 1: Prerequisites Check"

log_step "Checking .NET SDK..."
if ! command -v dotnet &> /dev/null; then
    log_error ".NET SDK is not installed"
    echo "Please run: sudo ./deployment/install-dependencies.sh"
    exit 1
fi
log_success ".NET SDK found: $(dotnet --version)"

log_step "Checking Node.js..."
if ! command -v node &> /dev/null; then
    log_error "Node.js is not installed"
    echo "Please run: sudo ./deployment/install-dependencies.sh"
    exit 1
fi
log_success "Node.js found: $(node --version)"

log_step "Checking npm..."
if ! command -v npm &> /dev/null; then
    log_error "npm is not installed"
    echo "Please run: sudo ./deployment/install-dependencies.sh"
    exit 1
fi
log_success "npm found: $(npm --version)"

# Stage 2: Clean Build Artifacts
log_stage "Stage 2: Clean Build Artifacts"

log_step "Cleaning backend build output..."
[ -d "$BUILD_OUTPUT_DIR" ] && rm -rf "$BUILD_OUTPUT_DIR" && log_success "Backend build output cleaned" || log_success "No backend build output to clean"

log_step "Cleaning frontend build output..."
[ -d "$CLIENT_APP_PATH/wwwroot" ] && rm -rf "$CLIENT_APP_PATH/wwwroot" && log_success "Frontend build output cleaned" || log_success "No frontend build output to clean"

log_step "Cleaning .NET build artifacts..."
[ -d "$API_PATH/bin" ] && rm -rf "$API_PATH/bin"
[ -d "$API_PATH/obj" ] && rm -rf "$API_PATH/obj"
log_success ".NET build artifacts cleaned"

log_step "Cleaning Vite cache..."
[ -d "$CLIENT_APP_PATH/node_modules/.vite" ] && rm -rf "$CLIENT_APP_PATH/node_modules/.vite"
log_success "Vite cache cleaned"

# Stage 3: Build Frontend
log_stage "Stage 3: Build Frontend"

if [ ! -d "$CLIENT_APP_PATH" ]; then
    log_error "ClientApp folder not found at $CLIENT_APP_PATH"
    exit 1
fi

cd "$CLIENT_APP_PATH" || exit 1

# Ensure devDependencies are installed (needed for vite)
unset NODE_ENV 2>/dev/null || true
export NODE_ENV=""

log_step "Checking frontend dependencies..."
if [ ! -d "node_modules" ] || [ ! -f "node_modules/.bin/vite" ]; then
    log_step "Frontend dependencies not found, installing..."
    echo "This may take a few minutes depending on your internet connection..."
    npm install --loglevel=info --progress=true
    
    if [ $? -ne 0 ]; then
        log_error "Frontend dependencies installation failed"
        echo "Trying to clean and reinstall..."
        rm -rf node_modules package-lock.json
        npm install --loglevel=info --progress=true
        if [ $? -ne 0 ]; then
            log_error "Frontend dependencies installation failed after cleanup"
            exit 1
        fi
    fi
    
    # Verify vite is available after install
    if [ ! -f "node_modules/.bin/vite" ]; then
        log_error "vite is not installed after npm install"
        if grep -q '"vite"' package.json; then
            log_step "Trying to install vite explicitly..."
            npm install vite @vitejs/plugin-react --save-dev
            if [ $? -ne 0 ]; then
                log_error "Could not install vite"
                exit 1
            fi
        else
            log_error "vite is not in package.json"
            exit 1
        fi
    fi
    log_success "Frontend dependencies installed"
else
    log_success "Frontend dependencies verified"
fi

log_step "Building React application..."
npm run build

if [ $? -ne 0 ] || [ ! -d "wwwroot" ]; then
    log_error "Frontend build failed"
    exit 1
fi
log_success "Frontend build completed"

# Stage 4: Build Backend
log_stage "Stage 4: Build Backend"

cd "$REPO_ROOT" || exit 1

log_step "Restoring .NET dependencies..."
dotnet restore
if [ $? -ne 0 ]; then
    log_error ".NET restore failed"
    exit 1
fi
log_success ".NET dependencies restored"

log_step "Building and publishing .NET application..."
dotnet publish "$API_PATH/Api.csproj" \
    --configuration Release \
    --output "$BUILD_OUTPUT_DIR" \
    --self-contained false \
    --runtime linux-x64

if [ $? -ne 0 ]; then
    log_error "Backend build failed"
    exit 1
fi
log_success "Backend build completed"

# Stage 5: Deploy to Target Folder
log_stage "Stage 5: Deploy to Target Folder"

log_step "Creating deployment directory..."
mkdir -p "$DEPLOY_PATH"
log_success "Deployment directory ready"

log_step "Copying backend files..."
cp -r "$BUILD_OUTPUT_DIR"/* "$DEPLOY_PATH/"
log_success "Backend files deployed"

log_step "Copying frontend files..."
mkdir -p "$DEPLOY_PATH/wwwroot"
cp -r "$CLIENT_APP_PATH/wwwroot"/* "$DEPLOY_PATH/wwwroot/"
log_success "Frontend files deployed"

log_step "Copying appsettings.json..."
if [ -f "$API_PATH/appsettings.json" ]; then
    cp "$API_PATH/appsettings.json" "$DEPLOY_PATH/"
    log_success "appsettings.json deployed"
else
    log_step "appsettings.json not found (skipping)"
fi

log_step "Setting permissions..."
if [ "$EUID" -eq 0 ]; then
    chown -R www-data:www-data "$DEPLOY_PATH" 2>/dev/null && log_success "Permissions set" || log_error "Failed to set permissions"
else
    log_step "Not running as root, skipping permission changes"
fi

# Stage 6: Install/Update Service
log_stage "Stage 6: Install/Update Service"

if [ "$EUID" -ne 0 ]; then
    log_error "Service management requires root privileges"
    echo "Please run with sudo: sudo ./deployment/deploy-app.sh"
    exit 1
fi

if [ ! -f "$SERVICE_FILE" ]; then
    log_error "Service file not found at $SERVICE_FILE"
    exit 1
fi

log_step "Installing/updating systemd service..."
if [ ! -f "$SYSTEMD_SERVICE_PATH" ] || ! cmp -s "$SERVICE_FILE" "$SYSTEMD_SERVICE_PATH"; then
    cp "$SERVICE_FILE" "$SYSTEMD_SERVICE_PATH"
    systemctl daemon-reload
    log_success "Service file installed/updated"
else
    log_success "Service file is up to date"
fi

log_step "Ensuring service is enabled..."
if ! systemctl is-enabled "$SERVICE_NAME" >/dev/null 2>&1; then
    systemctl enable "$SERVICE_NAME"
    log_success "Service enabled to start on boot"
else
    log_success "Service is already enabled"
fi

# Stage 7: Restart Service
log_stage "Stage 7: Restart Service"

log_step "Restarting service..."
if systemctl is-active --quiet "$SERVICE_NAME"; then
    systemctl restart "$SERVICE_NAME"
    log_success "Service restarted"
else
    systemctl start "$SERVICE_NAME"
    log_success "Service started"
fi

# Stage 8: Verify Deployment
log_stage "Stage 8: Verify Deployment"

log_step "Checking service status..."
sleep 2  # Give service a moment to start
if systemctl is-active --quiet "$SERVICE_NAME"; then
    log_success "Service is running"
    echo ""
    systemctl status "$SERVICE_NAME" --no-pager -l | head -n 10
else
    log_error "Service is not running"
    echo ""
    systemctl status "$SERVICE_NAME" --no-pager -l | head -n 20
    exit 1
fi

# Pipeline Complete
echo ""
echo "=========================================="
log_success "Deployment Pipeline Complete!"
echo "=========================================="
echo "Application deployed to: $DEPLOY_PATH"
echo "Service: $SERVICE_NAME"
echo "Completed at: $(date)"
echo ""
echo "To view logs: sudo journalctl -u $SERVICE_NAME -f"
echo "=========================================="
