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
         * Manual chunk strategy — splits the bundle into logical groups.
         * This enables parallel download and long-term caching of stable deps.
         *
         * Groups:
         *  - react-vendor     — React + Router (tiny, fast-changing entry)
         *  - three-vendor     — Three.js + R3F ecosystem (heaviest, cache aggressively)
         *  - mediapipe-vendor — MediaPipe WASM loader (large, rarely changes)
         *  - ui-vendor        — Lucide icons, clsx, Zustand (light utilities)
         */
        manualChunks(id: string) {
          // Three.js + React Three Fiber ecosystem
          if (
            id.includes('node_modules/three/') ||
            id.includes('node_modules/@react-three/') ||
            id.includes('node_modules/troika-') ||
            id.includes('node_modules/meshline')
          ) {
            return 'three-vendor';
          }

          // MediaPipe (WASM + JS bridge)
          if (id.includes('node_modules/@mediapipe/')) {
            return 'mediapipe-vendor';
          }

          // jsPDF + html2canvas (export feature)
          if (
            id.includes('node_modules/jspdf') ||
            id.includes('node_modules/html2canvas') ||
            id.includes('node_modules/dompurify')
          ) {
            return 'export-vendor';
          }

          // React core + router
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/react-router')
          ) {
            return 'react-vendor';
          }

          // Remaining node_modules → one shared vendor chunk
          if (id.includes('node_modules/')) {
            return 'ui-vendor';
          }
        },
      },
    },
  },
});
