import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // base: '/pokedex-mini/', // Nanti aktifkan lagi (hapus // di depan) pas mau deploy ke GitHub Pages
  plugins: [react()],
})