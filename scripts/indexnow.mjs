#!/usr/bin/env node
/**
 * IndexNow submission for https://avsegurosreal.com.
 *
 * IndexNow lets the site tell Bing (and the other participating engines) that a
 * URL was created or changed, instead of waiting for a crawl. The protocol
 * requires a key file that proves domain ownership: the key below is published
 * at `public/<key>.txt` and is the same key Bing issued for this site (it is
 * also the value used by `public/BingSiteAuth.xml`).
 *
 * Usage, after `npm run build`:
 *
 *   npm run indexnow                     # submit every URL in the built sitemap
 *   npm run indexnow -- /blog/ /prensa/  # submit only these routes
 *   npm run indexnow -- --dry-run        # print the payload, send nothing
 *
 * IndexNow answers `200 OK` or `202 Accepted` when it accepts a submission and
 * `4xx` when the key, the host or the URL list is rejected. The process exits
 * with code 1 on any failure so a release workflow can stop on it.
 */

import { readFile } from 'node:fs/promises';
import path from 'node:path';

const HOST = 'https://avsegurosreal.com';
const KEY = '03EFDF378EAF136744EB6651D479766B';
const KEY_LOCATION = `${HOST}/${KEY}.txt`;
const ENDPOINT = 'https://api.indexnow.org/indexnow';

/** Directory Astro writes the static build to. */
const BUILD_DIR = path.resolve(process.cwd(), 'dist');

/** Sitemap root written by `@astrojs/sitemap`, with a fallback for a flat index. */
const SITEMAP_ENTRY = 'sitemap-index.xml';
const SITEMAP_FALLBACKS = ['sitemap-0.xml', 'sitemap.xml'];

const LOC_PATTERN = /<loc>\s*([^<\s]+)\s*<\/loc>/g;

/** Read a file, returning `null` instead of throwing when it is missing. */
async function readIfPresent(filePath) {
  try {
    return await readFile(filePath, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

/** Extract every `<loc>` value from a sitemap document. */
function extractLocs(xml) {
  return Array.from(xml.matchAll(LOC_PATTERN), (match) => match[1].trim());
}

/**
 * Collect the page URLs of the build: the sitemap index lists child sitemaps,
 * and each child lists the page URLs.
 */
async function collectBuiltUrls() {
  const indexXml = await readIfPresent(path.join(BUILD_DIR, SITEMAP_ENTRY));

  if (!indexXml) {
    for (const fallback of SITEMAP_FALLBACKS) {
      const xml = await readIfPresent(path.join(BUILD_DIR, fallback));
      if (xml) return extractLocs(xml).filter((loc) => !loc.endsWith('.xml'));
    }
    throw new Error(
      `No sitemap found in ${BUILD_DIR}. Run \`npm run build\` before \`npm run indexnow\`.`,
    );
  }

  const childSitemaps = extractLocs(indexXml).filter((loc) => loc.endsWith('.xml'));
  const urls = [];

  for (const child of childSitemaps) {
    const fileName = new URL(child).pathname.split('/').pop();
    const xml = await readIfPresent(path.join(BUILD_DIR, fileName));

    if (!xml) {
      console.warn(`[indexnow] sitemap listed in the index but missing on disk: ${fileName}`);
      continue;
    }

    urls.push(...extractLocs(xml).filter((loc) => !loc.endsWith('.xml')));
  }

  return urls;
}

/** Turn a CLI argument into an absolute URL on the production host. */
function toAbsoluteUrl(value) {
  return new URL(value, HOST).toString();
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const explicit = args.filter((arg) => !arg.startsWith('--'));

  const urls = explicit.length > 0 ? explicit.map(toAbsoluteUrl) : await collectBuiltUrls();

  // IndexNow rejects a payload with a URL outside the declared host, so the
  // list is normalized and de-duplicated before it is sent.
  const urlList = Array.from(
    new Set(urls.map((url) => new URL(url, HOST).toString()).filter((url) => url.startsWith(HOST))),
  );

  if (urlList.length === 0) {
    throw new Error('No URLs to submit: the sitemap is empty and no route was passed.');
  }

  const payload = {
    host: HOST,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList,
  };

  console.log(`[indexnow] ${urlList.length} URL(s) prepared for ${HOST}`);
  console.log(`[indexnow] key file: ${KEY_LOCATION}`);

  if (dryRun) {
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(payload),
  });

  const body = await response.text();

  if (!response.ok) {
    throw new Error(
      `IndexNow rejected the submission: HTTP ${response.status} ${response.statusText}${
        body ? ` — ${body}` : ''
      }`,
    );
  }

  console.log(`[indexnow] accepted: HTTP ${response.status} ${response.statusText}`);
}

main().catch((error) => {
  console.error(`[indexnow] ${error.message}`);
  process.exitCode = 1;
});
