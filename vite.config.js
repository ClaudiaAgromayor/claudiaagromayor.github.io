import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

// User site (claudiaagromayor.github.io), served from the domain root.
// The site is at /. v1 is kept in the repo under v1/ but is not an input here,
// so it is never built and never published; /v2/ is a stub that redirects to /.
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        moved: resolve(import.meta.dirname, 'v2/index.html'),
      },
    },
  },
})
