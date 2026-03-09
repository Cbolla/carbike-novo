import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/app/',
  plugins: [
    tailwindcss(),
    react()
  ],
  server: {
    proxy: {
      '/veiculos': 'http://localhost:3000',
      '/lojas': 'http://localhost:3000',
      '/auth': 'http://localhost:3000',
      '/uploads': 'http://localhost:3000',
    }
  }
})

