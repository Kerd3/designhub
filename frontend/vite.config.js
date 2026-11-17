import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';

const fromHere = (path) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fromHere('./src'),
      // Demo dataset and domain rules shared with the Express backend.
      '@shared': fromHere('../shared'),
    },
  },
  server: {
    port: 5173,
    fs: { allow: [fromHere('..')] },
  },
  preview: { port: 4173 },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/recharts') || id.includes('node_modules/d3-')) return 'charts';
          if (id.includes('node_modules/react-hook-form') || id.includes('node_modules/zod')) return 'forms';
          return undefined;
        },
      },
    },
  },
});
