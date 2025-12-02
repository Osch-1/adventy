# Deployment Scripts

This folder contains scripts for building and deploying the Adventy application.

## Available Scripts

### Ubuntu/Linux Deployment (Production)

- **`install-dependencies.sh`** - Installs all required dependencies (.NET SDK 9.0, Node.js, npm) on Ubuntu
- **`build-all.sh`** - Builds both backend and frontend, copies to deployment folder
- **`manage-service.sh`** - Service management script (start/stop/restart/status/logs)
- **`adventy.service`** - Systemd service file for running the application
- **`install-nginx.sh`** - Installs and configures nginx on Ubuntu
- **`deploy-nginx.sh`** - Deploys nginx configuration for Adventy

### Development Scripts

#### Windows (PowerShell)

- **`build-frontend.ps1`** - Builds the React frontend
- **`install-frontend-deps.ps1`** - Installs npm dependencies

#### Linux/Mac (Bash)

- **`build-frontend.sh`** - Builds the React frontend
- **`install-frontend-deps.sh`** - Installs npm dependencies

## Usage

**Important:** All scripts must be run from the repository root directory.

### Building the Frontend

**Windows:**
```powershell
.\deployment\build-frontend.ps1
```

**Linux/Mac:**
```bash
chmod +x deployment/build-frontend.sh
./deployment/build-frontend.sh
```

### Installing Dependencies

**Windows:**
```powershell
.\deployment\install-frontend-deps.ps1
```

**Linux/Mac:**
```bash
chmod +x deployment/install-frontend-deps.sh
./deployment/install-frontend-deps.sh
```

## What These Scripts Do

- **Install scripts**: Navigate to `src/Api/ClientApp` and run `npm install`
- **Build scripts**: Navigate to `src/Api/ClientApp`, install dependencies if needed, and run `npm run build`

The build output will be in `src/Api/ClientApp/wwwroot/`.

## Production Deployment on Ubuntu

For complete production deployment instructions, see:

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Complete deployment guide for Ubuntu

### Quick Start

1. **Install dependencies:**
   ```bash
   chmod +x deployment/install-dependencies.sh
   sudo ./deployment/install-dependencies.sh
   ```

2. **Build application:**
   ```bash
   chmod +x deployment/build-all.sh
   sudo ./deployment/build-all.sh
   ```

3. **Install and start service:**
   ```bash
   chmod +x deployment/manage-service.sh
   sudo ./deployment/manage-service.sh install
   sudo ./deployment/manage-service.sh start
   ```

4. **Install and configure nginx:**
   ```bash
   chmod +x deployment/install-nginx.sh
   chmod +x deployment/deploy-nginx.sh
   sudo ./deployment/install-nginx.sh
   sudo ./deployment/deploy-nginx.sh
   ```

   Or manually:
   ```bash
   sudo cp nginx/adventy.conf /etc/nginx/sites-available/adventy
   sudo nano /etc/nginx/sites-available/adventy  # Edit configuration
   sudo ln -s /etc/nginx/sites-available/adventy /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

## Troubleshooting

If you encounter issues during deployment, see:

- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Common issues and solutions

Common issues:
- .NET SDK installation errors
- Nginx configuration problems
- Service startup issues
- Build failures

## See Also

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Complete Ubuntu deployment guide
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Troubleshooting guide
- [BUILD.md](../docs/BUILD.md) - Detailed build instructions
- [LOCAL_DEVELOPMENT.md](../docs/LOCAL_DEVELOPMENT.md) - Local development guide
- [nginx/README.md](../nginx/README.md) - Nginx configuration guide

