# SEO, Performance & Accessibility Audit — 1.7.0

**Date:** 27 November 2026
**Scope:** all 39 built pages (`dist/`)
**Branch:** `milestone-1.7.0-audit`
**Milestone:** 1.7.0 (1.7.1 SEO, 1.7.2 performance, 1.7.3 accessibility)

This document records what was measured, what was fixed, and what remains open.
Every number below comes from the two tools named in the next section; no figure
is estimated unless the text says so.

---

## 1. Method

Two complementary checks, because neither covers the other:

| Tool | What it answers | How to run |
| --- | --- | --- |
| `npm run audit` (`scripts/audit.mjs`) | Static checks over the built HTML: metadata, JSON-LD, internal link graph, sitemap, asset weight per page, form/label/ARIA markup, WCAG contrast of the palette | `npm run build && npm run audit` |
| Lighthouse 13.6 (headless Chrome) | Runtime Core Web Vitals and accessibility tree on a real page load | `npx astro preview` then `npx lighthouse http://localhost:4322/<route> --chrome-flags="--headless=new"` |

`npm run audit` exits non-zero on any failure, so it can gate a release. Its
contrast table is a checked-in snapshot of the palette values: when a literal
colour disappears from the compiled CSS the report marks the pair `[stale
snapshot]` so the pair is re-checked by hand instead of silently passing.

Lighthouse ran against `astro preview` on `http://localhost:4322` (production
build, mobile preset with simulated throttling). Scores are relative: the
origin is local, so network latency is lower than production and the
third-party fonts/icons are the dominant cost. No production URL was audited in
this session.

---

## 2. Result summary

| Area | Before | After |
| --- | --- | --- |
| Pages with a unique title / description / canonical | 39 / 39 | 39 / 39 |
| Pages with exactly one `<h1>` | 39 / 39 | 39 / 39 |
| Indexable orphan pages | 3 | 0 |
| Sitemap URLs | 37 | 34 |
| `<img>` without `alt` | 0 | 0 |
| `<img>` without explicit dimensions | 4 | 0 |
| Raster images outside the press kit | 4 | 0 |
| Contrast pairs failing AA | 3 | 0 |
| Home — Lighthouse performance | 77 | 82–87 (two runs) |
| Home — LCP | 6.1 s | 3.7–4.4 s |
| Home — CLS | 0 | 0 |
| Lighthouse accessibility (5 pages) | 96 on `/` | 100 on all five |
| Lighthouse SEO (5 pages) | 100 | 100 |

---

## 3. SEO (1.7.1)

### 3.1 Metadata, canonicals and headings — clean

39 routes, 39 unique `<title>`, 39 unique `<meta description>`, 39 unique
canonicals, exactly one `<h1>` per page, and no heading level skipped. Every
canonical is absolute on `https://avsegurosreal.com` and built from
`site.ts`, never from the request host, so local builds cannot leak
`localhost`.

### 3.2 Structured data — one real defect

What the build emits, and on how many pages:

| Type | Pages | Note |
| --- | --- | --- |
| `Organization`, `InsuranceAgency`, `PostalAddress` | 39 | site-wide, from `site.ts` |
| `BreadcrumbList` | 36 | every page except `/`, `/404` and `/gracias/` |
| `FAQPage` / `Question` / `Answer` | 9 | landing pages and `/faq/` |
| `Article` | 5 | 4 blog posts plus `/renovacion-de-poliza/` |
| `Service` | 8 | the eight landing pages |
| `CollectionPage`, `WebSite`, `ItemList` | 6 / 6 / 3 | blog index and category pages |
| `ContactPage` | 1 | `/contacto/` |
| `DefinedTermSet`, `DefinedTerm` | 1 / 1 | `/glosario/` |

The audit parses every block as JSON, checks that each page carries the
site-wide `Organization` + `InsuranceAgency` graph, that `BreadcrumbList`
positions are sequential and absolute, that every `Article` exposes
`headline`, `datePublished`, `author` and `mainEntityOfPage`, and — per
`docs/aeo.md` — that every `FAQPage` question text appears verbatim in the
visible copy.

