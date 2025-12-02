#!/bin/bash
# Install all required dependencies for building and running .NET application on Ubuntu
# This script installs:
# - .NET SDK 9.0
# - Node.js (via nvm or direct installation)
# - npm
# Run this script with sudo privileges

set -e

echo "=========================================="
echo "Installing dependencies for Adventy"
echo "=========================================="

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then
    echo "Please run this script with sudo: sudo ./install-dependencies.sh"
    exit 1
fi

# Update package list
echo "Updating package list..."
apt-get update -y

# Install prerequisites
echo "Installing prerequisites..."
apt-get install -y \
    wget \
    curl \
    gnupg \
    ca-certificates \
    software-properties-common \
    apt-transport-https

# Install .NET SDK 9.0
echo "Installing .NET SDK 9.0..."
if ! command -v dotnet &> /dev/null; then
    echo "Using official dotnet-install script (most reliable method)..."

    # Install prerequisites for dotnet-install script
    echo "Installing prerequisites..."
    apt-get install -y libicu-dev libssl-dev || true

    # Use official dotnet-install script - install directly to system directory
    DOTNET_INSTALL_DIR="/usr/share/dotnet"
    mkdir -p "$DOTNET_INSTALL_DIR"

    echo "Downloading and running dotnet-install script..."
    echo "This may take a few minutes..."

    # Temporarily disable exit on error for this section
    set +e
    curl -sSL https://dot.net/v1/dotnet-install.sh | bash /dev/stdin \
        --version latest \
        --channel 9.0 \
        --install-dir "$DOTNET_INSTALL_DIR"
    INSTALL_EXIT_CODE=$?
    set -e

    if [ $INSTALL_EXIT_CODE -eq 0 ] && [ -f "$DOTNET_INSTALL_DIR/dotnet" ]; then
        # Create symlink for system-wide access
        if [ ! -f /usr/local/bin/dotnet ]; then
            ln -sf "$DOTNET_INSTALL_DIR/dotnet" /usr/local/bin/dotnet
        fi

        # Add to PATH for current session
        export PATH="$DOTNET_INSTALL_DIR:$PATH"
        export PATH="/usr/local/bin:$PATH"

        # Verify installation
        if "$DOTNET_INSTALL_DIR/dotnet" --version > /dev/null 2>&1; then
            INSTALLED_VERSION=$("$DOTNET_INSTALL_DIR/dotnet" --version)
            echo ".NET SDK installed successfully (version: $INSTALLED_VERSION)"
        else
            echo "Warning: .NET SDK installed but version check failed"
            echo "Location: $DOTNET_INSTALL_DIR/dotnet"
        fi
    else
        echo "Error: .NET SDK installation failed"
        echo ""
        echo "Please try manual installation:"
        echo "  curl -sSL https://dot.net/v1/dotnet-install.sh | bash /dev/stdin --version latest --channel 9.0"
        echo "  sudo ln -sf /usr/share/dotnet/dotnet /usr/local/bin/dotnet"
        exit 1
    fi
else
    DOTNET_VERSION=$(dotnet --version 2>/dev/null || echo "unknown")
    echo ".NET SDK is already installed: $DOTNET_VERSION"
    if command -v dotnet &> /dev/null && dotnet --list-sdks > /dev/null 2>&1; then
        echo "Checking installed SDKs..."
        dotnet --list-sdks
        if ! dotnet --list-sdks | grep -q "9.0"; then
            echo ""
            echo "Note: .NET SDK 9.0 not found in installed SDKs"
        else
            echo ".NET SDK 9.0 is already installed"
        fi
    fi
fi

# Install Node.js (LTS version)
echo "Installing Node.js..."
if ! command -v node &> /dev/null; then
    # Install Node.js 20.x LTS
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs

    echo "Node.js installed successfully"
else
    NODE_VERSION=$(node --version)
    echo "Node.js is already installed: $NODE_VERSION"
fi

# Verify npm is installed
if ! command -v npm &> /dev/null; then
    echo "Error: npm is not installed"
    exit 1
fi

# Verify .NET is accessible
if ! command -v dotnet &> /dev/null; then
    echo ""
    echo "Warning: dotnet command not found in PATH"
    echo "You may need to add it to your PATH or restart your shell"
    echo "Try: export PATH=\"/usr/share/dotnet:\$PATH\""
    echo "Or: export PATH=\"/usr/local/bin:\$PATH\""
else
    # Display installed versions
    echo ""
    echo "=========================================="
    echo "Installation Summary"
    echo "=========================================="
    echo ".NET SDK: $(dotnet --version 2>/dev/null || echo 'not in PATH')"
    if command -v dotnet &> /dev/null; then
        echo "Installed SDKs:"
        dotnet --list-sdks 2>/dev/null || echo "  (run 'dotnet --list-sdks' to see installed versions)"
    fi
    echo "Node.js: $(node --version)"
    echo "npm: $(npm --version)"
    echo ""
    echo "All dependencies installed successfully!"
    echo "=========================================="
fi

