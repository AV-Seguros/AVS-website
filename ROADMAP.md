# AV Seguros Real — Website Roadmap

**Current version:** `1.4.4`
**Next milestone:** `1.5.0`
**Project type:** Insurance Website & Digital Lead Generation Platform
**Market:** Mexico
**Primary insurers:** AXA and Seguros Afirme
**Current stack:** Astro, JavaScript, Tailwind CSS
**Deployment:** GitHub Pages
**Future infrastructure:** Cloudflare Pages, Supabase and/or Vercel

---

## 1. Project Vision

AV Seguros Real will evolve from a traditional landing page into a multi-page digital platform focused on insurance education, customer acquisition, personalized guidance and lead generation.

The objective is not to replace the human insurance advisor with automated systems. Instead, the website should help visitors understand their options, identify their insurance needs and reach the advisor with better information.

The platform will prioritize:

- Clear and accessible insurance information.
- Dedicated landing pages for different insurance needs.
- Interactive tools that help visitors make informed decisions.
- Conversion-oriented user experiences.
- Search engine visibility and organic traffic.
- Direct communication through WhatsApp and contact forms.
- A scalable architecture that allows future backend integrations.

### Product philosophy

**Human expertise, supported by useful technology.**

The website should feel like a professional digital insurance service, not just an online advertisement.

---

# 2. Version Roadmap

## `1.0.0` — Initial Website Release

**Status:** Existing version.

The initial release establishes the public identity and basic lead-generation capabilities of AV Seguros Real.

### Existing functionality

- Main landing page.
- Responsive website layout.
- Hero section and primary call to action.
- About us section.
- Insurance services overview.
- AXA and Afirme branding.
- Testimonials section.
- Contact and quotation forms.
- WhatsApp contact shortcut.
- FAQ section.
- Footer and legal links.
- Static deployment through GitHub Pages.

This version serves as the foundation for all subsequent development.

---

## `1.1.0` — Website Architecture & Navigation Expansion

**Objective:** Transform the existing single-page website into a structured, indexable multi-page experience without changing its current visual identity.

This milestone is the technical foundation for everything that follows. It is delivered in five sequential sub-milestones, each one a self-contained agent session.

### `1.1.1` — Base layout + SEO component + site configuration

**Objective:** Establish the reusable structure that every future page depends on.

**Tasks**

- Create `src/layouts/BaseLayout.astro` as the single layout for all pages.
- Create `src/components/SEO.astro`, accepting: `title`, `description`, `canonicalPath`, `ogImage`, `noindex` (optional), `schema` (optional, array of JSON-LD objects).
- Create `src/config/site.ts` exporting site-wide constants: `siteUrl`, `siteName`, `advisorName`, `phone`, `whatsappNumber`, `email`, `address`, `socialLinks`, `defaultOgImage`.
- Create `src/config/navigation.ts` exporting the main navigation and footer link arrays.
- Move the existing `src/layouts/Layout.astro` behavior into `BaseLayout.astro` and keep `Layout.astro` as a thin re-export (or migrate `index.astro` directly) so no page renders unstyled.
- Ensure `astro.config.mjs` declares `site: 'https://avsegurosreal.com'` (HTTPS, no trailing slash) so canonical and sitemap URLs are absolute and correct.

**Verification**

- `npm run build` succeeds.
- `/` renders identically to the pre-change version (same sections, same styling).
- `site.ts` is the only place where the production domain is hardcoded.

### `1.1.2` — Foundational technical SEO: sitemap, robots.txt, canonical tags, Organization/LocalBusiness schema, Open Graph

**Objective:** Put in place, before any new page is published, the technical prerequisites that make pages indexable and shareable. This is not an audit; it is implementation.

**Tasks**

- Install `@astrojs/sitemap` and register it in `astro.config.mjs` with the production `site`.
- Create `public/robots.txt` with a differentiated crawler policy: allow search and answer-engine crawlers (`Googlebot`, `Bingbot`, `OAI-SearchBot`, `PerplexityBot`), block model-training crawlers (`GPTBot`, `Google-Extended`, `CCBot`, `ClaudeBot`, `anthropic-ai`, `Bytespider`), and declare the sitemap as `Sitemap: https://avsegurosreal.com/sitemap-index.xml`.
- Create `public/llms.txt` with a structured plain-text summary of the business (advisor, insurers AXA and Afirme, service area, insurance types) and links to the main landings (`/`, `/seguros-de-auto/`, `/seguros-para-uber/`, `/seguros-para-didi/`, `/seguros-para-repartidores/`, `/contacto/`), so answer engines can read the site without scraping HTML.
- Make `SEO.astro` emit, for every page: `<title>`, `<meta name="description">`, `<link rel="canonical">` built from `siteUrl + canonicalPath` (never from the request host), and `<meta name="robots" content="index, follow">` unless `noindex` is set.
- Emit Open Graph (`og:title`, `og:description`, `og:type`, `og:url`, `og:image`, `og:site_name`, `og:locale` = `es_MX`) and Twitter card (`summary_large_image`) tags.
- Add a default Open Graph image at `public/og/default.jpg` (1200×630) referenced from `site.ts`.
- Emit JSON-LD `Organization` + `LocalBusiness` (`InsuranceAgency` type) on every page via `SEO.astro`, sourced from `site.ts`: name, url, logo, telephone, email, address (with `addressCountry: "MX"`), `areaServed`, `sameAs`.
- Keep the schema conservative: no `aggregateRating`, no `review` markup, no invented data.

**Verification**

- `npm run build` succeeds and produces `dist/sitemap-index.xml` and `dist/sitemap-0.xml`.
- `dist/robots.txt` exists, references the sitemap, allows `Googlebot`/`Bingbot` and blocks `GPTBot`/`CCBot`.
- `dist/llms.txt` exists and every link in it points to a planned route that is published by the end of `1.2.0`.
- `dist/index.html` contains exactly one canonical tag, one title, one meta description, OG tags and one valid JSON-LD block (check with a JSON parse).
- Canonical URLs use `https://avsegurosreal.com/...` even when built locally.

### `1.1.3` — Skeleton pages: Home, Services, About Us, Contact, FAQ, Privacy Policy, Terms and Conditions, 404

**Objective:** Create every route the site will need, as minimal but complete skeletons. **Skeletons only** — content, sections and landing-page copy belong to later sub-milestones.

**Routes to create**