- **Fixed:** `/renovacion-de-poliza/` was the only `Article` without
  `mainEntityOfPage`. Added (`mainEntityOfPage: pageUrl`).
- No warnings otherwise: no `aggregateRating`, no invented reviews, no
  `Answer` text that differs from the page.

### 3.3 Orphan pages — three empty blog categories

`/blog/categoria/renovaciones/`, `/blog/categoria/seguro-de-auto/` and
`/blog/categoria/siniestros/` had no inbound internal link: the only links to a
category page come from the cards of its published articles, and those three
categories have none yet. They were also thin, empty pages listed in the
sitemap.

Two ways out: link them from `/blog/` (a visible new category row, outside the
"no layout changes" rule of this milestone) or stop advertising them.
**Chosen:** mark them `noindex` while they hold no article, and keep them out of
the sitemap. The route and its empty state stay, so a visitor or an old link
still lands on a real page, and the page becomes indexable automatically the
moment its first article is published.

To keep the sitemap honest without a hand-maintained list, `astro.config.mjs`
now runs a small build hook (`sitemap-excludes-noindex`): after the sitemap is
written it reads every built HTML file, collects the canonical URLs of the pages
that carry `noindex`, and removes them from `sitemap-0.xml`. This is generic —
any future noindexed page is excluded with no config change.

- Sitemap went from 37 to 34 URLs (39 pages − `/gracias/` − `/404` − 3 empty
  categories).
- Robots meta: 34 × `index, follow`; `noindex, nofollow` on `/gracias/`,
  `/404` and the three empty categories.
- `robots.txt` was not modified in this milestone; the crawler policy from
  1.6.4 (allow `Googlebot`, `Bingbot`, `OAI-SearchBot`, `PerplexityBot`,
  `Claude-SearchBot`; block `GPTBot`, `CCBot`, `Google-Extended`,
  `ClaudeBot`, `anthropic-ai`, `Bytespider`) is unchanged.

### 3.4 Internal linking

Every one of the 39 pages is reachable from at least one other page. The link
graph is computed from `href` attributes only (JavaScript click handlers do not
count), and the check ignores `noindex` pages because they are deliberately not
promoted.

- **Fixed in Phase 0:** `/prensa/` is now linked from the footer. It was
  reachable only by direct URL and from `llms.txt` after 1.6.5.

### 3.5 Alt text and anchor text

44 `<img>` elements, all with an `alt` attribute. The header logo now uses
`alt=""` on purpose: the adjacent text already names the link, so a second
announcement would only repeat the brand to a screen reader. Icon-only links
and buttons are checked in section 5. Anchor text was not rewritten: every
in-content link already names its destination (`glosario de seguros`, `Abrir la
lista de documentos`, article titles).

---

## 4. Performance (1.7.2)

### 4.1 Images — the main fix

| Asset | Before | After | Where |
| --- | --- | --- | --- |
| Home hero background | 1,609 kB JPEG, 4000×2667, `loading="lazy"`, no dimensions | 328 kB WebP 1920×1280 on ≥768 px, 102 kB WebP 960×640 below, `loading="eager"`, `fetchpriority="high"`, `width`/`height` | `/` |
| Header logo | 115 kB PNG 501×501, no dimensions, on all 39 pages | 4.6 kB WebP 100×100 (rendered at 50 px), `width`/`height` | all pages |
| AXA logo | 56 kB WebP 3840×3840, no dimensions | 8.7 kB WebP 400×400, `width`/`height` | `/`, landing pages |
| Afirme logo | 13 kB JPEG 736×736, no dimensions | 4.1 kB WebP 400×400, `width`/`height` | `/`, landing pages |

- The hero was the LCP element and was lazy-loaded: it now ships eager with a
  priority hint, and the `<picture>` serves the 960 px file to phones instead of
  the desktop one.
