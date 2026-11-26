# Lead forms

## Decision

**Formspree is the temporary form backend.** Every form on the site is rendered
by `src/components/forms/LeadForm.astro`, and the submission logic lives there
too. To migrate to a custom backend (Cloudflare Workers, Supabase, a route on
the site itself), only the `FORM_ENDPOINT` constant at the top of that component
needs to change — the pages, the validation, the states and the payload stay as
they are.

The endpoint is a public `https://formspree.io/f/...` URL. It is not a secret and
it is fine for it to appear in the HTML. No API key is involved, so nothing has
to be stored in the repository or in the deployment environment.

## Why not a backend yet

- The site is a static Astro build on GitHub Pages: there is no server runtime to
  receive a POST today.
- The volume of this business (a single advisor) does not justify a database or a
  serverless function yet.
- Formspree delivers each submission by email, which matches how the advisor
  actually works.

When a real backend ships, `docs/forms.md` and this constant are the only two
places that have to be updated. Requirements for that migration:

1. Accept `POST` with `multipart/form-data` or `application/x-www-form-urlencoded`.
2. Return a `2xx` status on success and a JSON body on failure.
3. Keep the `_source`, `_context` and `_subject` fields; they are the attribution
   the advisor uses to know which page produced the lead.
4. Store or forward the privacy consent (`Consentimiento=Aceptado`); it is the
   legal basis for contacting the person.

## Component API

```astro
<LeadForm source="uber-landing" context="Landing de seguro para Uber" />
```

| Prop | Type | Default | Purpose |
| --- | --- | --- | --- |
| `source` | `string` (required) | — | Page identifier sent in `_source`. Also namespaces every element id. |
| `context` | `string` | — | Adds `_context` and becomes the email subject (`Nueva solicitud · <context>`). |
| `buttonText` | `string` | `'Enviar solicitud'` | Submit button label. |
| `showPhone` | `boolean` | `false` | Adds an optional `Telefono` field. |
| `heading` | `string` | `'Solicita tu cotización'` | Section heading (`layout="section"`). |
| `description` | `string` | generic 24h copy | Section description (`layout="section"`). |
| `sectionId` | `string` | `'cotizar'` | Anchor id of the section; pass `undefined` for inline forms. |
| `tone` | `'white' \| 'muted' \| 'navy'` | `'muted'` | Section background. |
| `layout` | `'section' \| 'inline'` | `'section'` | `inline` renders the form only (home hero). |
| `theme` | `'light' \| 'dark'` | `'light'` | Adjusts labels and notes for a dark card. |
| `whatsappHref` | `string` | `buildWhatsAppUrl('general')` | Fallback link shown when submission fails. |

## Fields and payload

| Field | Name | Validation |
| --- | --- | --- |
| Nombre | `Nombre` | At least 2 characters. |
| WhatsApp | `WhatsApp` | At least 10 digits. |
| Teléfono | `Telefono` | Only with `showPhone`; optional, at least 8 digits if filled. |
| Correo electrónico | `Email` | `usuario@dominio.tld` shape. |
| Consentimiento | `Consentimiento` | Must be checked; sends `Aceptado`. |

Hidden fields: `_subject` (from `context` or `source`), `_source` (the page) and
`_context` (when the page passes one).

## States

- **Invalid:** inline error under each field, `aria-invalid` on the input and
  focus moved to the first field with an error. Nothing is sent.
- **Sending:** the button is disabled, `aria-busy="true"` and its label becomes
  "Enviando...".
- **Success:** the browser navigates to `/gracias/`, which is the existing
  thank-you page.
- **Failure:** a form-level `role="alert"` message appears with a WhatsApp
  fallback, and the button returns to its original state.

Validation is client-side only; the backend is still the source of truth.

## Requirements for new pages

- Use `<LeadForm source="…" context="…" />`; do not write a `<form>` by hand.
- `source` must be unique per page (it namespaces the ids) and descriptive:
  `uber-landing`, `contact-page`, `home-hero`.
- Visible copy stays in Spanish; identifiers, comments and docs stay in English.
- No analytics events are wired here yet (that is `1.6.3`).
