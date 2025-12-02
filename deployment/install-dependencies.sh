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
    # Add Microsoft package repository
    echo "Adding Microsoft package repository..."
    UBUNTU_VERSION=$(lsb_release -rs)
    echo "Detected Ubuntu version: $UBUNTU_VERSION"

    # Download and install Microsoft package repository
    wget https://packages.microsoft.com/config/ubuntu/${UBUNTU_VERSION}/packages-microsoft-prod.deb -O packages-microsoft-prod.deb
    dpkg -i packages-microsoft-prod.deb
    rm packages-microsoft-prod.deb

    # Update package list
    echo "Updating package list..."
    apt-get update -y

    # Try to install .NET SDK 9.0, fallback to latest if not available
    echo "Attempting to install .NET SDK 9.0..."
    if apt-cache search dotnet-sdk-9.0 | grep -q "dotnet-sdk-9.0"; then
        apt-get install -y dotnet-sdk-9.0
        echo ".NET SDK 9.0 installed successfully"
    else
        echo "Warning: .NET SDK 9.0 not found in repository"
        echo "Checking available .NET SDK versions..."
        apt-cache search dotnet-sdk | grep -E "dotnet-sdk-[0-9]" | head -5

        echo ""
        echo "Attempting alternative installation method using official dotnet-install script..."

        # Install prerequisites for dotnet-install script
        apt-get install -y libicu-dev libssl-dev

        # Use official dotnet-install script
        DOTNET_INSTALL_DIR="/usr/share/dotnet"
        mkdir -p "$DOTNET_INSTALL_DIR"

        echo "Downloading and running dotnet-install script..."
        curl -sSL https://dot.net/v1/dotnet-install.sh | bash /dev/stdin \
            --version latest \
            --channel 9.0 \
            --install-dir "$DOTNET_INSTALL_DIR" \
            --no-path

        # Add dotnet to PATH for current session
        export PATH="$DOTNET_INSTALL_DIR:$PATH"

        # Create symlink or add to PATH permanently
        if [ ! -f /usr/local/bin/dotnet ]; then
            ln -s "$DOTNET_INSTALL_DIR/dotnet" /usr/local/bin/dotnet 2>/dev/null || true
        fi

        # Verify installation
        if [ -f "$DOTNET_INSTALL_DIR/dotnet" ]; then
            INSTALLED_VERSION=$("$DOTNET_INSTALL_DIR/dotnet" --version 2>/dev/null || echo "unknown")
            echo ".NET SDK installed via dotnet-install script (version: $INSTALLED_VERSION)"

            # Verify it's accessible
            if command -v dotnet &> /dev/null; then
                echo ".NET SDK is now available in PATH"
            else
                echo "Warning: .NET SDK installed but may not be in PATH"
                echo "Add to PATH: export PATH=\"$DOTNET_INSTALL_DIR:\$PATH\""
            fi
        else
            echo "Error: Could not install .NET SDK using dotnet-install script"
            echo ""
            echo "Please install manually:"
            echo "1. Visit: https://dotnet.microsoft.com/download/dotnet/9.0"
            echo "2. Or run manually:"
            echo "   curl -sSL https://dot.net/v1/dotnet-install.sh | bash /dev/stdin --version latest --channel 9.0"
            exit 1
        fi
    fi
else
    DOTNET_VERSION=$(dotnet --version)
    echo ".NET SDK is already installed: $DOTNET_VERSION"
    echo "Checking installed SDKs..."
    dotnet --list-sdks

    if ! dotnet --list-sdks | grep -q "9.0"; then
        echo ""
        echo "Warning: .NET SDK 9.0 not found in installed SDKs"
        echo "Current runtime version: $DOTNET_VERSION"
        echo ""
        echo "To install .NET SDK 9.0, you can:"
        echo "1. Run: sudo apt-get install -y dotnet-sdk-9.0"
        echo "2. Or use: curl -sSL https://dot.net/v1/dotnet-install.sh | bash /dev/stdin --version 9.0.0 --channel 9.0"
    else
        echo ".NET SDK 9.0 is already installed"
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

