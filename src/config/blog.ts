/**
 * Blog configuration.
 *
 * Single source of truth for the categories an article can declare. The
 * content collection schema validates every `category` frontmatter value
 * against this list, so a typo fails the build instead of producing a card
 * with a category that no other page knows about.
 *
 * Categories are visible copy and therefore stay in Spanish, even though the
 * identifiers and comments of the codebase are in English.
 */

export const BLOG_CATEGORIES = [
  'Seguro de auto',
  'Coberturas',
  'Conductores',
  'Renovaciones',
  'Siniestros',
  'Educación en seguros',
] as const;

export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

/** Base route of the education center. */
export const BLOG_PATH = '/blog/';

/** Route of a single article, built from its file id (e.g. `que-cobertura-necesito`). */
export function blogPostPath(id: string): string {
  return `${BLOG_PATH}${id}/`;
}

/**
 * Spanish long date used by the index and the article header, e.g.
 * `26 de noviembre de 2026`. Formatting lives here so both routes always print
 * the same string for the same date.
 */
export function formatBlogDate(date: Date): string {
  return new Intl.DateTimeFormat('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}
