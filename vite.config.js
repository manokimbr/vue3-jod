import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    host: true,          // 👈 exposes to LAN (0.0.0.0)
    port: 5174,          // 👈 optional, you can change it if needed
  },
  base: './',            // 👈 makes sure asset paths work over LAN
})
