# Answer Engine Optimization (AEO)

Guidelines for writing and maintaining content that ChatGPT, Perplexity, Google AI
Overviews and Bing Copilot can quote accurately. They apply to every new page and to
every edit of an existing one.

An answer engine does not rank pages, it extracts passages. It looks for a short,
self-contained answer that can be lifted without the surrounding page and that can be
verified against a primary source. Everything below serves that goal.

## 1. Ask the question in the heading

Every `h2` that introduces an informational section is phrased as the question a person
would type or say.

- Instead of `Cobertura de daños materiales`, write `¿Qué cubre la cobertura de daños
  materiales?`
- Instead of `Proceso de cotización`, write `¿Cómo se cotiza un seguro de auto?`

Keep it in Spanish, in the visitor's words, without jargon in the question itself. The
`h1` stays as the page's promise; the questions live in the `h2`s.

Reference: `/seguros-de-auto/` and `/renovacion-de-poliza/` already work this way.

## 2. Answer in the first two sentences

Directly under the question, before any context, history or caveat, write a complete
answer of **40 to 60 words** that makes sense on its own. The rest of the section expands
it, gives an example or adds the exception.

Checklist for the opening answer:

- [ ] It repeats the key noun of the question (`deducible`, `prima`, `endoso`), so a
      fragment of the paragraph still reads correctly out of context.
- [ ] It contains no "como vimos anteriormente", "en este artículo" or "sigue leyendo":
      those phrases break the moment the passage is quoted alone.
- [ ] It states the number, percentage or document name if there is one.
- [ ] The hedge, when needed, is explicit: `depende de las condiciones de la póliza
      contratada`, not an implied "puede ser".

## 3. Make facts verifiable

Answer engines prefer claims they can check, and they drop claims they cannot.

- Give **numbers with their unit and their date**: `un deducible del 5% sobre un auto de
  $300,000 son $15,000` is quotable; `un deducible razonable` is not.
- Name the **document or institution** behind a statement: the policy (`carátula`,
  `condicionado general`), the insurer, the CNSF, CONDUSEF.
- Never invent a statistic, an average premium, a market share, a certification or a
  testimonial. If a number is not verified, describe the situation without it.
- For anything that changes yearly (limits, requirements, deadlines), write the year next
  to the figure: `en 2026`.

## 4. Cite primary sources

When a statement comes from an outside rule, link the primary source, not a blog that
repeats it. For this site that means, in this order of preference:

| Topic | Primary source |
| --- | --- |
| Consumer rights and complaints against an insurer | CONDUSEF (`condusef.gob.mx`) |
| Insurer registration, broker and advisor rules | CNSF (`gob.mx/cnsf`) |
| Traffic rules and accident procedure | The state or municipal authority in question |
| Policy terms, coverage, deductibles | The insurer's `condicionado general` and `carátula` |
| The advisor's own credentials | `src/config/site.ts` and `/quienes-somos/` |

Link the institution's own page, describe in the sentence what the reader will find
there, and keep the link text descriptive (`consultar el registro de instituciones de
CONDUSEF`), never `clic aquí`.

## 5. One entity, one spelling

The business is described identically everywhere, because an answer engine merges the
pages into one entity and contradictory data lowers confidence.

- Name, address, phone and email come from `src/config/site.ts` only. No page retypes
  them by hand.
- The canonical form is `AV Seguros Real`, `Luis Adolfo Villarreal`, `+52 1 81 2013
  0995`, `contacto@avsegurosreal.com`, `https://avsegurosreal.com`.
- The advisor's only stated credential is the CNSF cédula `649610`, plus the TVAsesores
  backing and the 40 years of the first generation. Nothing else is claimed.
- The 15 years of experience, the 40 years of the agency and the cédula are the same
  numbers on `/quienes-somos/`, `/prensa/`, `public/llms.txt` and the schema.

## 6. Schema copy must match visible copy

Structured data is read, but it is also cross-checked against the rendered text. When the
two disagree, the engine trusts neither.

- `FAQPage`, `Article`, `BreadcrumbList` and the business graph are generated from the
  same data that renders the page. Never type a question into JSON-LD that the visitor
  cannot read on screen.
- Do not add `aggregateRating`, `review`, `award` or `hasCredential` nodes for data the
  site does not display and cannot support.
- Dates in schema (`datePublished`, `dateModified`, `LegalLastUpdated`) match the visible
  date.

## 7. Keep list pages scannable

Extraction favours structure over prose.

- Use real `<ul>`/`<ol>` for steps, requirements and comparisons, with one idea per item.
- Use a table when the reader has to compare three or more options on the same two or
  three attributes.
- Keep paragraphs under about 80 words; an `h2` every 200–300 words.
- Never put essential information only in an image, an icon or a CSS pseudo-element.

## 8. Maintain `public/llms.txt`

`public/llms.txt` is the site's own map for language models. Every new indexable route is
added to it in the same session that publishes the route, with a one-line description that
says what the page answers. Stale entries are worse than missing ones: a link to a deleted
route is a failed extraction.

## 9. Review checklist before publishing a page

- [ ] One `h1`; every `h2` is a question or a scannable label.
- [ ] The first 40–60 words under each `h2` answer it completely.
- [ ] Every figure has a unit, and a year when it can change.
- [ ] At least one link to a primary source where an outside rule is described.
- [ ] Business data comes from `site.ts`; no credential is claimed beyond the cédula.
- [ ] Schema copy is identical to visible copy.
- [ ] The route is listed in `public/llms.txt` and appears in the sitemap.
- [ ] `robots.txt` still allows answer-engine crawlers and blocks training crawlers.

## 10. What not to do

- No FAQ text written only for the schema.
- No "según expertos" without naming the expert or the document.
- No keyword-stuffed headings: one intent per `h2`.
- No guarantees of coverage, price or approval that the insurer has not confirmed.
- No duplicated paragraphs across pages to seed an answer: state the fact once, link to it.
