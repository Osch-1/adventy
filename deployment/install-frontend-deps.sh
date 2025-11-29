#!/bin/bash
# Install dependencies for React frontend
# Run this script from the repository root

echo "Installing React frontend dependencies..."

CLIENT_APP_PATH="src/Api/ClientApp"

if [ ! -d "$CLIENT_APP_PATH" ]; then
    echo "Error: ClientApp folder not found at $CLIENT_APP_PATH"
    echo "Make sure you're running this script from the repository root."
    exit 1
fi

cd "$CLIENT_APP_PATH" || exit 1

echo "Running npm install..."
npm install

if [ $? -ne 0 ]; then
    echo "Error: npm install failed"
    exit 1
fi

echo "Dependencies installed successfully!"

