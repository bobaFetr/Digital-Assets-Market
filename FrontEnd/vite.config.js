import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Proxy API calls during development to the backend to avoid the dev server
    // returning the SPA HTML for /api/* requests.
    proxy: {
      '/api': {
        target: 'http://localhost:5149',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
