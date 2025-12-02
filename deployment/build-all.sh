#!/bin/bash
# Build script for Adventy application
# This script builds both backend (.NET) and frontend (React) and copies everything to a deployment folder
# Usage: ./build-all.sh [deployment-path]
# Default deployment path: /opt/adventy

set -e

# Configuration
DEFAULT_DEPLOY_PATH="/opt/adventy"
DEPLOY_PATH="${1:-$DEFAULT_DEPLOY_PATH}"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CLIENT_APP_PATH="$REPO_ROOT/src/Api/ClientApp"
API_PATH="$REPO_ROOT/src/Api"
BUILD_OUTPUT_DIR="$REPO_ROOT/publish"

echo "=========================================="
echo "Building Adventy Application"
echo "=========================================="
echo "Repository root: $REPO_ROOT"
echo "Deployment path: $DEPLOY_PATH"
echo ""

# Check if required tools are installed
echo "Checking prerequisites..."
if ! command -v dotnet &> /dev/null; then
    echo "Error: .NET SDK is not installed"
    echo "Please run: sudo ./deployment/install-dependencies.sh"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed"
    echo "Please run: sudo ./deployment/install-dependencies.sh"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "Error: npm is not installed"
    echo "Please run: sudo ./deployment/install-dependencies.sh"
    exit 1
fi

echo "Prerequisites check passed"
echo ""

# Step 1: Build Frontend
echo "=========================================="
echo "Step 1: Building Frontend"
echo "=========================================="

if [ ! -d "$CLIENT_APP_PATH" ]; then
    echo "Error: ClientApp folder not found at $CLIENT_APP_PATH"
    exit 1
fi

cd "$CLIENT_APP_PATH" || exit 1

# Install frontend dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "Error: npm install failed"
        exit 1
    fi
fi

# Build the React app
echo "Building React application..."
npm run build

if [ $? -ne 0 ]; then
    echo "Error: Frontend build failed"
    exit 1
fi

if [ ! -d "wwwroot" ]; then
    echo "Error: Frontend build output (wwwroot) not found"
    exit 1
fi

echo "Frontend build completed successfully"
echo ""

# Step 2: Build Backend
echo "=========================================="
echo "Step 2: Building Backend"
echo "=========================================="

cd "$REPO_ROOT" || exit 1

# Restore dependencies
echo "Restoring .NET dependencies..."
dotnet restore

if [ $? -ne 0 ]; then
    echo "Error: dotnet restore failed"
    exit 1
fi

# Build and publish the API
echo "Building and publishing .NET application..."
dotnet publish "$API_PATH/Api.csproj" \
    --configuration Release \
    --output "$BUILD_OUTPUT_DIR" \
    --self-contained false \
    --runtime linux-x64

if [ $? -ne 0 ]; then
    echo "Error: Backend build failed"
    exit 1
fi

echo "Backend build completed successfully"
echo ""

# Step 3: Copy to deployment folder
echo "=========================================="
echo "Step 3: Copying to Deployment Folder"
echo "=========================================="

# Create deployment directory if it doesn't exist
echo "Creating deployment directory: $DEPLOY_PATH"
mkdir -p "$DEPLOY_PATH"

# Copy backend files
echo "Copying backend files..."
cp -r "$BUILD_OUTPUT_DIR"/* "$DEPLOY_PATH/"

# Ensure wwwroot exists in deployment
if [ ! -d "$DEPLOY_PATH/wwwroot" ]; then
    mkdir -p "$DEPLOY_PATH/wwwroot"
fi

# Copy frontend build output
echo "Copying frontend files..."
cp -r "$CLIENT_APP_PATH/wwwroot"/* "$DEPLOY_PATH/wwwroot/"

# Copy appsettings.json if it exists
if [ -f "$API_PATH/appsettings.json" ]; then
    echo "Copying appsettings.json..."
    cp "$API_PATH/appsettings.json" "$DEPLOY_PATH/"
fi

# Set proper permissions
echo "Setting permissions..."
chown -R www-data:www-data "$DEPLOY_PATH" 2>/dev/null || echo "Warning: Could not set ownership (may need sudo)"

echo ""
echo "=========================================="
echo "Build and Deployment Complete!"
echo "=========================================="
echo "Application files copied to: $DEPLOY_PATH"
echo ""
echo "Next steps:"
echo "1. Configure the application in: $DEPLOY_PATH/appsettings.json"
echo "2. Install and configure the systemd service:"
echo "   sudo cp deployment/adventy.service /etc/systemd/system/"
echo "   sudo systemctl daemon-reload"
echo "   sudo systemctl enable adventy.service"
echo "   sudo systemctl start adventy.service"
echo "3. Configure nginx using files in nginx/ folder"
echo "=========================================="