| Route                          | Page file                             |
| ------------------------------ | ------------------------------------- |
| `/`                            | `src/pages/index.astro` (existing)    |
| `/servicios/`                  | `src/pages/servicios.astro`           |
| `/quienes-somos/`              | `src/pages/quienes-somos.astro`       |
| `/contacto/`                   | `src/pages/contacto.astro`            |
| `/faq/`                        | `src/pages/faq.astro`                 |
| `/aviso-de-privacidad/`        | `src/pages/aviso-de-privacidad.astro` |
| `/terminos-y-condiciones/`     | `src/pages/terminos-y-condiciones.astro` |
| `/404`                         | `src/pages/404.astro`                   |
| `/gracias/`                    | `src/pages/gracias.astro` (existing, rendered with `noindex`) |

**Tasks**

- Every page uses `BaseLayout` + `SEO` with a unique `title`, `description`, `canonicalPath` and a single `<h1>` inside the page body.
- **Fix H1 ownership:** `Header.astro` currently owns the site's only `<h1>` (`AV · Seguros Real`), which would force every future page to share one H1. Change that element in `Header.astro` to a `<p>` (or `<div>`) keeping the same classes, so the header renders identically, and give each page its own `<h1>` in the body. Until `1.1.5` rewrites the Home H1, Home carries a temporary body `<h1>` with the current brand string.
- `/gracias/` is a confirmation screen, not a landing page: it keeps its chrome-free standalone layout and is rendered with `noindex`.
- Each page body contains only: breadcrumb placeholder area, `<h1>`, one short introductory paragraph, and a placeholder block (`<div data-placeholder="content">`) for future sections.
- `404.astro` uses `noindex` and links back to `/` and `/contacto/`.
- Do **not** create `/seguros-de-auto/` content here. A minimal placeholder for that route is allowed only if it is needed for navigation; the real landing page is delivered in `1.2.4`.

**Verification**

- `npm run build` succeeds and `dist/` contains one HTML file per route.
- Each route returns a unique title and H1; no placeholder text is visible on the Home page (Home keeps its current content).
- Every route exposes exactly one `<h1>`, and no `<h1>` comes from `Header.astro`.

### `1.1.4` — Navigation, footer, and breadcrumbs

**Objective:** Connect the skeleton pages through a consistent, mobile-usable navigation system.

**Tasks**

- Rebuild `Header.astro` from `navigation.ts`: main links to Services, About Us, Contact and FAQ, a visible primary CTA (WhatsApp or quotation), and a working mobile menu (open/close, `aria-expanded`, Escape to close, closes on link click).
- The rebuilt `Header.astro` must not render an `<h1>`: the brand is a link or a paragraph. Each page owns its single `<h1>` in the body.
- Rebuild `Footer.astro` from `navigation.ts`: service links, legal links, advisor contact data and WhatsApp link.
- Create `src/components/Breadcrumbs.astro`, rendering a visible trail plus `BreadcrumbList` JSON-LD, driven by a `trail` prop (`{ label, href }[]`). Home is not shown as a crumb.
- Add breadcrumbs to every inner page; omit them from `/` and `/404`.
- Mark the current page in the navigation with `aria-current="page"`.
- Do not change colors, typography or spacing tokens in `global.scss`.

**Verification**

- Every route is reachable from the header or footer; no dead links.
- Mobile menu at 375px opens, closes and navigates correctly.
- Breadcrumb JSON-LD parses and lists the expected ancestors.
- Home page visual output is unchanged apart from the header/footer link targets.
- No route renders an `<h1>` from the header; each page has exactly one `<h1>` in its body.

### `1.1.5` — Conservative refactoring of the Home page

**Objective:** Align the Home page with its target keyword without changing its appearance.

**Tasks**

- Set the Home `<h1>` to include the exact phrase **"seguro de auto en México"** (e.g. `Seguro de auto en México con asesoría personal`). The new `<h1>` lives in the hero section of the page body, **not** in `Header.astro`, which renders no heading; replace the temporary brand `<h1>` introduced in `1.1.3` so the page keeps exactly one `<h1>`.
- Set a unique `<title>` including the keyword and the brand, within ~60 characters (e.g. `Seguro de auto en México | AV Seguros Real`).
- Write a unique meta description (~150–160 characters) including the keyword, the insurers (AXA, Afirme) and a call to action. No keyword stuffing.
- Confirm heading order is `h1 → h2 → h3` with no skipped levels.
- Add descriptive `alt` text to existing images.
- **No visual changes:** no layout, section, color, spacing, copy-in-sections or component-structure modifications beyond the H1 text itself.

**Verification**

- `npm run build` succeeds.
- Rendered Home HTML contains exactly one `<h1>` with the keyword, the new `<title>`, the new description and the canonical `https://avsegurosreal.com/`.
- Visual diff against the previous build shows only the H1 string change.

---

## `1.2.0` — Insurance-Specific Landing Pages

**Objective:** Create dedicated landing pages targeting different customer profiles and insurance search intentions.

**Business rule:** Never promise that a specific AXA or Afirme policy covers a particular platform, occupation or vehicle use without verifying the applicable product conditions. Each landing page must provide useful, original information rather than duplicating another page with a different title.

### `1.2.1` — Uber landing page (complete vertical slice)

**Route:** `/seguro-para-uber/`

**Objective:** Deliver one fully finished landing page that becomes the template for every subsequent page in this milestone.

**Required sections, in order**

1. **Hero** — `<h1>` with the intent keyword (e.g. `Seguro de auto para conductores de Uber en México`), one-sentence value proposition, primary CTA, and a trust line mentioning AXA and Afirme.
2. **Primary CTA** — same destination and styling as the hero CTA; leads to the 3-field form on the same page.
3. **Short form (3 fields)** — name, WhatsApp number, email. Client-side validation, inline errors, explicit privacy consent checkbox linking to `/aviso-de-privacidad/`. Submission target is defined in section 8 of this document (pending backend; temporary external service or `mailto:` fallback must be stated in code comments only, not in visible copy).
4. **Educational sections** — at least four `h2` sections covering: what private car insurance typically covers vs. what platform use may require, why the declared vehicle use matters, what to check in the policy conditions, and what information the advisor needs to assess the case.
5. **Testimonials** — reuse the existing testimonial component or content; do not invent new named customers.
6. **FAQs** — 5–7 question/answer pairs, visible on the page.
7. **FAQPage schema** — JSON-LD generated from the same FAQ data source (single source of truth, no duplicated copy).
8. **Contextual WhatsApp link** — `https://wa.me/<number>?text=<encodeURIComponent(message)>` with a pre-filled message identifying the Uber landing page as the origin (e.g. `Hola, busco seguro de auto para conductor de Uber.`).

**Verification**

