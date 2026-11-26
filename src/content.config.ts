/**
 * Content collections.
 *
 * Astro 5 and later read the collection definitions from `src/content.config.ts`
 * and load entries through a loader; the old `src/content/config.ts` is only
 * accepted behind a deprecated compatibility flag, so it is not used here.
 * Articles themselves still live in `src/content/blog/`.
 */
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

import { BLOG_CATEGORIES } from './config/blog';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.coerce.date(),
    category: z.enum(BLOG_CATEGORIES),
    keywords: z.array(z.string()).optional(),
    heroImage: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
