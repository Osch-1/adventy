# Deployment Scripts

This folder contains scripts for building and deploying the frontend application.

## Available Scripts

### Windows (PowerShell)

- **`build-frontend.ps1`** - Builds the React frontend
- **`install-frontend-deps.ps1`** - Installs npm dependencies

### Linux/Mac (Bash)

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

## See Also

- [BUILD.md](../docs/BUILD.md) - Detailed build instructions
- [LOCAL_DEVELOPMENT.md](../docs/LOCAL_DEVELOPMENT.md) - Local development guide