- `npm run build` succeeds; route exists and is in the sitemap.
- Unique title, description, H1 and canonical.
- Form rejects empty/invalid input and shows an inline error; valid input reaches the configured submission path.
- FAQPage JSON-LD matches the visible FAQ text exactly and parses.
- WhatsApp link opens with the pre-filled, correctly encoded message.
- At 375px there is no horizontal overflow.

**Status:** Done. Delivered at `/seguro-para-uber/` with the hero background served as WebP (1920px, quality 80); linked from the header mega menu and the footer.

### `1.2.2` — DiDi landing page

**Route:** `/seguro-para-didi/`

- Replicate the `1.2.1` structure component-for-component; extract shared sections into components if that reduces duplication (a landing-page layout or section components are acceptable).
- Adapt copy, keyword, FAQ set, WhatsApp pre-filled message and testimonial selection to DiDi drivers.
- Replace all Uber references; check for leftover strings before finishing.

**Verification:** same checklist as `1.2.1`, plus a search for `Uber` in the DiDi page source returning no matches.

**Status:** Done. Delivered at `/seguro-para-didi/`; the repeated sections were extracted to `src/components/landing/` so both driver pages render from the same components.

### `1.2.3` — Delivery Drivers landing page

**Route:** `/seguros-para-repartidores/`

- General delivery-driver content (motorcycles and cars, private vs. commercial use, declared use).
- Dedicated `h2` subsections for **Rappi** and **Uber Eats** drivers, each with its own short guidance and FAQ entries.
- Same form, testimonials, FAQPage schema and WhatsApp contextual link pattern.
- Note explicitly that delivery platforms and insurers define conditions separately; the page must not assert coverage.

**Verification:** same checklist as `1.2.1`; both platform subsections present with their own content.

**Status:** Done. Delivered at `/seguros-para-repartidores/` with platform-specific guidance and FAQ entries for Rappi and Uber Eats drivers.

### `1.2.4` — General Car Insurance landing page

**Route:** `/seguros-de-auto/`

**Objective:** This is the canonical, complete general car insurance page. It replaces the duplicate `/seguros-de-auto/` listing that previously appeared in `1.1.0`.

- **Original content**, not a copy of the Uber/DiDi pages.
- Sections: what car insurance is in Mexico and why it matters; coverage types (civil liability, limited, comprehensive); deductibles and coinsurance explained plainly; how the quotation process works; what documents are needed; AXA and Afirme positioning as options, not guarantees; FAQ block with `FAQPage` schema; 3-field lead form; contextual WhatsApp CTA.
- Internal links to the Uber, DiDi and delivery-driver pages where the visitor's use case differs.

**Verification:** same checklist as `1.2.1`; content overlap with the Uber/DiDi pages limited to shared boilerplate (form, testimonials, CTA).

**Status:** Done. Delivered at `/seguros-de-auto/` as the canonical general car insurance page, with internal links to the driver landings.

### `1.2.5` — Landing pages for other insurance types

**Routes**

- `/seguros-de-vida/`
- `/seguros-de-hogar/`
- `/seguros-empresariales/`
- `/seguros-de-gastos-medicos/`

- Reuse the landing-page structure from `1.2.1`, adapted per product (no vehicle-specific fields or copy).
- Each page: unique H1/title/description, educational sections, FAQs with `FAQPage` schema, 3-field form, contextual WhatsApp link.
- Create or update an `/otros-seguros/` hub page linking to all four only if it is needed for navigation; otherwise link them from `/servicios/` and the footer.
- Do not invent coverage details, prices, or insurer guarantees.

**Verification:** each route builds, is indexable, has unique metadata, a working form and a working WhatsApp CTA.

**Status:** Done. The four product routes build from the shared landing components and are listed in the header mega menu and the footer, so no `/otros-seguros/` hub was needed.

### `1.2.6` — Global FAQ page and Contact page schema

**Objective:** Give the site one authoritative FAQ surface plus a machine-readable contact page, both cross-cutting rather than product-specific.

