import { defineConfig } from 'vite';

// base './' keeps asset paths relative, so the same build runs on Vercel, Firebase Hosting or any static host.
export default defineConfig({
  base: './',
  build: { outDir: 'dist', chunkSizeWarningLimit: 900 }
});