- `logo.png` (117 kB) and `logo-bg-white.png` stay PNG on purpose: they are the
  press kit downloads on `/prensa/` and the `logo` of the `Organization`
  schema. The audit allowlists them and says why in code.
- The three files the header and hero import moved from `public/` to
  `src/assets/`, so Astro emits them once (hashed) instead of copying the
  source into `dist/` as well: `dist/` went from 3.8 MB to 3.4 MB.
- The remaining raster images are the landing-page hero backgrounds
  (`dist/images/heroes/*.webp`, 58–105 kB each), already WebP and referenced by
  URL.

### 4.2 JavaScript

- **React ships on one route only.** `/herramientas/que-seguro-necesito/`
  contains the only `<astro-island>` in the build; the three React chunks
  (`client.…js` 213 kB, `InsuranceAssistant.…js` 14 kB, `react.…js` 7.9 kB) are
  requested by that page and by no other. Every other page loads 5.1 kB of its
  own module scripts (attribution, WhatsApp tracking, layout).
- The island weight is 229 kB uncompressed (65 kB gzipped for React DOM alone),
  which is the largest script cost on the site. Lighthouse still reports 97–98
  performance and 0 ms TBT on that page because it is fetched after the
  `client:visible` trigger, not during load.
- `unused-javascript` on the island page: 40 kB estimated (part of React DOM).
- No script is duplicated, and there is no framework runtime on the other 38
  pages.

### 4.3 CSS and fonts

- Two stylesheets: `BaseLayout` 45.6 kB on every page, plus `index` 15.3 kB on
  the home page (60.9 kB raw, 8.5 kB gzipped for the shared one).
  Tailwind v4 emits one file per page graph; Lighthouse estimates 14 kB of
  `unused-css-rules` on both the home and the island page.
- **Open, not changed:** two render-blocking third-party stylesheets —
  Google Fonts (Inter) and Font Awesome 6.0.0-beta3 from cdnjs — cost an
  estimated 1.4–1.6 s on the throttled preset, and the Font Awesome webfonts add
  390–430 ms of `font-display` delay. Fixing this means self-hosting a font
  subset or replacing the icon font with inline SVG, which changes the design
  system, so it is proposed rather than done (section 7).
- Umami (`cloud.umami.is`) and Cloudflare Web Analytics are deferred and do not
  block rendering.

### 4.4 Core Web Vitals

Measured on a production build served by `astro preview`, mobile preset.

| Page | Performance | FCP | LCP | TBT | CLS |
| --- | --- | --- | --- | --- | --- |
| `/` (before the image fixes) | 77 | 1.9 s | 6.1 s | 50 ms | 0 |
| `/` (after) | 82–87 | 2.0–2.2 s | 3.7–4.4 s | 0–120 ms | 0 |
| `/seguros-de-auto/` | 98 | 1.9 s | 1.9 s | 0 ms | 0 |
| `/seguro-para-uber/` | 94 | 1.9 s | 2.9 s | 0 ms | 0 |
| `/contacto/` | 98 | 2.0 s | 2.0 s | 20 ms | 0 |
| `/herramientas/que-seguro-necesito/` | 97–98 | 1.9–2.1 s | 1.9–2.1 s | 0 ms | 0 |

Interpretation for production:

- **LCP.** On every page except the home page the LCP element is a text block
  and sits under 2 s. On the home page it is the hero photo; the remaining 3.7 s
  is mostly render delay from the two blocking stylesheets, not image transfer
  (the file loads in ~33 ms on the local origin). Self-hosting the fonts is the
  next lever.
- **CLS.** 0 on all five pages. Every `<img>` now declares `width`/`height`, the
  font is loaded with `display=swap`, and no element is injected above the fold
  after load. The island page measured 0.035 before the audit; it now measures
  0 because the audited build no longer shifts the accordion open state.
