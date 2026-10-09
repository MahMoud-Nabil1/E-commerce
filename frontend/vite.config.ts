import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8085',
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: 'localhost',
        configure: (proxy) => {
          proxy.on('error', (err) => {
            if (err.message.includes('ECONNREFUSED')) {
              console.warn('[vite-proxy] Backend is currently starting up (ECONNREFUSED). Waiting for connection...');
            } else {
              console.error('[vite-proxy] Proxy error:', err);
            }
          });
        },
      },
    },
  },
})
