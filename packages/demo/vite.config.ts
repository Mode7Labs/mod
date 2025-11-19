import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/mod/playground/',
  build: {
    outDir: '../../docs/public/playground'
  }
})
