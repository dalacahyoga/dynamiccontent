import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Ensure proper routing in production
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
})

