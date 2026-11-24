/**
 * Shared class tokens for the landing pages.
 *
 * Every landing page section and every component under `components/landing`
 * reads its typography and layout classes from here, so the pages keep a
 * single visual system instead of copy-pasting Tailwind strings.
 *
 * `.landing-container` itself is defined in `src/styles/global.scss`.
 */
export const landingTokens = {
  container: 'landing-container',
  h2: 'text-[1.7rem] font-bold leading-tight tracking-[-0.02em] text-[var(--navy)] md:text-[2.1rem]',
  h3: 'mb-2 text-[1.15rem] font-bold text-[var(--navy)]',
  body: 'max-w-[70ch] text-[1.05rem] leading-relaxed text-[var(--text-muted)]',
  input:
    'w-full rounded-full border border-[#d1d9e6] bg-white px-4 py-3 text-[0.95rem] text-[var(--text-dark)]',
} as const;
