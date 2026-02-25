import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },

  build: {
    // Raise warning only if a single chunk exceeds 600kB (Three.js is large but expected)
    chunkSizeWarningLimit: 600,

    rollupOptions: {
      output: {
        /**
         * Object-based manual chunks.
         * This is much safer than function-based chunking as it prevents
         * Rollup initialization order bugs (e.g., React being undefined).
         */
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'three-vendor': ['three', '@react-three/fiber', '@react-three/drei'],
          'mediapipe-vendor': ['@mediapipe/tasks-vision'],
          'ui-vendor': ['lucide-react', 'clsx', 'zustand', 'react-hook-form', 'zod', 'react-hot-toast']
        },
      },
    },
  },
});
