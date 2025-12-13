import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  server: {
    proxy: {
      '/api': 'http://localhost:8000',  // importante!
      '/admin': 'http://localhost:8000',
    }
  },
  // Isso aqui é essencial para rotas diretas funcionarem
  base: '/',

  /*server: {
    historyApiFallback: true,
  },*/
})
