import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
import path from 'node:path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: n => n.includes('-'),
        },
      },
    }),
  ],
  server: {
    port: 11037,
    open: 'http://localhost:11037',
  },
  base: '/linear-clock/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
