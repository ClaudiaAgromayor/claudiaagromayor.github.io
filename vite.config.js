import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

// User site (claudiaagromayor.github.io) is served from the domain root.
// Two pages: v1 (the journey) at /, v2 (the studio-style home) at /v2/.
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    rollupOptions: {
      input: {
        v1: resolve(import.meta.dirname, 'index.html'),
        v2: resolve(import.meta.dirname, 'v2/index.html'),
      },
    },
  },
})
