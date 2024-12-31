import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['react-datepicker', 'react-select', '@headlessui/react', 'framer-motion'],
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001', 
        changeOrigin: true,
        secure: false,
      },
      
    },
  },
});
