#!/usr/bin/env node
/**
 * Static audit of the built site (ROADMAP 1.7.0).
 *
 * Reads `dist/` and checks the things that can be verified without a browser:
 * SEO metadata, structured data, the internal link graph, the weight of the
 * assets each page loads, and the accessibility attributes in the markup.
 *
 * Run with `npm run audit` after `npm run build`. A non-zero exit code means at
 * least one check failed; the report is printed to stdout either way.
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';

const BUILD_DIR = 'dist';
const SITE_ORIGIN = 'https://avsegurosreal.com';
const MIN_CONTRAST = { normal: 4.5, large: 3 };

if (!existsSync(BUILD_DIR)) {
  console.error(`No ${BUILD_DIR}/ directory. Run \`npm run build\` first.`);
  process.exit(1);
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

/** Every built file, keyed by its absolute path. */
function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

const files = walk(BUILD_DIR);

const decode = (value = '') =>
  value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const stripTags = (html = '') => decode(html.replace(/<[^>]*>/g, ' '));

/** Route of a built HTML file: `/`, `/blog/foo/`, `/404`. */
const routeOf = (file) => {
  const rel = relative(BUILD_DIR, file).split('\\').join('/');
  if (rel === 'index.html') return '/';
  if (rel.endsWith('/index.html')) return `/${rel.slice(0, -'index.html'.length)}`;
  return `/${rel.replace(/\.html$/, '')}`;
};

const htmlFiles = files.filter((file) => file.endsWith('.html'));
const pages = htmlFiles.map((file) => {
  const html = readFileSync(file, 'utf8');
  return { file, route: routeOf(file), html };
});

const failures = [];
const notes = [];
const fail = (section, page, message) => failures.push({ section, page, message });

/* -------------------------------------------------------------------------- */
/* 1. SEO                                                                     */
/* -------------------------------------------------------------------------- */

const titles = new Map();
const descriptions = new Map();
const canonicals = new Map();
const h1Counts = new Map();
const pageTypes = new Map();

const REQUIRED_TYPES = ['Organization', 'InsuranceAgency'];

