# Running the Application Locally

This guide explains how to run both the backend (ASP.NET Core) and frontend (React) locally for development.

## Prerequisites

- .NET 9.0 SDK
- Node.js (v18 or higher) and npm

## Option 1: Development Mode (Recommended)

This runs both servers separately with hot-reload enabled.

### Step 1: Start the Backend

Open a terminal and run:

```bash
cd src/Api
dotnet run
```

The backend will start on **http://localhost:5131**

### Step 2: Start the Frontend

Open a **new terminal** and run:

```bash
cd src/Api/ClientApp
npm install  # First time only
npm run dev
```

The frontend will start on **http://localhost:5173** and automatically proxy API requests to the backend.

### Step 3: Open in Browser

Navigate to **http://localhost:5173** to see the application.

The Vite dev server will:
- Hot-reload on code changes
- Proxy `/api/*` requests to `http://localhost:5131`

---

## Option 2: Production Build (Backend Serves Frontend)

This builds the React app and serves it from the ASP.NET Core backend.

### Step 1: Build the Frontend

From the root folder:

**Windows:**
```powershell
.\deployment\build-frontend.ps1
```

**Linux/Mac:**
```bash
./deployment/build-frontend.sh
```

Or manually:
```bash
cd src/Api/ClientApp
npm install
npm run build
```

### Step 2: Start the Backend

```bash
cd src/Api
dotnet run
```

The backend will:
- Serve the React app from `wwwroot`
- Handle API requests at `/api/*`
- Serve the SPA at the root URL

### Step 3: Open in Browser

Navigate to **http://localhost:5131** to see the application.

---

## Troubleshooting

### Port Already in Use

If port 5131 is already in use, you can change it in `src/Api/Properties/launchSettings.json`:

```json
"applicationUrl": "http://localhost:YOUR_PORT"
```

Then update the proxy target in `src/Api/ClientApp/vite.config.js` (in the development section):

```javascript
proxy: {
  '/api': {
    target: 'http://localhost:YOUR_PORT',
    // ...
  }
}
```

### Frontend Not Connecting to Backend

1. Make sure the backend is running first
2. Check that the proxy target in `vite.config.js` matches your backend URL
3. Check browser console for CORS errors (shouldn't happen with proxy)

### Dependencies Not Installed

If you see errors about missing modules:

```bash
cd src/Api/ClientApp
npm install
```

---

## Development Workflow

**Recommended workflow:**
1. Start backend: `cd src/Api && dotnet run`
2. Start frontend: `cd src/Api/ClientApp && npm run dev`
3. Open http://localhost:5173
4. Make changes - both servers will hot-reload automatically

## Vite Configuration

The project uses a single `vite.config.js` file that automatically selects the appropriate configuration based on the command:

- **Development mode** (`npm run dev`): Includes dev server with proxy to backend
- **Production mode** (`npm run build`): Optimized build configuration

See [VITE_CONFIG.md](./VITE_CONFIG.md) for detailed information about how the configuration works.

