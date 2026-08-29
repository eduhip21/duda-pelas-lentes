import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Garante o runtime automático de JSX também no transform do Vitest.
  esbuild: { jsx: 'automatic', jsxImportSource: 'react' },
  server: {
    port: 5173,
    proxy: {
      // Proxy da API em desenvolvimento — evita configurar CORS/URL no front.
      '/api': { target: 'http://localhost:5073', changeOrigin: true },
      '/media': { target: 'http://localhost:5073', changeOrigin: true },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
    css: false,
  },
})
