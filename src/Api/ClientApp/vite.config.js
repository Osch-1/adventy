import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite automatically detects dev vs build mode
// This config uses conditional logic based on command and mode
export default defineConfig(({ command, mode }) => {
  const isDev = command === 'serve' || mode === 'development'

  // Base configuration
  const baseConfig = {
    plugins: [react()],
    base: '/'
  }

  // Development configuration
  if (isDev) {
    return {
      ...baseConfig,
      server: {
        port: 5173,
        // Proxy API requests to ASP.NET Core backend during development
        proxy: {
          '/api': {
            target: 'http://localhost:5131',
            changeOrigin: true,
            secure: false
          }
        }
      }
    }
  }

  // Production configuration
  return {
    ...baseConfig,
    build: {
      outDir: 'wwwroot',
      emptyOutDir: true,
      // Production optimizations
      minify: 'esbuild',
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom']
          }
        }
      }
    }
  }
})