- **INP.** No page exceeds 120 ms of total blocking time, and the only
  interactive islands are the questionnaire (state updates, no network) and the
  tool scripts (checklist counters, calculator). The estimate is well inside
  the "good" 200 ms threshold; it is an estimate from TBT and main-thread work
  (0.9–1.3 s, dominated by style/layout), not a field measurement — INP needs
  real users, so the Umami/Cloudflare data collected from 1.6.3 onwards is the
  source of truth once traffic exists.

---

## 5. Accessibility (1.7.3)

### 5.1 Markup checks — clean after fixes

| Check | Result |
| --- | --- |
| `<html lang>` | 39 / 39 (`es`) |
| `<img>` with `alt` | 44 / 44 |
| Icon-only `<button>` with an accessible name | pass |
| `<a>` with an accessible name | pass |
| Font Awesome icons marked `aria-hidden="true"` | pass (decorative icons only; the icons that carry meaning sit inside a labelled control) |
| `input`/`select`/`textarea` with a label | pass — `LeadForm` uses `<label for>`, the printable checklists wrap the checkbox in its `<label>` |
| `aria-describedby` + `aria-invalid` on form errors | pass (`LeadForm`) |
| `aria-live` for progress/counter feedback | pass (glossary counter, checklist progress, document tabs) |
| Duplicate `id` attributes | none |
| Heading order | no skipped level on any page |

### 5.2 Megamenu and accordions

- The `Servicios` trigger is a `<button>` with `aria-expanded`, `aria-haspopup`
  and `aria-controls="servicesMenu"`, toggled by click/Enter/Space and closed by
  `Escape` (which returns focus to the trigger) or an outside click. The mobile
  hamburger has `aria-expanded`/`aria-controls` too, and the mobile column
  toggles expose `aria-expanded` with `aria-controls` pointing at the panel they
  collapse.
- The FAQ accordions on the home page, `/faq/` and the landing pages are native
  `<details>/<summary>`: the browser already exposes the expanded state, so no
  `aria-expanded` is added — duplicating it by hand is a common source of
  mismatched state.
- Keyboard behaviour was verified in code (Escape, focus return, `focusin`
  closes the panel when focus leaves it) and the Lighthouse accessibility tree
  passes on all five audited pages, but **no manual keyboard-only pass was run
  in a browser this session**. That remains the one check to repeat before
  release.

### 5.3 Colour contrast — three failures, fixed

WCAG AA needs 4.5:1 for normal text and 3:1 for non-text elements.

| Element | Before | After |
| --- | --- | --- |
| White text on primary red buttons | 4.17:1 (`--red-bright: #e63946`) | **4.82:1** (`#d92b39`) |
| Footer legal note on navy | 3.96:1 (`#5f7a9a`) | **4.73:1** (`#6b87a8`) |
| Red labels and links on the navy form | 3.19:1 | **6.83:1** (new `--red-on-dark: #ff8a94`) |

- `--red-bright` moved one shade darker, keeping the hue; every use (buttons,
  highlights, borders) inherits it, so the CTA text passes without touching each
  button.
- The navy hero card and the navy contact band needed a red that is *lighter*,
  not darker. `--red-on-dark` is used by `LeadForm` labels and by the privacy
  link inside the consent line when the form sits on a dark card.
- The footer legal note is 0.8 rem text, so it needs the full 4.5:1, not the
  3:1 large-text threshold; it was lifted to 4.73:1.
- Red icons and borders on navy measure 3.19:1, but they are `aria-hidden`
  decorative graphics, so 3:1 applies and they pass.
- The remaining pairs in the palette pass: body text 7.58:1 on white / 6.76:1 on
  the page background, headings 15.39:1, footer links 7.33:1, header links
  12.48:1.

### 5.4 A defect found by Lighthouse, not by the static audit

On the home page the navy contact band's description rendered `#475569` on
`#0b2545` (3.19:1) because `LeadForm` emitted `text-[var(--text-muted)]` and
`text-[#cbd5e1]` on the same element and the winner depended on the order
Tailwind emitted the utilities in. The `<h2>` had the same duplicate
(`text-[var(--navy)]` + `text-white`). Both class lists are now built
conditionally, so a navy section never carries the light-surface tokens. This is
exactly the kind of bug the static pass cannot see: it needs computed styles.

