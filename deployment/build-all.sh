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

# Cleanup build folders
echo "=========================================="
echo "Cleaning Build Folders"
echo "=========================================="

# Clean backend publish folder
if [ -d "$BUILD_OUTPUT_DIR" ]; then
    echo "Cleaning backend build output: $BUILD_OUTPUT_DIR"
    rm -rf "$BUILD_OUTPUT_DIR"
fi

# Clean frontend build output
if [ -d "$CLIENT_APP_PATH/wwwroot" ]; then
    echo "Cleaning frontend build output: $CLIENT_APP_PATH/wwwroot"
    rm -rf "$CLIENT_APP_PATH/wwwroot"
fi

# Clean .NET build artifacts (bin and obj folders)
if [ -d "$API_PATH/bin" ]; then
    echo "Cleaning .NET bin folder: $API_PATH/bin"
    rm -rf "$API_PATH/bin"
fi

if [ -d "$API_PATH/obj" ]; then
    echo "Cleaning .NET obj folder: $API_PATH/obj"
    rm -rf "$API_PATH/obj"
fi

# Clean Vite cache
if [ -d "$CLIENT_APP_PATH/node_modules/.vite" ]; then
    echo "Cleaning Vite cache: $CLIENT_APP_PATH/node_modules/.vite"
    rm -rf "$CLIENT_APP_PATH/node_modules/.vite"
fi

echo "Build folders cleaned"
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

# Ensure we're not in production mode (which skips devDependencies)
# This is important because vite is in devDependencies and we need it to build
unset NODE_ENV 2>/dev/null || true
export NODE_ENV=""

# Show current directory and npm/node versions
echo "Working directory: $(pwd)"
echo "Node version: $(node --version)"
echo "npm version: $(npm --version)"
echo ""

# Install frontend dependencies
# Always ensure dependencies are installed/up-to-date
if [ ! -d "node_modules" ] || [ ! -f "node_modules/.bin/vite" ]; then
    echo "Installing frontend dependencies (including devDependencies)..."
    echo "This may take a few minutes depending on your internet connection..."
    echo ""

    # Show what will be installed
    if [ -f "package.json" ]; then
        echo "Packages to install:"
        echo "  Dependencies: $(grep -A 10 '"dependencies"' package.json | grep -c '":' || echo '0')"
        echo "  DevDependencies: $(grep -A 10 '"devDependencies"' package.json | grep -c '":' || echo '0')"
        echo ""
    fi

    echo "Starting npm install (this will show progress)..."
    echo "You should see package names being downloaded and installed."
    echo "----------------------------------------"
    echo ""

    # Install all dependencies including devDependencies
    # Since NODE_ENV is unset, devDependencies will be installed by default
    # --loglevel=info shows what's being installed
    # --progress=true shows download progress bars
    npm install --loglevel=info --progress=true

    if [ $? -ne 0 ]; then
        echo ""
        echo "Error: npm install failed (exit code: $NPM_EXIT_CODE)"
        echo "Trying to clean and reinstall..."
        echo "Removing node_modules and package-lock.json..."
        rm -rf node_modules package-lock.json
        echo "Reinstalling dependencies..."
        npm install --loglevel=info --progress=true
        if [ $? -ne 0 ]; then
            echo ""
            echo "Error: npm install failed after cleanup"
            echo "Please check:"
            echo "  - Internet connection"
            echo "  - npm registry access"
            echo "  - Disk space"
            exit 1
        fi
    fi
    echo ""
    echo "Dependencies installed successfully!"
else
    echo "Frontend dependencies already installed"
    echo "Verifying vite is available..."
    if [ ! -f "node_modules/.bin/vite" ]; then
        echo "Warning: vite not found, reinstalling dependencies..."
        echo "Installing packages (showing progress)..."
        npm install --loglevel=info --progress=true
    fi
fi

# Verify vite is available
if [ ! -f "node_modules/.bin/vite" ]; then
    echo "Error: vite is not installed after npm install"
    echo "Checking package.json..."
    if grep -q '"vite"' package.json; then
        echo "vite is in package.json, but not installed"
        echo "Trying to install vite explicitly..."
        npm install vite @vitejs/plugin-react --save-dev
        if [ $? -ne 0 ]; then
            echo "Error: Could not install vite"
            echo "Please check npm and node versions:"
            echo "  node: $(node --version)"
            echo "  npm: $(npm --version)"
            exit 1
        fi
    else
        echo "Error: vite is not in package.json"
        exit 1
    fi
fi

echo "Frontend dependencies verified (vite found)"

# Build the React app
echo ""
echo "Building React application..."
echo "This may take a minute..."
echo "----------------------------------------"
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

