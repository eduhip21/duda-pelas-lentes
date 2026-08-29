import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// A API .NET escuta em http://localhost:5073 (ver Properties/launchSettings.json).
// O proxy abaixo encaminha /api e /media para lá, evitando CORS/URL no front.
const apiProxy = {
  '/api': { target: 'http://localhost:5073', changeOrigin: true },
  '/media': { target: 'http://localhost:5073', changeOrigin: true },
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Garante o runtime automático de JSX também no transform do Vitest.
  esbuild: { jsx: 'automatic', jsxImportSource: 'react' },
  server: {
    port: 5173,
    proxy: apiProxy,
  },
  // `vite preview` não herda `server.proxy`; replica aqui para o build local também
  // conseguir falar com a API (senão /api/... cai no fallback SPA e retorna 404).
  preview: {
    port: 4173,
    proxy: apiProxy,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
    css: false,
  },
})
