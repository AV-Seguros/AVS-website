// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://av-seguros.github.io',
  base: '/AVS-website/',
  vite: {
    plugins: [tailwindcss()],
  },
});
