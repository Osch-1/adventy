# Building the Adventy Application

## Frontend Build

The React frontend is located in `src/Api/ClientApp/`.

### Quick Start

**Windows (PowerShell):**
```powershell
# Install dependencies (first time only)
.\deployment\install-frontend-deps.ps1

# Build the frontend
.\deployment\build-frontend.ps1
```

**Linux/Mac:**
```bash
# Make scripts executable (first time only)
chmod +x deployment/install-frontend-deps.sh deployment/build-frontend.sh

# Install dependencies (first time only)
./deployment/install-frontend-deps.sh

# Build the frontend
./deployment/build-frontend.sh
```

### Manual Build

If you prefer to build manually:

```bash
cd src/Api/ClientApp
npm install
npm run build
```

The build output will be in `src/Api/ClientApp/wwwroot/`.

## Deployment with Nginx

1. Build the frontend using the scripts above
2. Configure nginx to:
   - Serve static files from `src/Api/ClientApp/wwwroot/`
   - Proxy `/api/*` requests to your ASP.NET Core backend
3. See `docs/nginx.conf.example` for a sample configuration

## Backend Build

```bash
cd src/Api
dotnet build
dotnet run
```

The backend will serve the React app from `wwwroot` if it exists, or you can configure nginx to serve it separately.

