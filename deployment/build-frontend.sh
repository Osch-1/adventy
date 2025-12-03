#!/bin/bash
# Build script for React frontend
# This script builds the React app and outputs to src/Api/ClientApp/wwwroot
# Run this script from the repository root

echo "Building React frontend..."

CLIENT_APP_PATH="src/Api/ClientApp"

if [ ! -d "$CLIENT_APP_PATH" ]; then
    echo "Error: ClientApp folder not found at $CLIENT_APP_PATH"
    echo "Make sure you're running this script from the repository root."
    exit 1
fi

cd "$CLIENT_APP_PATH" || exit 1

# Cleanup build folders
echo "Cleaning build folders..."

# Clean frontend build output
if [ -d "wwwroot" ]; then
    echo "Cleaning frontend build output: wwwroot"
    rm -rf wwwroot
fi

# Clean Vite cache
if [ -d "node_modules/.vite" ]; then
    echo "Cleaning Vite cache: node_modules/.vite"
    rm -rf node_modules/.vite
fi

echo "Build folders cleaned"
echo ""

# Check if node_modules exists, if not, run npm install
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "Error: npm install failed"
        exit 1
    fi
fi

# Build the React app
echo "Running build..."
npm run build

if [ $? -ne 0 ]; then
    echo "Error: Build failed"
    exit 1
fi

echo "Build completed successfully!"
echo "Output directory: $CLIENT_APP_PATH/wwwroot"

