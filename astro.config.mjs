// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  site: 'https://avsegurosreal.com',
  base: '/',
  integrations: [
    sitemap({
      // /gracias/ is a noindex confirmation screen and must not be indexed.
      filter: (page) => !page.includes('/gracias/'),
    }),
    react(),
  ],
  vite: {
    plugins: [tailwindcss()],
    // Vite 8 does not pre-bundle `react-dom/client` on its own, so the dev
    // server serves the CommonJS file and the island fails to hydrate with
    // "does not provide an export named 'createRoot'". Listing the React
    // entries forces the CJS-to-ESM interop in dev; production builds bundle
    // them anyway, so `dist/` is unaffected.
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-dom/client',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
      ],
    },
  },
});
