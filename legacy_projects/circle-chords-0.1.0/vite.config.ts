import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Using a relative base helps when deploying under a subpath (e.g., GitHub Pages project).
export default defineConfig({
  base: './',
  plugins: [react()],
})

