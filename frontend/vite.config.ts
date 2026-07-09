import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
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