for (const page of pages) {
  const { html, route } = page;

  const title = decode(html.match(/<title>([\s\S]*?)<\/title>/)?.[1]);
  if (!title) fail('SEO', route, 'missing <title>');
  else if (titles.has(title)) fail('SEO', route, `duplicate <title> (also on ${titles.get(title)})`);
  else titles.set(title, route);

  const description = decode(
    html.match(/<meta\s+name="description"\s+content="([^"]*)"/)?.[1],
  );
  if (!description) fail('SEO', route, 'missing meta description');
  else if (descriptions.has(description))
    fail('SEO', route, `duplicate meta description (also on ${descriptions.get(description)})`);
  else descriptions.set(description, route);

  const canonical = html.match(/<link\s+rel="canonical"\s+href="([^"]*)"/)?.[1] ?? '';
  const canonicalCount = (html.match(/rel="canonical"/g) ?? []).length;
  if (canonicalCount !== 1) fail('SEO', route, `${canonicalCount} canonical tags (expected 1)`);
  if (!canonical.startsWith(`${SITE_ORIGIN}/`) && canonical !== SITE_ORIGIN)
    fail('SEO', route, `canonical not on ${SITE_ORIGIN}: ${canonical || '(empty)'}`);
  if (/localhost|127\.0\.0\.1|^http:\/\//.test(canonical))
    fail('SEO', route, `canonical uses a local or insecure URL: ${canonical}`);
  if (canonicals.has(canonical)) fail('SEO', route, `duplicate canonical (also on ${canonicals.get(canonical)})`);
  else canonicals.set(canonical, route);

  const h1Count = (html.match(/<h1[\s>]/g) ?? []).length;
  h1Counts.set(route, h1Count);
  if (h1Count !== 1) fail('SEO', route, `${h1Count} <h1> elements (expected 1)`);

  const robots = html.match(/<meta\s+name="robots"\s+content="([^"]*)"/)?.[1] ?? '';
  page.noindex = robots.includes('noindex');

  // Structured data ---------------------------------------------------------
  const blocks = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)];
  const types = new Set();
  const nodes = [];
  for (const [, raw] of blocks) {
    try {
      const parsed = JSON.parse(raw);
      nodes.push(parsed);
      const collect = (value) => {
        if (Array.isArray(value)) return value.forEach(collect);
        if (!value || typeof value !== 'object') return;
        if (typeof value['@type'] === 'string') types.add(value['@type']);
        Object.values(value).forEach(collect);
      };
      collect(parsed);
    } catch (error) {
      fail('SEO', route, `invalid JSON-LD: ${error.message}`);
    }
  }
  page.types = types;
  page.ldNodes = nodes;
  pageTypes.set(route, types);
  if (blocks.length === 0) fail('SEO', route, 'no JSON-LD blocks');
  for (const type of REQUIRED_TYPES) {
    if (!types.has(type)) fail('SEO', route, `missing site-wide ${type} JSON-LD`);
  }

  // Schema copy must match visible copy (docs/aeo.md).
  const visibleText = stripTags(html);
  for (const node of nodes) {
    const walkNodes = (value) => {
      if (Array.isArray(value)) return value.forEach(walkNodes);
      if (!value || typeof value !== 'object') return;
      if (value['@type'] === 'Question' && typeof value.name === 'string') {
        if (!visibleText.includes(decode(value.name)))
          fail('SEO', route, `FAQPage question not visible on the page: "${decode(value.name)}"`);
      }
      if (value['@type'] === 'Article' || value['@type'] === 'BlogPosting') {
        for (const field of ['headline', 'datePublished', 'author', 'mainEntityOfPage']) {
          if (!value[field]) fail('SEO', route, `Article JSON-LD missing "${field}"`);
        }
      }
      if (value['@type'] === 'BreadcrumbList') {
        const items = value.itemListElement ?? [];
        if (items.length < 2) fail('SEO', route, 'BreadcrumbList has fewer than 2 items');
        items.forEach((item, index) => {
          if (item.position !== index + 1)
            fail('SEO', route, `BreadcrumbList position ${item.position} out of order`);
          if (typeof item.item !== 'string' || !item.item.startsWith(SITE_ORIGIN))
            fail('SEO', route, `BreadcrumbList item is not absolute: ${item.item}`);
        });
      }
      Object.values(value).forEach(walkNodes);
    };
    walkNodes(node);
  }

  // Heading order -----------------------------------------------------------
  let previous = 0;
  for (const match of html.matchAll(/<h([1-6])[\s>]/g)) {
    const level = Number(match[1]);
    if (previous && level > previous + 1)
      fail('A11y', route, `heading level jumps from h${previous} to h${level}`);
    previous = level;
  }
}

/* -------------------------------------------------------------------------- */
/* 2. Internal link graph (orphan pages)                                      */
/* -------------------------------------------------------------------------- */

const inbound = new Map(pages.map((page) => [page.route, new Set()]));
const normalizeRoute = (href, base) => {
  try {
    const url = new URL(href, new URL(base, SITE_ORIGIN));
    if (url.origin !== SITE_ORIGIN) return null;
    let path = decodeURI(url.pathname);
    if (!path.endsWith('/') && !path.endsWith('.html')) path = `${path}/`;
    return path;
  } catch {
    return null;
  }
};

for (const page of pages) {
  for (const match of page.html.matchAll(/href="([^"]*)"/g)) {
    const href = match[1];
    if (!href || /^(mailto:|tel:|javascript:|#)/.test(href)) continue;
    const target = normalizeRoute(href, page.route);
    if (!target || target === page.route) continue;
    inbound.get(target)?.add(page.route);
  }
}

for (const page of pages) {
  if (page.noindex || page.route === '/404') continue;
  const sources = inbound.get(page.route);
  if (!sources || sources.size === 0) fail('SEO', page.route, 'orphan page: no internal links point to it');
}

// The sitemap must not advertise a page that asks not to be indexed.
const sitemapPath = join(BUILD_DIR, 'sitemap-0.xml');
const sitemapXml = existsSync(sitemapPath) ? readFileSync(sitemapPath, 'utf8') : '';
const sitemapUrls = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
for (const page of pages) {
  if (!page.noindex) continue;
  const canonical = page.html.match(/rel="canonical"\s+href="([^"]+)"/)?.[1];
  if (canonical && sitemapUrls.includes(canonical))
    fail('SEO', page.route, 'noindex page listed in sitemap-0.xml');
}

