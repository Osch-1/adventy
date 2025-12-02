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
    wget https://packages.microsoft.com/config/ubuntu/$(lsb_release -rs)/packages-microsoft-prod.deb -O packages-microsoft-prod.deb
    dpkg -i packages-microsoft-prod.deb
    rm packages-microsoft-prod.deb

    # Update package list
    apt-get update -y

    # Install .NET SDK 9.0
    apt-get install -y dotnet-sdk-9.0

    echo ".NET SDK 9.0 installed successfully"
else
    DOTNET_VERSION=$(dotnet --version)
    echo ".NET SDK is already installed: $DOTNET_VERSION"
    echo "Checking if version 9.0 is installed..."
    if ! dotnet --list-sdks | grep -q "9.0"; then
        echo "Warning: .NET SDK 9.0 not found. Current version: $DOTNET_VERSION"
        echo "Please install .NET SDK 9.0 manually or update this script."
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

# Display installed versions
echo ""
echo "=========================================="
echo "Installation Summary"
echo "=========================================="
echo ".NET SDK: $(dotnet --version)"
echo "Node.js: $(node --version)"
echo "npm: $(npm --version)"
echo ""
echo "All dependencies installed successfully!"
echo "=========================================="

