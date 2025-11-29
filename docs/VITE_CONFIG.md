# Vite Configuration - Dev vs Production

## How It Works

The project uses a **single Vite configuration file** (`vite.config.js`) that automatically selects the appropriate settings based on the command you run.

## Configuration Selection

Vite automatically detects the mode based on the npm script:

### Development Mode
When you run `npm run dev`:
- Vite runs in **serve** mode with **development** mode
- The config returns development settings:
  - Dev server on port 5173
  - Proxy for `/api/*` requests to `http://localhost:5131`
  - Hot module replacement enabled
  - Source maps enabled

### Production Mode
When you run `npm run build`:
- Vite runs in **build** mode with **production** mode
- The config returns production settings:
  - Build output to `wwwroot` folder
  - Code minification with esbuild
  - No source maps (for smaller bundle size)
  - Code splitting (React vendor chunk)
  - Optimized bundle

## Configuration Logic

The `vite.config.js` file uses a function that receives `{ command, mode }`:

```javascript
export default defineConfig(({ command, mode }) => {
  const isDev = command === 'serve' || mode === 'development'

  if (isDev) {
    // Return dev config with proxy
  } else {
    // Return prod config with optimizations
  }
})
```

## Key Differences

| Feature | Development | Production |
|---------|------------|------------|
| **Server** | Vite dev server (port 5173) | Static files in `wwwroot` |
| **API Proxy** | ✅ Proxies to localhost:5131 | ❌ Uses relative paths |
| **Hot Reload** | ✅ Enabled | ❌ N/A |
| **Minification** | ❌ Disabled | ✅ Enabled (esbuild) |
| **Source Maps** | ✅ Enabled | ❌ Disabled |
| **Code Splitting** | ❌ Disabled | ✅ Enabled |

## Why This Approach?

1. **Single source of truth** - One config file to maintain
2. **Automatic selection** - No need to specify which config to use
3. **Clear separation** - Dev and prod settings are clearly separated in code
4. **No manual switching** - Vite handles it automatically based on the command

## Customization

To modify development settings, edit the `if (isDev)` block in `vite.config.js`.
To modify production settings, edit the `else` block in `vite.config.js`.

