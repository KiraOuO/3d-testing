import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import Checker from 'vite-plugin-checker';

export default defineConfig({
  plugins: [
    react(),
    Checker({ types: ['image'] }),
  ],
  build: {
    rollupOptions: {

    },
  },
  server: {
    open: true,
  },
  assetsInclude: ['**/*.hdr'], // Add this line
});
