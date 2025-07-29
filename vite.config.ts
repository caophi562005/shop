import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3300
  },
  preview: {
    host: '0.0.0.0',
    port: 3300,
    allowedHosts: ['client-pixcam.hacmieu.xyz'],
  },
})