const orphanRoutes = pages
  .filter((page) => !page.noindex && page.route !== '/404' && inbound.get(page.route)?.size === 0)
  .map((page) => page.route);

/* -------------------------------------------------------------------------- */
/* 3. Assets and performance                                                  */
/* -------------------------------------------------------------------------- */

const assetSize = (href) => {
  const clean = href.split('?')[0].replace(/^\//, '');
  const path = join(BUILD_DIR, clean);
  return existsSync(path) ? statSync(path).size : 0;
};

const bytes = (n) => `${(n / 1024).toFixed(1)} kB`;
const assetReport = [];

for (const page of pages) {
  const scripts = [...page.html.matchAll(/<script[^>]*\ssrc="([^"]+)"[^>]*>/g)].map((m) => m[1]);
  // Astro hydrates islands by fetching these URLs, not through a <script> tag.
  const islandUrls = [...page.html.matchAll(/<astro-island[^>]*>/g)].flatMap((tag) =>
    [...tag[0].matchAll(/(?:component-url|renderer-url)="([^"]+)"/g)].map((m) => m[1]),
  );
  const styles = [...page.html.matchAll(/<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g)].map(
    (m) => m[1],
  );
  const preloads = [...page.html.matchAll(/rel="modulepreload"[^>]*href="([^"]+)"|href="([^"]+)"[^>]*rel="modulepreload"/g)].map(
    (m) => m[1] ?? m[2],
  );
  const inline = [...page.html.matchAll(/<script(?![^>]*\ssrc=)[^>]*>([\s\S]*?)<\/script>/g)]
    .filter((m) => !m[0].includes('application/ld+json'))
    .reduce((total, m) => total + Buffer.byteLength(m[1], 'utf8'), 0);
  const scriptBytes = [...new Set([...scripts, ...preloads, ...islandUrls])].reduce(
    (total, href) => total + assetSize(href),
    0,
  );
  const styleBytes = [...new Set(styles)].reduce((total, href) => total + assetSize(href), 0);
  const islands = (page.html.match(/<astro-island/g) ?? []).length;

  assetReport.push({
    route: page.route,
    scripts: [...new Set([...scripts, ...preloads, ...islandUrls])],
    styles: [...new Set(styles)],
    js: scriptBytes + inline,
    css: styleBytes,
    islands,
  });
}

// Report React only where it actually ships.
const reactChunks = new Set(
  files
    .filter((file) => file.endsWith('.js') && file.includes('_astro'))
    .filter((file) => /react/i.test(readFileSync(file, 'utf8').slice(0, 20000)))
    .map((file) => `/${relative(BUILD_DIR, file).split('\\').join('/')}`),
);

// Static assets every page loads from third parties.
const googleFonts = pages[0].html.includes('fonts.googleapis.com');
const fontAwesomeCss = pages[0].html.includes('cdnjs.cloudflare.com/ajax/libs/font-awesome');
notes.push(`Google Fonts stylesheet on every page: ${googleFonts ? 'yes' : 'no'}`);
notes.push(`Font Awesome from cdnjs on every page: ${fontAwesomeCss ? 'yes' : 'no'}`);

// Press and download assets keep their PNG/JPEG format on purpose: a journalist
// asking for "the logo" expects a lossless file.
const RASTER_ALLOWLIST = [/^\/logo\.png$/, /^\/logo-bg-white\.png$/];

// Image audit.
const imageFailures = new Set();
let imageCount = 0;
for (const page of pages) {
  for (const match of page.html.matchAll(/<img\b[^>]*>/g)) {
    imageCount += 1;
    const tag = match[0];
    const src = tag.match(/\ssrc="([^"]*)"/)?.[1] ?? '';
    const key = `${page.route} ${src}`;
    if (!/\salt=("[^"]*"|'[^']*')/.test(tag)) {
      imageFailures.add(key);
      fail('A11y', page.route, `<img> without alt attribute: ${src}`);
    }
    if (!/\swidth="\d+"/.test(tag) || !/\sheight="\d+"/.test(tag)) {
      imageFailures.add(`${key} dimensions`);
      fail('Perf', page.route, `<img> without explicit width/height (CLS risk): ${src}`);
    }
    if (/\.(png|jpe?g)(\?|$)/i.test(src) && !RASTER_ALLOWLIST.some((rule) => rule.test(src))) {
      fail('Perf', page.route, `raster image not in WebP/AVIF: ${src}`);
    }
  }
}

