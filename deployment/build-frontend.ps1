# Build script for React frontend
# This script builds the React app and outputs to src/Api/ClientApp/wwwroot
# Run this script from the repository root

Write-Host "Building React frontend..." -ForegroundColor Green

$clientAppPath = "src\Api\ClientApp"

if (-not (Test-Path $clientAppPath)) {
    Write-Host "Error: ClientApp folder not found at $clientAppPath" -ForegroundColor Red
    Write-Host "Make sure you're running this script from the repository root." -ForegroundColor Yellow
    exit 1
}

Push-Location $clientAppPath

try {
    # Cleanup build folders
    Write-Host "Cleaning build folders..." -ForegroundColor Yellow

    # Clean frontend build output
    if (Test-Path "wwwroot") {
        Write-Host "Cleaning frontend build output: wwwroot" -ForegroundColor Yellow
        Remove-Item -Recurse -Force "wwwroot"
    }

    # Clean Vite cache
    if (Test-Path "node_modules\.vite") {
        Write-Host "Cleaning Vite cache: node_modules\.vite" -ForegroundColor Yellow
        Remove-Item -Recurse -Force "node_modules\.vite"
    }

    Write-Host "Build folders cleaned" -ForegroundColor Green
    Write-Host ""

    # Check if node_modules exists, if not, run npm install
    if (-not (Test-Path "node_modules")) {
        Write-Host "Installing dependencies..." -ForegroundColor Yellow
        npm install
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Error: npm install failed" -ForegroundColor Red
            exit 1
        }
    }

    # Build the React app
    Write-Host "Running build..." -ForegroundColor Yellow
    npm run build

    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: Build failed" -ForegroundColor Red
        exit 1
    }

    Write-Host "Build completed successfully!" -ForegroundColor Green
    Write-Host "Output directory: $clientAppPath\wwwroot" -ForegroundColor Cyan
}
catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
finally {
    Pop-Location
}

