// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://avsegurosreal.com',
  base: '/',
  integrations: [
    sitemap({
      // /gracias/ is a noindex confirmation screen and must not be indexed.
      filter: (page) => !page.includes('/gracias/'),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
