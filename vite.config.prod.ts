import { defineConfig } from 'vite';
import defaultConfig from './vite.config';

export default defineConfig({
  ...defaultConfig,
  base: '/strawberry-fury/',
});
