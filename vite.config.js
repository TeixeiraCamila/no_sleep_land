import { defineConfig } from 'vite'
import { fileURLToPath } from 'url'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  plugins: [tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  
  server: {
    port: 5173,
    open: false,
  },
  
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})