// CSS custom properties, for the contrast checks.
const cssText = files
  .filter((file) => file.endsWith('.css'))
  .map((file) => readFileSync(file, 'utf8'))
  .join('\n');
const tokens = new Map();
for (const match of cssText.matchAll(/--([\w-]+)\s*:\s*(#[0-9a-fA-F]{3,8})\b/g)) {
  if (!tokens.has(match[1])) tokens.set(match[1], match[2]);
}

/* -------------------------------------------------------------------------- */
/* 4. Accessibility markup                                                    */
/* -------------------------------------------------------------------------- */

const ariaControlsIds = new Set();
for (const page of pages) {
  const ids = [...page.html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  for (const id of new Set(duplicates)) fail('A11y', page.route, `duplicate id="${id}"`);

  if (!/<html[^>]*\slang="[^"]+"/.test(page.html)) fail('A11y', page.route, 'missing <html lang>');

  // Icon-only controls need an accessible name.
  for (const match of page.html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)) {
    const [, attrs, inner] = match;
    const label = (inner.match(/aria-label="([^"]*)"/) ?? [])[0];
    const text = stripTags(inner).replace(/[^\p{L}\p{N}]/gu, '');
    const named = label || /\saria-label(?:ledby)?="/.test(attrs);
    if (!text && !named) fail('A11y', page.route, 'icon-only <button> without aria-label');
  }

  for (const match of page.html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)) {
    const [, attrs, inner] = match;
    const text = stripTags(inner).replace(/[^\p{L}\p{N}]/gu, '');
    const named = /\saria-label(?:ledby)?="/.test(attrs) || /\stitle="/.test(attrs);
    if (!text && !named) fail('A11y', page.route, `link without accessible name: ${attrs.slice(0, 80)}`);
  }

  // `aria-expanded` and `aria-controls` must agree.
  for (const match of page.html.matchAll(/<[^>]*aria-expanded="(true|false)"[^>]*>/g)) {
    const tag = match[0];
    if (!/aria-controls="/.test(tag)) fail('A11y', page.route, 'aria-expanded without aria-controls');
    const controls = tag.match(/aria-controls="([^"]+)"/)?.[1];
    if (controls) {
      ariaControlsIds.add(controls);
      if (!page.html.includes(`id="${controls}"`))
        fail('A11y', page.route, `aria-controls="${controls}" points at a missing element`);
    }
  }

  // Form controls need a programmatic label: a wrapping <label>, a <label for>
  // or an explicit ARIA name.
  for (const match of page.html.matchAll(/<(input|select|textarea)\b([^>]*)>/g)) {
    const [, tagName, attrs] = match;
    if (/\stype="hidden"/.test(attrs)) continue;
    const id = attrs.match(/\sid="([^"]+)"/)?.[1];
    const inline = /\saria-label(?:ledby)?="/.test(attrs) || /\stitle="/.test(attrs);
    const before = page.html.slice(0, match.index);
    const wrapped = before.lastIndexOf('<label') > before.lastIndexOf('</label>');
    const hasLabel =
      wrapped || (id ? new RegExp(`<label[^>]*\\sfor="${id}"`).test(page.html) : false);
    if (!inline && !hasLabel)
      fail('A11y', page.route, `<${tagName}> without associated <label for>`);
    if (
      tagName === 'input' &&
      /\stype="(text|tel|email|checkbox|number)"/.test(attrs) &&
      !id &&
      !inline &&
      !wrapped
    )
      fail('A11y', page.route, `<input> without id: ${attrs.slice(0, 60)}`);
  }

  // Decorative icons must be hidden from assistive technology.
  const iconOnly = [...page.html.matchAll(/<i class="fa[^"]*"[^>]*>/g)].filter(
    (m) => !/aria-hidden="true"/.test(m[0]),
  );
  if (iconOnly.length > 0)
    fail('A11y', page.route, `${iconOnly.length} Font Awesome icon(s) without aria-hidden="true"`);
}

