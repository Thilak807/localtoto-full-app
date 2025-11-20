import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  
  // Get backend port from environment or default to 8001 (Django server)
  const backendPort = env.BACKEND_PORT || env.VITE_BACKEND_PORT || '8001';
  
  return {
    plugins: [react()],
    appType: 'spa',
    // Reduce noisy source map warnings from libs during dev
    // and speed up reloads
    esbuild: {
      sourcemap: false,
    },
    build: {
      sourcemap: false,
    },
    server: {
      port: 5173,
      // Allow Vite to auto-pick the next free port if 5173 is busy
      strictPort: false,
      host: true,
      open: true,
      proxy: {
        '/api': {
          // Use both localhost and 127.0.0.1 for better compatibility
          target: `http://localhost:${backendPort}`,
          changeOrigin: true,
          secure: false,
          configure: (proxy, options) => {
            proxy.on('error', (err, req, res) => {
              console.log('Proxy error:', err);
            });
            proxy.on('proxyReq', (proxyReq, req, res) => {
              console.log('Proxying request:', req.method, req.url);
            });
          },
          // Fallback to 127.0.0.1 if localhost fails
          router: {
            'localhost:5173': `http://127.0.0.1:${backendPort}`
          }
        },
      },
    },
    optimizeDeps: {
      include: ['lucide-react', '@react-three/fiber', '@react-three/drei', 'axios'],
    },
  };
});
