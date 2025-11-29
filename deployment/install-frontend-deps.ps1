# Install dependencies for React frontend
# Run this script from the repository root

Write-Host "Installing React frontend dependencies..." -ForegroundColor Green

$clientAppPath = "src\Api\ClientApp"

if (-not (Test-Path $clientAppPath)) {
    Write-Host "Error: ClientApp folder not found at $clientAppPath" -ForegroundColor Red
    Write-Host "Make sure you're running this script from the repository root." -ForegroundColor Yellow
    exit 1
}

Push-Location $clientAppPath

try {
    Write-Host "Running npm install..." -ForegroundColor Yellow
    npm install

    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: npm install failed" -ForegroundColor Red
        exit 1
    }

    Write-Host "Dependencies installed successfully!" -ForegroundColor Green
}
catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
finally {
    Pop-Location
}

