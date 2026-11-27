// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

import react from '@astrojs/react';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Keeps noindexed pages out of the sitemap.
 *
 * `@astrojs/sitemap` cannot know which pages a page decides to noindex at build
 * time (empty blog category indexes, for example). After the build, every HTML
 * file that carries `noindex` is read, and its canonical URL is removed from
 * `sitemap-0.xml`, so the sitemap never advertises a page that asks not to be
 * indexed.
 */
function sitemapExcludesNoindex() {
  return {
    name: 'sitemap-excludes-noindex',
    hooks: {
      'astro:build:done': ({ dir }) => {
        const dist = fileURLToPath(dir);
        const sitemapPath = join(dist, 'sitemap-0.xml');
        if (!existsSync(sitemapPath)) return;

        const noindexUrls = new Set();
        const walk = (folder) => {
          for (const entry of readdirSync(folder, { withFileTypes: true })) {
            const path = join(folder, entry.name);
            if (entry.isDirectory()) walk(path);
            else if (entry.name.endsWith('.html')) {
              const html = readFileSync(path, 'utf8');
              if (!/<meta name="robots" content="noindex/.test(html)) continue;
              const canonical = html.match(/rel="canonical"\s+href="([^"]+)"/)?.[1];
              if (canonical) noindexUrls.add(canonical);
            }
          }
        };
        walk(dist);
        if (noindexUrls.size === 0) return;

        const xml = readFileSync(sitemapPath, 'utf8');
        const filtered = xml.replace(/<url>[\s\S]*?<\/url>/g, (block) => {
          const loc = block.match(/<loc>([^<]+)<\/loc>/)?.[1];
          return loc && noindexUrls.has(loc) ? '' : block;
        });
        writeFileSync(sitemapPath, filtered);
      },
    },
  };
}

// https://astro.build/config
export default defineConfig({
  site: 'https://avsegurosreal.com',
  base: '/',
  integrations: [
    sitemap({
      // /gracias/ is a noindex confirmation screen and must not be indexed.
      filter: (page) => !page.includes('/gracias/'),
    }),
    sitemapExcludesNoindex(),
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