---

## 6. Reproducing the checks

```bash
npm run build          # 39 pages
npm run audit          # static report; non-zero exit on any failure
npx astro preview      # http://localhost:4322
npx lighthouse http://localhost:4322/ \
  --chrome-flags="--headless=new" \
  --only-categories=performance,accessibility,best-practices,seo \
  --output=json --output-path=lh-home.json
```

Notes on the Lighthouse run:

- `errors-in-console` fails on the local origin because the Cloudflare Web
  Analytics beacon (`cloudflareinsights.com/cdn-cgi/rum`) rejects
  `localhost:4322` by CORS. It reports a 96 in Best Practices for that reason
  only; the beacon is served by Cloudflare in production and is not part of the
  build.
- `interactive` (Time to Interactive) is deprecated and informational.
- Home performance varies between 82 and 87 across runs; the spread is the
  third-party stylesheet latency, which is why the font/icon work in section 7
  is the next improvement.

---

## 7. Open items and recommendations

Not fixed here, because each one changes more than the audit should:

1. **Self-host Inter and drop the Font Awesome CDN.** ~1.4–1.6 s of
   render-blocking CSS plus 390–430 ms of webfont delay on mobile. An `Inter`
   subset in `public/fonts/` with `font-display: swap` and a local
   `@font-face`, and the handful of icons replaced by inline SVG, would remove
   two third-party origins from every page. This is the largest remaining LCP
   win on the home page.
2. **React on `/herramientas/que-seguro-necesito/`.** 229 kB of JS for a
   four-step questionnaire. A vanilla rewrite would leave the page at the ~10 kB
   of every other route; the logic is already pure functions in
   `assistantLogic.ts`, so the migration is contained. Not worth doing before
   the page proves it converts.
3. **Category indexes.** The three empty categories become indexable on their
   own when the first article is published; no action needed then beyond a
   sitemap re-submission.
4. **Manual keyboard and screen-reader pass.** A human should tab through the
   header, the mobile menu, the forms and the three tools once, before the
   release, and confirm focus visibility on the red CTA against the navy
   header.
5. **IndexNow.** `npm run indexnow` has not been run against production: it
   needs the live sitemap, so it belongs to the release step (see
   `docs/aeo.md`).

---

## 8. Files changed in this milestone

| File | Change |
| --- | --- |
| `src/config/navigation.ts` | `/prensa/` added to the footer link list |
| `src/pages/blog/categoria/[category].astro` | `noindex` while the category has no article |
| `astro.config.mjs` | `sitemap-excludes-noindex` build hook |
| `src/pages/renovacion-de-poliza.astro` | `mainEntityOfPage` in the `Article` node |
| `src/components/Hero.astro` | WebP hero (desktop + mobile), explicit dimensions, eager/high priority, WebP insurer logos with dimensions |
| `src/components/Header.astro` | 100 px WebP logo with dimensions, decorative `alt` |
| `src/components/Brands.astro` | WebP Afirme logo, dimensions |
| `src/components/forms/LeadForm.astro` | Dark-surface red token, consent link variant, no conflicting navy/light utility classes |
| `src/components/Footer.astro` | Legal note colour raised to AA |
| `src/styles/global.scss` | `--red-bright` one shade darker, new `--red-on-dark` |
| `src/assets/hero-section.webp`, `hero-section-mobile.webp`, `logo-header.webp` | New optimised sources (moved out of `public/`) |
| `public/logo-axa.webp` | Resized from 3840 px to 400 px |
| `public/logo-afirme.webp` | Replaces the JPEG |
| `scripts/audit.mjs` | New static audit (`npm run audit`) |
| `package.json` | `audit` script |
| `ROADMAP.md` | 1.7.1–1.7.3 status |