- Expand `/faq/` from the `1.1.3` skeleton to 10–15 questions that cut across products and intents: coverage (what private car insurance typically covers versus what commercial use may require, plus life, home, business and medical products), the quotation process (what the advisor needs, how long it takes, whether it costs anything) and claims (first steps after a loss, what the insurer requires, what the advisor's role is).
- Reuse FAQ entries from the landing pages where the wording is identical instead of duplicating copy; where wording differs, link to the more detailed landing-page answer.
- Emit `FAQPage` JSON-LD generated from the same data source that renders the visible questions, so schema and copy cannot drift.
- Group questions under `h2` sections, keep heading order `h1 → h2 → h3`, and keep every answer readable without JavaScript.
- Add `ContactPage` JSON-LD to `/contacto/` alongside the site-wide `Organization`/`LocalBusiness` schema, sourced from `site.ts`: advisor name, telephone, email, postal address and the canonical URL.
- Do not invent coverage guarantees, prices or response times.

**Verification**

- `npm run build` succeeds; `/faq/` and `/contacto/` are both in the sitemap.
- FAQ count is between 10 and 15; every visible question appears verbatim in the `FAQPage` JSON-LD and the JSON parses.
- `/contacto/` contains exactly one `ContactPage` node plus the site-wide business node, and both parse.

**Status:** Done. Delivered alongside the FAQ and schema work: breadcrumbs now render below the hero on every landing page, and the Uber/DiDi hero backgrounds were converted to WebP (1920px, quality 80) so the PNG sources are no longer referenced.

### `1.2.7` — Header navigation overhaul (mega menu)

**Objective:** The header still lists four flat links while the product catalogue keeps growing in the footer. Replace that with a mega menu that organizes the insurance products and the tools before `1.2.5` and `1.3.x` add more routes.

- Refactor `Header.astro` to render grouped dropdowns from `navigation.ts`: one group for insurance products (auto, Uber, DiDi, repartidores, vida, hogar, empresariales, gastos médicos) and one for tools (calculators, checklist). Keep the existing top-level links (Servicios, Quiénes somos, Contacto, Preguntas frecuentes) available.
- Extend the navigation config so a group has a label, an optional hub link and a list of child links; the header and the footer read the same structure, and only routes that exist are listed.
- Dropdowns must be operable with mouse, keyboard and touch: toggle with click/Enter/Space, close on `Escape` and outside click, expose `aria-expanded` / `aria-controls`, and never rely on hover alone.
- The mobile menu must support the same nesting: expandable submenus, visible focus states, scrollable panel, no horizontal overflow at 375px.
- No layout shift on page load, no framework runtime added (Astro markup plus a small vanilla script), and the current page is still marked with `aria-current`.

**Verification**

- `npm run build` succeeds; the header renders only existing routes and every link resolves.
- Keyboard-only navigation reaches every child link, `Escape` closes an open menu, and focus is not trapped.
- The mobile menu opens, expands and collapses nested groups at 375px with no horizontal overflow.
- Header and footer agree on the same product list (single source of truth in `navigation.ts`).

**Status:** Done. The "Servicios" entry opens a two-column mega menu (people / work) on desktop and an accordion group in the mobile menu, both driven by `serviceGroups` in `navigation.ts`. The same session completed the `/contacto/` layout (lead form, advisor, contact channels, hours) and removed the unreferenced hero PNGs from `public/images/heroes/`.

### `1.2.8` — Services and legal pages content

**Objective:** Replace the three routes that still render an empty placeholder block with real content, so no published page is a skeleton.

**Routes**

| Route                       | Page file                                |
| --------------------------- | ---------------------------------------- |
| `/servicios/`               | `src/pages/servicios.astro`               |
| `/aviso-de-privacidad/`     | `src/pages/aviso-de-privacidad.astro`     |
| `/terminos-y-condiciones/`  | `src/pages/terminos-y-condiciones.astro`  |

**Tasks**

- Fill `/servicios/` with every insurance type the agency sells (car, life, home, business, medical expenses, Uber, DiDi and delivery drivers), one short paragraph per product and a link to its landing page. Derive the list from `productNavigation` in `navigation.ts` so the page cannot drift from the header and the footer.
- Write the real privacy notice for `/aviso-de-privacidad/` as an LFPDPPP-compliant draft: identity and domicile of the data controller (from `site.ts`), categories of personal data collected, primary and secondary purposes, the consent mechanism the forms already use, means to exercise ARCO rights, the contact channel for data requests, transfers (insurers only when a quotation is requested) and how changes to the notice are communicated.
- Write `/terminos-y-condiciones/`: scope of the published information, the statement that no page is an insurance offer or an underwriting decision, that AXA and Afirme are independent insurers, that platform names (Uber, DiDi, Rappi, Uber Eats) are used descriptively with no partnership implied, intellectual property, third-party links and governing law (Mexico).
- Both legal pages show a visible `Última actualización` date sourced from a single place, so future edits keep it current.
- The legal drafts are delivered for the advisor's review; the session report must state that they are drafts and not legal advice.

**Verification**

- `npm run build` succeeds and none of the three routes still contains `data-placeholder="content"`.
- `/servicios/` lists every entry in `productNavigation` and every link resolves to a built route.
- Each route keeps a unique title, description, canonical and exactly one `<h1>`.
- The privacy notice names the data controller from `site.ts` character for character and links to a working contact channel.
- Both legal routes are indexable and appear in the sitemap.

**Status:** Done. `/servicios/` renders both groups from `serviceGroups`, with the one-line description stored next to each product in `navigation.ts` and a build-time guard that fails when a product lacks one. The privacy notice and the terms are published as LFPDPPP and Mexican-law **drafts**: a visible banner states that a lawyer must review them before they are considered final, and `siteConfig.legalLastUpdated` feeds the shared `LegalPageNotice` component on both routes.

---

## `1.3.0` — Interactive Insurance Tools

**Objective:** Introduce useful tools that make the website more than an informational platform and help visitors understand their needs before contacting the advisor.

Tools must never present themselves as underwriting, eligibility or quotation systems.

### `1.3.1` — Deductible calculator

**Route:** `/herramientas/calculadora-deducible/`

- Pure JavaScript, no dependencies, no framework island.
- Inputs: estimated vehicle value, example deductible percentage, hypothetical damage amount.
- Outputs: estimated deductible, amount the policyholder would pay, amount covered (labelled as hypothetical).
- Validates numeric input, handles zero/negative/empty values without NaN output.
- Permanent visible disclaimer: real deductibles depend on the contracted policy.

**Verification:** correct arithmetic for at least three sample inputs; no console errors; no hydration payload added.

### `1.3.2` — "What insurance do I need?" assistant

**Route:** `/herramientas/que-seguro-necesito/`

- Astro page + **React island** hydrated with `client:visible`. Add `@astrojs/react` and `react`/`react-dom` in this session only.
- Multi-step questionnaire (4–5 steps): vehicle type, usage, private/commercial, protection interest, state.
- Progress indicator, back navigation, answer summary at the end.
- Final screen: personalized summary + CTA to WhatsApp with the answers encoded into the message, plus a link to the relevant landing page.
- Explicit disclaimer: educational guidance, not an insurance offer.

**Verification:** the island hydrates only when scrolled into view (check that no React bundle executes before visibility); full flow completes on mobile; summary text matches the selected answers.

**Status:** Done. Delivered at `/herramientas/que-seguro-necesito/` as the site's first React island, hydrated with `client:visible`; no other route ships a React chunk. The questionnaire runs in four steps for vehicles (vehicle type and declared use) and three for every other answer, with a progress bar, back navigation that preserves the answers, and a summary that links to the matching landing page and pre-fills the WhatsApp message with the selections. Every rule and the message builder live in `assistantLogic.ts` as pure functions, so they were checked from Node without a browser. Adding React also required listing the React entries in `optimizeDeps.include` (`astro.config.mjs`): Vite 8 does not pre-bundle `react-dom/client`, so without that the island failed to hydrate under `astro dev` while the static build worked.

### `1.3.3` — Contextual WhatsApp message generator

- Vanilla JS utility (`src/scripts/whatsapp.ts` or `.js`) exporting a builder that accepts a context key and optional params and returns an encoded `wa.me` URL.
- Context keys: `general`, `cotizacion-auto`, `uber`, `didi`, `repartidores`, `poliza-existente`, `renovacion`, plus one per insurance type.
- Replace hardcoded WhatsApp links on existing pages with this utility.
- Number sourced from `site.ts` only.

**Verification:** every CTA on the site produces a distinct, correctly encoded message; no `wa.me` URL with a hardcoded number remains in components.

**Status:** Done. `src/scripts/whatsapp.ts` exports `buildWhatsAppUrl(context, params)` and the message builder behind it; the number is read from `site.ts` in that module only, and `{placeholders}` are filled from the optional params and re-spaced so no marker or double space ever ships. The templates cover general, car quotation, one key per insurance type, Uber, DiDi, delivery, services, other products, contact, the calculator, the assistant, the accident guide, an existing policy and a renewal. Header, footer, floating button, homepage services block, `/servicios/`, `/contacto/`, the calculator, `/herramientas/que-seguro-necesito/` and the eight landing pages now call the builder; the React assistant keeps its own signature but delegates to the same utility through `assistantLogic.ts`, so its behavior did not change.

### `1.3.4` — Post-accident checklist

**Route:** `/herramientas/checklist-accidente/`

- Static HTML + vanilla JS, no island.
- Ordered steps: safety first, emergency services if needed, insurer assistance line, gather policy and evidence information, follow the insurer's instructions.
- Interactive checkboxes with progress state kept in memory (no storage requirement).
- Print-friendly styling and a clear disclaimer that it does not replace the insurer's official procedure.

**Verification:** checkboxes toggle and progress updates; page prints legibly; content renders without JS.

**Status:** Done. `/herramientas/checklist-accidente/` lists six ordered steps as static HTML (safety, emergency services, insurer report, no agreements on site, evidence, follow the insurer's instructions), with native checkboxes that drive a `X de 6 pasos completados` counter, a progress bar and a completed state, all held in the DOM and never in storage. The disclaimer `Esta guía no reemplaza el procedimiento oficial de la aseguradora.` sits under the list, and a WhatsApp CTA closes the page. Print rules hide the header, footer, progress and CTA and keep each step on one page, and the route is listed in the tools mega menu.

---

## `1.4.0` — Customer Education Center

**Objective:** Build an educational content section that supports organic traffic, improves customer confidence and creates opportunities for social media content.

Base route: `/blog/`. Content should be useful, accurate and written for real people rather than created exclusively to target search engines.

### `1.4.1` — Blog structure + first foundational article

- Create an Astro content collection (`src/content/blog/`) with a typed schema: `title`, `description`, `publishDate`, `category`, `keywords`, `heroImage` (optional), `draft`.
- Create `/blog/` index listing published articles (title, description, date, category).
- Create the article route `/blog/[slug]/` using `BaseLayout` + `SEO` + `Breadcrumbs` + `Article` JSON-LD.
- Publish the first article: *"¿Qué cobertura de seguro de auto necesito en México?"*
- Categories defined in a config file: Car insurance, Coverage, Insurance for drivers, Renewals, Claims and accidents, Insurance education.

**Verification:** article builds at its slug, appears on the index, has unique metadata, one H1 and valid `Article` schema.

**Status:** Done. The `blog` collection is defined in `src/content.config.ts` (Astro 5+ reads the collection config from there; the legacy `src/content/config.ts` is only accepted behind a deprecated flag), loads `src/content/blog/**/*.md` through the `glob` loader and validates `title`, `description`, `publishDate`, `category` (restricted to the six labels exported by `src/config/blog.ts`), `keywords`, `heroImage` and `draft`. `/blog/` lists published articles newest first in a card grid with category, Spanish long date, title, description and link; `/blog/que-cobertura-necesito/` renders the 711-word first article inside a custom typographic container (the project does not install `@tailwindcss/typography`, so no `prose` class), with `Article` JSON-LD (headline, dates, section, author, publisher, `mainEntityOfPage`) plus the existing `BreadcrumbList`, and an advisor CTA to WhatsApp and `/contacto/`. Drafts have no route. A related-articles block is intentionally left to `1.4.3`; the article section closes with the advisor CTA instead. `Blog` was added to `mainNavigation`, so the header and the footer "Enlaces" column both link to `/blog/`.

### `1.4.2` — 3 additional foundational articles

- *"Cobertura limitada vs. cobertura amplia: diferencias"*
- *"¿Mi seguro de auto privado cubre Uber?"* (links to `/seguro-para-uber/`)
- *"¿Qué es un deducible?"* (links to the deductible calculator)

Each: 700+ words, unique metadata, at least one contextual CTA, internal links to relevant landing pages.

**Verification:** three new routes build and appear in the index and sitemap.

**Status:** Done. `cobertura-limitada-vs-amplia.md` (812 words), `seguro-privado-cubre-uber.md` (725 words) and `que-es-un-deducible.md` (836 words) are published under `Coberturas`, `Conductores` and `Educación en seguros`, each with its own H2/H3 structure, a contextual CTA to `/contacto/` and the internal links the roadmap asks for (`/seguros-de-auto/`, `/seguro-para-uber/` and `/seguro-para-didi/`, `/herramientas/calculadora-deducible/`). All four articles share `publishDate: 2026-11-26`, so the index orders them by file id inside the same date; the category labels are visible on every card, while category filtering and category index pages remain part of `1.4.3`.

### `1.4.3` — Blog navigation: categories, related content, breadcrumbs, structured data

- Category index pages (`/blog/categoria/[category]/`) with `CollectionPage` + `BreadcrumbList` JSON-LD.
- Related-articles block (same category, excluding current article, max 3).
- Reading time computed from content.
- Contextual quotation CTA component reused across articles.
- Blog breadcrumbs: Home → Blog → Category → Article.

**Verification:** category pages list only their category; related links never include the current article; no orphan articles.

**Status:** Done. `/blog/categoria/<slug>/` is a single dynamic route that builds one page per category (ASCII slugs, Spanish labels preserved) from `BLOG_CATEGORY_INFO` in `src/config/blog.ts`; each page emits `CollectionPage` with an `ItemList` of its articles plus the existing `BreadcrumbList`, and the three categories without published articles render an explicit empty state instead of a 404. The card design moved into `src/components/blog/ArticleCard.astro`, shared by the index and every category page, and the category label on each card links to its category page. Reading time is `Math.ceil(words / 200)` computed from the Markdown body in `blog.ts` and shown on every card and below the article title. Related articles are filtered by category, exclude the current article, are capped at three and the whole block is omitted when the category has no sibling. Article breadcrumbs now read `Blog → Category → Article` (with `Inicio` still present in the JSON-LD), and the closing CTA moved to `src/components/blog/ArticleCTA.astro`. The four articles were re-dated from 2026-11-20 to 2026-11-26 so the newest-first order is meaningful.

### `1.4.4` — Insurance glossary + downloadable resources

**Route:** `/glosario/`

- Glossary page with anchor per term and client-side filtering by text (vanilla JS).
- Minimum terms: prima, deducible, valor asegurado, responsabilidad civil, contratante, asegurado, beneficiario, cobertura, siniestro, endoso, renovación, póliza, vigencia, copago.
- Each glossary term exposes a stable anchor so landing pages and articles can deep-link to it.
- Downloadable PDFs in `public/descargas/`: quotation preparation checklist, insurance terminology guide, policy renewal checklist, accident checklist.
- Downloads require no personal data.

**Verification:** filtering narrows the list; every anchor resolves; each PDF link returns a valid file in the build.

**Status:** Done, with one deliberate substitution: the downloads are **print-ready HTML pages instead of PDFs in `public/descargas/`**. Generating binary PDFs from code would add a build step and a second copy of every checklist to maintain, while a printable page stays indexable, accessible and translated with the rest of the site. `/glosario/` renders 18 terms (the 14 required plus coaseguro, suma asegurada, ajustador and cancelación) from `src/config/glossary.ts`, each with a stable anchor (`#deducible`, `#responsabilidad-civil`, …), an `h2` and a two-to-three-sentence definition, plus a vanilla-JS search box that filters on term and definition ignoring accents and case, an `aria-live` counter and an empty state, and a `DefinedTermSet` JSON-LD node per term. `/recursos/` is the hub for three printable pages built on `src/components/resources/PrintResource.astro`: `/recursos/checklist-cotizacion/`, `/recursos/guia-terminos/` (rendered from the same glossary data) and `/recursos/checklist-renovacion/`; each one prints black on white with the header, footer, floating WhatsApp button, breadcrumbs and action bar hidden, and opens the print dialog directly when reached with `#imprimir` from the hub's **Imprimir / Guardar como PDF** buttons. A `Recursos` column (glosario and guías) now sits in the header mega menu as its fourth column, and the menu CTA moved to a full-width band under the columns so no cell has to wrap. Both routes are listed in the footer "Enlaces" column.

---

## `1.5.0` — Insurance Assistance Tools

**Objective:** Add practical resources that visitors can use before and after purchasing an insurance policy.

### `1.5.1` — Documentation checklist for quotes

**Route:** `/herramientas/documentos-para-cotizar/`

- A checklist of documents/information typically required: identification, vehicle data (make, model, year, plates), postal code, declared use, driver history where applicable, current policy if renewing.
- Grouped by scenario (new quote, renewal, change of vehicle).
- Checkbox interaction in vanilla JS; print-friendly.
- Contextual WhatsApp CTA to send the completed list to the advisor.

**Verification:** each scenario shows the correct subset; CTA carries the scenario context.

### `1.5.2` — Policy renewal guide

**Route:** `/renovacion-de-poliza/`

- Educational guide: why to review coverage at renewal, what changes (vehicle value, usage, deductibles, endorsements), what to compare, timeline before expiry.
- Contextual WhatsApp CTA (`renovacion` context) and a link to the documentation checklist.
- No reminder automation, no email capture requirement.

**Verification:** route builds with unique metadata, one H1, and both CTAs working.

### `1.5.3` — Glossary integration with landing pages

- Add inline glossary tooltips/links to defined terms on `/seguros-de-auto/`, `/seguro-para-uber/`, `/seguro-para-didi/`, `/seguros-para-repartidores/` and the four product pages.
- Reuse a single small component that reads the glossary data source; no duplicated definitions.
- Limit to 3–6 terms per page so reading is not interrupted.

**Verification:** every tooltip term matches a glossary entry; links land on the correct anchor; no broken anchors across the site.

---

## `1.6.0` — Conversion Optimization & Lead Generation

**Objective:** Improve how visitors become qualified leads and reduce friction throughout the quotation process.

### `1.6.1` — Consolidate duplicate forms + determine form backend

- Inventory every form on the site; consolidate into one `LeadForm.astro` component with props for `source`, `context`, `fields` (default 3-field set) and `ctaLabel`.
- Remove superseded form components and duplicated markup.
- **Decide and document the backend** in this session (see section 8): either a hosted form endpoint, a serverless function, or a documented `mailto:` fallback.
- Implement the chosen path with: client-side validation, inline errors, explicit consent checkbox, success state, and failure state with an alternative contact (WhatsApp).
- Document the decision and its trade-offs in a short `docs/forms.md` note or in section 8 of this file.

**Verification:** exactly one form implementation remains; every page using a form passes `source`; a successful and a failed submission are both demonstrated.

### `1.6.2` — Lead source attribution

- Capture `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `document.referrer` and the originating landing page path on first visit.
- Persist in `sessionStorage`; attach as hidden fields on form submission and append a short origin line to contextual WhatsApp messages.
- No cookies, no third-party scripts, no PII beyond what the user submits.

**Verification:** visiting with UTM params then submitting includes the parameters; direct visit falls back to referrer/origin path without errors.

### `1.6.3` — Analytics and conversion events

- Choose and install a privacy-respecting analytics tool with a documented consent approach.
- Emit events: `whatsapp_click` (with context), `lead_form_start`, `lead_form_submit`, `lead_form_error`, `tool_complete` (calculator, assistant, checklist).
- Single tracking helper module; no inline tracking snippets scattered across components.
- Verify no events fire before consent where consent is required.

**Verification:** each event fires once per action with the expected payload; pages remain functional with the analytics script blocked.

### `1.6.4` — AI-era discoverability

**Objective:** Make the site discoverable and citable by search engines and answer engines, not merely crawlable.

- Register the site in Bing Webmaster Tools and Google Search Console (moved here from `1.7.1`), verify ownership through the domain or an HTML meta tag, submit `https://avsegurosreal.com/sitemap-index.xml` in both, and record the baseline impressions/clicks per property.
- Implement IndexNow: generate a key, publish it at `/<key>.txt`, and submit changed URLs on release (manually or from the deploy workflow). Document the key location and the submission command.
- Confirm `robots.txt` lets `Googlebot`, `Bingbot` and answer-engine crawlers reach indexable pages while training crawlers stay blocked, and re-check `public/llms.txt` for stale links.
- Create `docs/aeo.md` with the site's Answer Engine Optimization guidelines: question-shaped `h2` headings, a self-contained 40–60 word answer directly under each question, one entity per page with consistent name/address/phone, dated facts, and the rule that schema copy must match visible copy.
- Keep the advisor's real data in `site.ts` as the single source for entity consistency; no invented credentials, statistics or certifications.

**Verification**

- Both webmaster tools show the site verified and the sitemap accepted without errors.
- An IndexNow submission returns `200`/`202` and the key file resolves publicly at its documented path.
- `docs/aeo.md` exists and every guideline in it is checkable against a named page.

### `1.6.5` — Off-site presence and digital PR

**Objective:** Build the off-site signals an insurance advisor needs in order to be found and trusted, and make them auditable.

- Directory registration checklist: Google Business Profile (confirmed address, phone, hours and a link to `/contacto/`), the CONDUSEF public registry as applicable, and the AXA and Afirme agent or provider directories. Record each listing's status, URL and the exact NAP used.
- NAP consistency rule: name, address and phone must match `site.ts` character for character on every listing; the canonical domain is `https://avsegurosreal.com`.
- Backlink checklist: local business and chamber directories, insurer partner pages, delivery-platform driver communities where participation is allowed, and any press or interview mention. Track target, status, resulting URL and whether the link is `follow`.
- Publish a public advisor bio on `/quienes-somos/` as the canonical citation target for directories and press, using only real experience, certifications and insurer relationships.
- No paid links, no link schemes, no invented awards or memberships.

**Verification**

- The directory and backlink checklists exist as a tracked document with a status per entry.
- `/quienes-somos/` carries the bio built from `site.ts` data and no unverifiable claims.
- A spot check of at least three live listings shows identical NAP and a working link back to the site.

---

## `1.7.0` — SEO, Performance & Accessibility (audit and in-depth review)

**Objective:** Audit and deepen the technical quality of the site. Implementation prerequisites already shipped in `1.1.2`; this milestone reviews, measures and fixes at depth.

### `1.7.1` — SEO audit and fixes

- Audit titles, descriptions and H1 uniqueness across every route; fix duplicates.
- Verify canonical correctness in production (no localhost or http variants), sitemap completeness, robots.txt, and absence of `noindex` on indexable pages.
- Review heading hierarchy, internal linking depth (no orphan pages), image `alt` text and descriptive anchor text.
- Validate structured data (`Organization`/`LocalBusiness`, `FAQPage`, `Article`, `BreadcrumbList`) with a validator; fix warnings.
- Review the Google Search Console and Bing Webmaster Tools baselines collected in `1.6.4`; do not re-verify properties or resubmit the sitemap here.
- Deliverable: written audit findings + fixes applied.

### `1.7.2` — Performance and Core Web Vitals

- Measure LCP, CLS and INP on Home and the three highest-traffic landing pages (mobile, throttled).
- Optimize images (formats, dimensions, `loading`/`decoding`, explicit width/height to prevent CLS).
- Audit JS: confirm islands hydrate only where intended, remove unused scripts, confirm no framework runtime is loaded on pages without islands.
- Review CSS delivery and font loading.
- Record before/after measurements in the audit document; do not claim improvements without numbers.

### `1.7.3` — Accessibility

- Keyboard-only pass on navigation, mobile menu, forms and tools; visible focus states throughout.
- Semantic landmarks, correct form labels and error associations (`aria-describedby`, `aria-invalid`).
- Color contrast check on text and CTA buttons against WCAG AA.
- Screen-reader labels for icon-only controls; `aria-live` for form and tool feedback.
- Fix findings; document what was fixed and what remains.

---

## `1.8.0` — Progressive Infrastructure & Integrations

**Objective:** Prepare the website for future dynamic functionality without prematurely introducing unnecessary backend complexity.

### Infrastructure evaluation

Review the possibility of moving selected infrastructure from GitHub Pages to:

- **Cloudflare Pages:** Static hosting, deployment and edge capabilities.
- **Supabase:** PostgreSQL, authentication, storage and future application data.
- **Vercel:** Serverless functions and integrations when required.

These services do not need to be adopted simultaneously.

### Potential integrations

- Form handling and lead delivery.
- Secure storage for future customer documents.
- Dynamic content management.
- Server-side quotation request processing.
- Analytics and conversion events.
- WhatsApp Business integrations.

### Technical principles

- Keep public website content statically generated whenever possible.
- Never expose private credentials or service-role keys in frontend code.
- Do not store sensitive customer information in public repositories.
- Introduce authentication only when a real protected experience is ready.
- Avoid infrastructure migration without a clear technical or business benefit.

---

## `1.9.0` — Advanced Website Experience

**Objective:** Introduce more sophisticated features that improve the visitor experience and create a foundation for future customer-facing services.

### Potential features

- Advanced insurance needs assistant.
- Interactive insurance education hub.
- Improved quotation preparation workflows.
- Personalized resource recommendations.
- More detailed service and coverage guides.
- Dynamic FAQs.
- Improved multilingual or regional content if business demand justifies it.

Features requiring real-time insurer pricing, underwriting or policy data must remain out of scope until reliable integrations or authorized data sources are available.

---

## `2.0.0` — Digital Insurance Platform

**Objective:** Consolidate the website into a mature digital platform with a clear separation between public services and future authenticated experiences.

### Public platform

- Marketing website.
- Insurance landing pages.
- Educational content.
- Interactive tools.
- Quotation preparation.
- Lead generation.
- WhatsApp communication.

### Future private experiences

These are intentionally deferred until the public platform has demonstrated business value.

- Customer portal.
- Policy information.
- Renewal tracking.
- Secure document access.
- Customer communication history.
- Administrative dashboard.
- Lead and customer management.
- Sales and commission reporting.

The customer portal and administrative dashboard are separate future products, not prerequisites for improving the public website.

---

# 3. Development Priorities

The roadmap is sequential. The first block is a hard dependency chain: nothing else starts until it is complete.

| Priority | Sub-milestone | Scope                                             | Business value                                  |
| -------- | ------------- | ------------------------------------------------- | ----------------------------------------------- |
| P0       | `1.1.1`       | Base layout, SEO component, site configuration     | Single foundation for every page                |
| P0       | `1.1.2`       | Sitemap, robots, canonical, schema, Open Graph     | Makes the site indexable and shareable          |
| P0       | `1.1.3`       | Skeleton pages for all core routes                 | Establishes the route surface                   |
| P0       | `1.1.4`       | Navigation, footer, breadcrumbs                    | Makes the site navigable and crawlable          |
| P0       | `1.1.5`       | Conservative Home refactor (keyword H1, title, meta) | Captures the primary search intent            |
| P0       | `1.2.1`       | Uber landing page as a complete vertical slice     | Proves the reusable landing-page template       |
| P0       | `1.2.0` (rest) | DiDi, delivery, car insurance, other insurance types | Capture specific search intentions           |
| P1       | `1.3.0`       | Interactive tools                                  | Improve engagement and lead quality             |
| P1       | `1.4.0`       | Education center                                   | Build organic traffic and trust                 |
| P1       | `1.5.0`       | Assistance tools                                   | Provide practical customer value                |
| P1       | `1.6.0`       | Conversion optimization                            | Improve lead generation and attribution         |
| P2       | `1.7.0`       | SEO, performance and accessibility audit            | Improve discoverability and quality             |
| P2       | `1.8.0`       | Infrastructure                                     | Prepare for future integrations                 |
| P3       | `1.9.0`       | Advanced experience                                | Expand platform capabilities                    |
| P3       | `2.0.0`       | Digital platform                                   | Introduce authenticated experiences             |

---

# 4. Out of Scope for the Initial Roadmap

The following features should not distract from the public website development milestones:

- Administrative CRM dashboard.
- Customer dashboard.
- Customer authentication.
- Policy document management.
- Customer database migration.
- Internal sales pipeline.
- Commission management.
- Automated insurance underwriting.
- Real-time premium quotation without an authorized integration.
- Direct insurance policy issuance.

These features can be considered once the website has generated enough activity and the business has validated the need for them.

---

# 5. Success Metrics

The success of AV Seguros Real should not be measured exclusively by website traffic.

Relevant metrics include:

- Organic search impressions.
- Organic search clicks.
- Landing page conversion rate.
- Quotation requests.
- Qualified leads.
- WhatsApp conversations initiated.
- Leads by acquisition channel.
- Leads that become actual sales.
- Returning visitors.
- Performance and accessibility scores.

The ultimate objective is to build a digital acquisition channel that generates measurable business opportunities.

---

# 6. Guiding Principle

AV Seguros Real should grow through useful functionality, not unnecessary complexity.

Every new page, component or tool must answer at least one question:

1. Does it help visitors understand insurance better?
2. Does it help visitors make a more informed decision?
3. Does it make contacting the advisor easier?
4. Does it improve organic discovery?
5. Does it contribute to generating or converting qualified leads?

If it does none of these things, it probably does not belong in the current milestone.

**Build the digital experience first. Expand the business infrastructure when the business is ready for it.**

---

# 7. Definition of Done per Sub-Milestone

Every sub-milestone is complete only when **all** of the following hold. The checklist is generic and applies as-is to each sub-milestone; anything that is not applicable (for example, a canonical tag for a tool with no route of its own) must be explicitly justified in the session's final report rather than silently skipped.

- [ ] `npm run build` completes without errors or warnings introduced by the change.
- [ ] The page or module exists and is accessible at the expected route (verified in the build output and, where applicable, the running preview).
- [ ] `<title>`, meta description and `<h1>` are defined and unique across the site.
- [ ] The canonical tag points to the correct absolute production URL.
- [ ] It works on mobile at a 375px viewport with no horizontal overflow.
- [ ] No visual regressions on existing pages (existing pages render as before, except where the sub-milestone explicitly changes them).
- [ ] CTAs trigger the correct outcome: the right WhatsApp message, or a form submission that reaches the configured destination.
- [ ] New interactive elements work with JavaScript enabled, and any content-only page remains readable without it.
- [ ] No changes to files outside the scope of the sub-milestone.

---

# 8. Technical Decisions

These decisions are binding for all subsequent sessions unless explicitly revised in a later sub-milestone.

### Astro islands: what is hydrated and with which directive

- Default: **no hydration**. Every page is static HTML plus, at most, a small vanilla JS script.
- `client:visible` — the default for all interactive framework components (the insurance needs assistant, and any future multi-step widget). Hydration only occurs when the component scrolls into view.
- `client:load` — permitted only when a component must be interactive before it is visible (for example, a control above the fold that cannot work after hydration). Any use of `client:load` must be justified in the session report.
- `client:idle` / `client:only` — not used in the current roadmap.
- One framework only: React, installed at `1.3.2`. No second framework runtime is added.

### Pure JS vs. React island matrix

| Nature of the feature                                                        | Implementation                              |
| ---------------------------------------------------------------------------- | ------------------------------------------- |
| Deterministic calculation, no multi-step state (deductible calculator)        | Pure JS, no island                          |
| String / URL manipulation, message building, attribution params               | Pure JS utility module, no island           |
| Static checklists, filters, toggles, print views                              | Pure JS on a static Astro page, no island   |
| Multi-step flows with conditional branching and derived summaries (needs assistant) | React island with `client:visible`      |
| Anything that must survive navigation or be shared across pages               | Out of scope for the static site; revisit in `1.8.0` |

Interactive components that only toggle visibility, validate input or compute a value must not pull in a framework runtime.

### Form backend

- **Status: pending.** The backend decision is made in `1.6.1`, after the consolidated form component exists and the real submission volume is understood.
- Until then, forms may submit to an external form service (for example Formspree or Formsubmit) or fall back to `mailto:`.
- If a placeholder or fallback is used, it must be stated explicitly: in a code comment next to the submission handler, and in the session report for that sub-milestone. It must never be presented to the visitor as a guaranteed delivery channel.
- Every form, regardless of backend, includes: client-side validation, inline error messages, an explicit privacy consent checkbox linking to `/aviso-de-privacidad/`, a success state and a failure state offering WhatsApp as an alternative.
- No credentials, endpoint keys or personal data are committed to the repository.

### Brand usage

- **Do not use logos for Uber, DiDi, Rappi or Uber Eats.** Third-party brand assets must not be added to `public/` or rendered anywhere on the site.
- These names may only be used **descriptively**, as plain text, to identify a group of drivers (for example: "conductores de Uber", "repartidores de Rappi").
- Never present these brands as partners, sponsors, endorsers or as part of AV Seguros Real's identity, and never imply that a specific policy is endorsed by or affiliated with them.
- Never use these names as a logo, wordmark, icon, badge or stylized lockup.
- Only AXA and Afirme logos may appear as insurer branding, and only where their use is accurate.

---

# 9. Milestone Execution Protocol

The protocol exists so that an agent can execute the roadmap without ambiguity and without leaving the repository in an intermediate state.

1. **One sub-milestone = one agent session = one commit/PR.** A session addresses exactly one numbered sub-milestone (`1.1.1`, `1.1.2`, …). Work that belongs to the next sub-milestone is not started in the current one.
2. **No skipping ahead.** The agent must not begin the next sub-milestone until the current one satisfies every item in section 7 (Definition of Done).
3. **Every session starts clean.** Begin by confirming `git status` is clean and `npm run build` succeeds. If either fails, restore a buildable state before implementing anything.
4. **Every session ends clean.** Conclude with a successful `npm run build` and no changes to files outside the scope of the sub-milestone. If a build failure cannot be resolved within scope, revert out-of-scope changes and report the blocker instead of working around it.
5. **Report contents.** Each session ends with a short report: sub-milestone completed, files created/modified, Definition of Done items verified, anything deferred or justified as not applicable, and the next sub-milestone.
6. **No opportunistic refactoring.** Unrelated improvements, renames, dependency upgrades and styling changes are not part of a sub-milestone; note them for a future session instead.
7. **No unrequested infrastructure.** Do not add a backend, database, authentication, analytics vendor or deployment target in a sub-milestone that does not name it.

---

# 10. Pending Business Data

- [ ] Replace placeholder testimonials with real Uber/DiDi driver testimonials (Name, City, Insurance Type).
- [x] Confirm and replace the customer metric on the Home page — now `+2500 clientes respaldados por TVAsesores` in `src/components/Brands.astro`.
- [x] Remove the "20% discount" badge from the Home page (expired) — removed from `src/components/Hero.astro`.
- [ ] Submit sitemap-index.xml to Google Search Console (Wait until Phase 1.4.0 Blog is complete).