/* -------------------------------------------------------------------------- */
/* 5. Colour contrast                                                         */
/* -------------------------------------------------------------------------- */

const hexToRgb = (hex) => {
  let value = hex.replace('#', '');
  if (value.length === 3) value = value.split('').map((c) => c + c).join('');
  return [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16));
};
const luminance = (hex) => {
  const [r, g, b] = hexToRgb(hex).map((channel) => {
    const s = channel / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
};
const tokenColor = (value) => (value.startsWith('#') ? value : tokens.get(value.replace(/^--/, '')));

/**
 * Pairs that actually appear on the site: foreground, background, context and
 * the WCAG minimum that applies. `graphics` covers icons, borders and other
 * non-text elements, which need 3:1 instead of 4.5:1.
 */
const CONTRAST_PAIRS = [
  { fg: '--red-bright', bg: '#ffffff', context: 'white text on primary red buttons', min: 'normal' },
  { fg: '--red', bg: '#ffffff', context: 'red links and labels on white', min: 'normal' },
  { fg: '--text-muted', bg: '#ffffff', context: 'muted body text on white cards', min: 'normal' },
  { fg: '--text-muted', bg: '--gray-bg', context: 'muted body text on the page background', min: 'normal' },
  { fg: '--navy', bg: '#ffffff', context: 'headings on white', min: 'normal' },
  { fg: '#94a9c9', bg: '#0b1a2b', context: 'footer links on navy', min: 'normal' },
  { fg: '#6b87a8', bg: '#0b1a2b', context: 'footer legal note on navy', min: 'normal' },
  { fg: '#adbccf', bg: '#0b1a2b', context: 'footer body text on navy', min: 'normal' },
  { fg: '#e2e8f0', bg: '--navy', context: 'header links on navy', min: 'normal' },
  { fg: '#b0c4de', bg: '--navy', context: 'header brand suffix on navy', min: 'normal' },
  { fg: '#c9d6e6', bg: '--navy', context: 'mega-menu description on navy', min: 'normal' },
  {
    fg: '--red-bright',
    bg: '--navy',
    context: 'red icons and borders on navy (aria-hidden)',
    min: 'graphics',
  },
  { fg: '--red-on-dark', bg: '--navy', context: 'red labels and links on the navy form', min: 'normal' },
  { fg: '#cbd5e1', bg: '--navy', context: 'form description on the navy band', min: 'normal' },
  { fg: '--text-muted', bg: '#f0f4fa', context: 'FAQ answer text on the FAQ background', min: 'normal' },
];

const contrastReport = [];
for (const pair of CONTRAST_PAIRS) {
  const fg = tokenColor(pair.fg);
  const bg = tokenColor(pair.bg);
  if (!fg || !bg) {
    contrastReport.push({ ...pair, skipped: true });
    continue;
  }
  const ratio = contrast(fg, bg);
  // Literal colours are a snapshot of the compiled CSS. If one disappears from
  // the build, the pair is stale and has to be re-checked by hand.
  const stale =
    pair.fg.startsWith('#') && !cssText.toLowerCase().includes(pair.fg.toLowerCase());
  contrastReport.push({ ...pair, foreground: fg, background: bg, ratio, stale });
  const minimum = pair.min === 'graphics' ? MIN_CONTRAST.large : MIN_CONTRAST.normal;
  if (ratio < minimum) {
    fail('A11y', 'tokens', `contrast ${ratio.toFixed(2)}:1 for ${pair.context} (${fg} on ${bg})`);
  }
  if (stale) notes.push(`contrast pair stale (${pair.fg} no longer in the build): ${pair.context}`);
}

/* -------------------------------------------------------------------------- */
/* Report                                                                     */
/* -------------------------------------------------------------------------- */

const out = [];
out.push(`# Audit report — ${pages.length} pages in ${BUILD_DIR}/`);
out.push('');

out.push('## SEO');
out.push(`- pages: ${pages.length}`);
out.push(`- titles: ${titles.size} unique / ${pages.length}`);
out.push(`- descriptions: ${descriptions.size} unique / ${pages.length}`);
out.push(`- canonical URLs: ${canonicals.size} unique / ${pages.length}`);
const h1Bad = [...h1Counts.entries()].filter(([, count]) => count !== 1);
out.push(`- pages with exactly one <h1>: ${pages.length - h1Bad.length}/${pages.length}`);
const typeTally = new Map();
for (const types of pageTypes.values())
  for (const type of types) typeTally.set(type, (typeTally.get(type) ?? 0) + 1);
out.push(`- JSON-LD types: ${[...typeTally.entries()].map(([type, n]) => `${type}(${n})`).join(', ')}`);
out.push(`- orphan pages: ${orphanRoutes.length}${orphanRoutes.length ? ` (${orphanRoutes.join(', ')})` : ''}`);
out.push(`- sitemap URLs: ${sitemapUrls.length}`);
const noindexCanonicals = new Set(
  [...canonicals.entries()]
    .filter(([, route]) => pages.some((page) => page.route === route && page.noindex))
    .map(([url]) => url),
);
out.push(
  `- noindex pages in the sitemap: ${sitemapUrls.filter((url) => noindexCanonicals.has(url)).length}`,
);
out.push('');

out.push('## Performance');
const heaviest = [...assetReport].sort((a, b) => b.js - a.js).slice(0, 5);
for (const entry of heaviest)
  out.push(`- ${entry.route}: ${bytes(entry.js)} JS, ${bytes(entry.css)} CSS, ${entry.islands} island(s)`);
const islandPages = assetReport.filter((entry) => entry.islands > 0);
out.push(`- pages with hydrated islands: ${islandPages.map((entry) => entry.route).join(', ') || 'none'}`);
out.push(`- React chunks emitted: ${reactChunks.size} (${[...reactChunks].join(', ') || 'none'})`);
const pagesWithReact = assetReport.filter((entry) =>
  entry.scripts.some((src) => reactChunks.has(src)),
);
out.push(
  `- pages loading a React chunk: ${pagesWithReact.map((entry) => entry.route).join(', ') || 'none'}`,
);
out.push(
  `- island asset weight: ${islandPages.map((entry) => `${entry.route} ${bytes(entry.js)}`).join(', ') || 'none'}`,
);
out.push(`- <img> elements: ${imageCount}`);
for (const note of notes) out.push(`- ${note}`);
out.push('');

out.push('## Accessibility');
out.push(`- images without alt: ${[...imageFailures].filter((key) => !key.endsWith(' dimensions')).length}`);
out.push(`- html lang: ${pages.filter((p) => /<html[^>]*\slang="/.test(p.html)).length}/${pages.length}`);
out.push(`- aria-controls ids referenced: ${ariaControlsIds.size}`);
out.push('');
out.push('### Contrast (WCAG AA)');
for (const entry of contrastReport) {
  if (entry.skipped) {
    out.push(`- skipped (colour not found): ${entry.context}`);
    continue;
  }
  const minimum = entry.min === 'graphics' ? MIN_CONTRAST.large : MIN_CONTRAST.normal;
  const label =
    entry.ratio >= 4.5
      ? 'PASS'
      : entry.ratio >= minimum
        ? `PASS (${entry.min === 'graphics' ? 'non-text 3:1' : 'large text only'})`
        : 'FAIL';
  out.push(
    `- ${label} ${entry.ratio.toFixed(2)}:1 — ${entry.context} (${entry.foreground} on ${entry.background})${entry.stale ? ' [stale snapshot]' : ''}`,
  );
}
out.push('');

if (failures.length === 0) {
  out.push('## Result');
  out.push('No failures.');
} else {
  out.push(`## Failures (${failures.length})`);
  const grouped = new Map();
  for (const failure of failures) {
    const key = `${failure.section} · ${failure.message}`;
    const routes = grouped.get(key) ?? [];
    routes.push(failure.page);
    grouped.set(key, routes);
  }
  for (const [key, routes] of [...grouped].sort()) {
    out.push(`- ${key}${routes.length > 1 ? ` — ${routes.length} pages` : ` — ${routes[0]}`}`);
  }
}

console.log(out.join('\n'));
process.exitCode = failures.length > 0 ? 1 : 0;
