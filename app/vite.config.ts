import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Served from https://<user>.github.io/ffjm-trainer/ on GitHub Pages.
  base: '/ffjm-trainer/',
})
