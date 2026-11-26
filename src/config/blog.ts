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

/**
 * URL slug and one-line description per category. The slug keeps the URL ASCII
 * only (`Educación en seguros` becomes `educacion-en-seguros`), while the label
 * stays exactly as the article frontmatter declares it.
 */
export const BLOG_CATEGORY_INFO: Record<BlogCategory, { slug: string; description: string }> = {
  'Seguro de auto': {
    slug: 'seguro-de-auto',
    description:
      'Guías sobre pólizas de auto, sumas aseguradas y qué revisar antes de contratar.',
  },
  Coberturas: {
    slug: 'coberturas',
    description:
      'Qué cubre cada nivel de póliza, qué queda fuera y cómo comparar coberturas sin engaños.',
  },
  Conductores: {
    slug: 'conductores',
    description:
      'Información para quienes manejan aplicaciones, reparten o usan el auto para trabajar.',
  },
  Renovaciones: {
    slug: 'renovaciones',
    description:
      'Qué revisar, qué comparar y qué cambiar cuando llega el momento de renovar tu póliza.',
  },
  Siniestros: {
    slug: 'siniestros',
    description:
      'Qué hacer antes, durante y después de un accidente, y cómo dar seguimiento al reclamo.',
  },
  'Educación en seguros': {
    slug: 'educacion-en-seguros',
    description:
      'Conceptos explicados en español claro: prima, deducible, coaseguro, suma asegurada y más.',
  },
};

/** Base route of the education center. */
export const BLOG_PATH = '/blog/';

/** Route of a single article, built from its file id (e.g. `que-cobertura-necesito`). */
export function blogPostPath(id: string): string {
  return `${BLOG_PATH}${id}/`;
}

/** Route of a category index, e.g. `/blog/categoria/coberturas/`. */
export function blogCategoryPath(category: BlogCategory): string {
  return `${BLOG_PATH}categoria/${BLOG_CATEGORY_INFO[category].slug}/`;
}

/** Resolves a category slug from the URL back to its label. */
export function categoryFromSlug(slug: string): BlogCategory | undefined {
  return BLOG_CATEGORIES.find((category) => BLOG_CATEGORY_INFO[category].slug === slug);
}

/**
 * Spanish long date used by the index and the article header, e.g.
 * `26 de noviembre de 2026`. Formatting lives here so every route always
 * prints the same string for the same date.
 */
export function formatBlogDate(date: Date): string {
  return new Intl.DateTimeFormat('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

/** Words an average reader covers per minute. */
const WORDS_PER_MINUTE = 200;

/**
 * Reading time for a Markdown body, rounded up so a short article never reads
 * as `0 min`. The body excludes the frontmatter, so metadata is not counted.
 */
export function readingTimeMinutes(body: string | undefined): number {
  const wordCount = (body ?? '').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));
}

/** Visible label for the reading time, e.g. `4 min de lectura`. */
export function readingTimeLabel(body: string | undefined): string {
  return `${readingTimeMinutes(body)} min de lectura`;
}
