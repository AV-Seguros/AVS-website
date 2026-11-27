# Analytics

## Tools

| Tool | Purpose | Cookies |
| --- | --- | --- |
| Cloudflare Web Analytics | Pageviews, referrers, Core Web Vitals | None |
| Umami Cloud | Conversion events (WhatsApp, forms, tools) | None |

Both are cookieless and do not fingerprint visitors, so the site needs no
consent banner for them. No other analytics or advertising script is loaded.

The Umami website id lives in `src/config/site.ts` as `umamiWebsiteId`.
`BaseLayout.astro` renders `<script src="https://cloud.umami.is/script.js"
data-website-id="…" defer>` only when that value is not the placeholder
`REPLACE_WITH_UMAMI_WEBSITE_ID`, so a build with an unset id ships no analytics
at all instead of a broken request.

## Events

Every event goes through `src/scripts/tracking.ts`. Nothing in the site calls
`window.umami` directly.

| Event | Payload | Fired from |
| --- | --- | --- |
| `whatsapp_click` | `context` | One delegated click listener in `src/scripts/whatsapp.ts` (`initWhatsAppTracking`), covering every `wa.me` CTA including the React assistant's. |
| `lead_form_start` | `source` | `LeadForm.astro`, on the first focus inside a form instance. |
| `lead_form_submit` | `source` | `LeadForm.astro`, after the endpoint returns `2xx` and before navigating to `/gracias/`. |
| `lead_form_error` | `source`, `error` | `LeadForm.astro`; `error` is the first invalid field (`name`, `whatsapp`, `email`, `consent`, `phone`) or `submission` when the endpoint fails. |
| `tool_complete` | `tool` | Deductible calculator (`calculadora-deducible`), assistant summary step (`asistente-necesidades`), accident checklist when all steps are checked (`checklist-accidente`). |

Each event fires at most once per action: form start once per form instance,
tool completion once per visit, WhatsApp click once per click.

`whatsapp_click` derives `context` from the message inside the link, matching it
against the templates in `src/scripts/whatsapp.ts`. A link whose message matches
no template reports `other`.

## How to add an event

1. Add a named helper to `src/scripts/tracking.ts` (for example
   `trackQuoteShared(source)`) that calls `track('<event_name>', { … })`.
   Event names are `snake_case`; payload values are flat strings or numbers.
2. Import the helper where the action happens and call it. Keep the call after
   the user action succeeds, not before.
3. Document the event in the table above.
4. Add the event name in Umami Cloud under the website's Events settings if you
   want it pinned as a conversion metric (custom events also appear on their
   own).

Rules:

- Never send personal data: no email, phone, name or message body. Only page or
  context identifiers.
- Do not import `tracking.ts` into Astro frontmatter; the helpers are
  client-side only.
- Do not add another analytics tool without updating this file.

## Limitations

Umami's script is `defer`red, so `track()` does nothing until `window.umami`
exists. An event fired in the first moments after load — a click on the floating
WhatsApp button during paint, for example — is silently dropped. This is
accepted: the alternative would queue events and replay them, which distorts the
timing the events are meant to measure.

The helpers never throw, so a blocked or unavailable analytics script cannot
break a form, a WhatsApp link or a tool.
