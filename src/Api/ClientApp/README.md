# Adventy Client App

React SPA for the Adventy adventure calendar.

## Development

For local development, you need to run both the backend and frontend:

1. **Start the backend** (in a separate terminal):
   ```bash
   cd ..  # Go to src/Api
   dotnet run
   ```

2. **Start the frontend**:
   ```bash
   npm install  # First time only
   npm run dev
   ```

3. Open **http://localhost:5173** in your browser.

The Vite dev server will proxy API requests to the backend at `http://localhost:5131`.

See `docs/LOCAL_DEVELOPMENT.md` in the root folder for detailed instructions.

## Build

### Using build scripts (recommended)

From the root folder:
- **Windows (PowerShell):** `.\deployment\build-frontend.ps1`
- **Linux/Mac:** `./deployment/build-frontend.sh`

### Manual build

```bash
npm install
npm run build
```

The build output will be in the `wwwroot` folder.

## Deployment

The app is configured to work with nginx. API calls use relative paths (`/api/...`) which should be proxied to your ASP.NET Core backend.

See `docs/nginx.conf.example` in the root folder for a sample nginx configuration.

## Testing Features

### Preview a date locally

Open http://localhost:5173/?preview=1 and select a test date below the house. This panel is available only in the development build.

### Keyboard Shortcuts

- **Escape** - Close the adventure card when it's open

