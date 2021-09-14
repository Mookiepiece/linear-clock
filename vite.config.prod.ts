import { defineConfig } from 'vite';
import defaultConfig from './vite.config';

export default defineConfig({
  ...defaultConfig,
  base: '/linear-clock/',
});
