import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const srcDir = path.resolve(__dirname, 'src');

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    minify: 'terser',
    rollupOptions: {
      input: {
        popup: path.resolve(__dirname, 'src/popup/index.html'),
        background: path.resolve(__dirname, 'src/background/worker.ts'),
        content: path.resolve(__dirname, 'src/content/inject.ts'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          const name = chunkInfo.name;
          if (name === 'popup') return '[name].js';
          if (name === 'background') return 'background.js';
          if (name === 'content') return 'content.js';
          return '[name].js';
        },
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name.endsWith('.css')) return 'styles/[name]-[hash][extname]';
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': srcDir,
    },
  },
});