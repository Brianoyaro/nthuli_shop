import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    __VITE_APP_API_BASE_URL__: JSON.stringify(process.env.VITE_API_BASE_URL || 'http://localhost:8080/api'),
    __VITE_APP_IMAGE_BASE_URL__: JSON.stringify(process.env.VITE_API_IMAGE_BASE_URL || 'http://localhost:8080'),
  },
})
