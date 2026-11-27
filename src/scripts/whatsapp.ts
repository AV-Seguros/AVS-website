/**
 * Contextual WhatsApp link builder.
 *
 * Every CTA that opens a WhatsApp chat goes through this module, so the
 * destination number is defined only in `site.ts` and each page sends the
 * advisor a message that says where the visitor came from and what they need.
 *
 * The pages import them in their Astro frontmatter at build time, where nothing
 * of the visitor is known; in the browser the URL gains a short `[Ref: …]` line
 * with the first-touch attribution (see `scripts/attribution.ts`).
 */

import { siteConfig } from '../config/site';
import { getAttributionReference } from './attribution';
import { trackWhatsAppClick } from './tracking';

/**
 * Where the visitor clicked. Each key has one message in `CONTEXT_MESSAGES`.
 * The list covers every CTA the site renders plus the general intents the
 * advisor receives most often (an existing policy and a renewal).
 */
export type WhatsAppContext =
  | 'general'
  | 'cotizacion-auto'
  | 'auto'
  | 'vida'
  | 'hogar'
  | 'gastos-medicos'
  | 'empresarial'
  | 'uber'
  | 'didi'
  | 'repartidores'
  | 'servicios'
  | 'otros-seguros'
  | 'contacto'
  | 'calculadora'
  | 'asistente'
  | 'revision-asistente'
  | 'checklist-accidente'
  | 'poliza-existente'
  | 'renovacion';

/**
 * One message per context, in Spanish, with `{placeholder}` markers for the
 * optional params. The origin sentence goes last so the advisor sees at a
 * glance which page produced the message.
 */
const CONTEXT_MESSAGES: Record<WhatsAppContext, string> = {
  general: 'Hola, vengo de la página web y quiero información sobre sus seguros.',
  'cotizacion-auto':
    '¡Hola! Quiero cotizar mi seguro de auto con un agente real. {escenario}',
  auto: 'Hola, busco seguro de auto particular. Vengo de la página web.',
  vida: 'Hola, busco seguro de vida. Vengo de la página web.',
  hogar: 'Hola, busco seguro de hogar. Vengo de la página web.',
  'gastos-medicos': 'Hola, busco seguro de gastos médicos. Vengo de la página web.',
  empresarial: 'Hola, busco seguro empresarial para mi negocio. Vengo de la página web.',
  uber: 'Hola, busco seguro de auto para conductor de Uber. Vengo de la página web.',
  didi: 'Hola, busco seguro de auto para conductor de DiDi. Vengo de la página web.',
  repartidores: 'Hola, busco seguro para repartidor. Vengo de la página web.',
  servicios: 'Hola, vengo de la página de servicios y quiero asesoría para elegir mi seguro.',
  'otros-seguros':
    '¡Hola! Estoy en su página web y quisiera saber qué otros tipos de seguros tienen. ¿Me pueden dar más información?',
  contacto: '¡Hola! Quiero cotizar mi seguro y tengo algunas dudas.',
  calculadora: 'Hola, usé la calculadora de deducible y quiero revisar mi caso. Vengo de la página web.',
  asistente: 'Hola, necesito {necesidad}. Vengo del asistente web.',
  'revision-asistente':
    'Hola, usé el asistente y quiero revisar mi caso con un asesor. Vengo del asistente web.',
  'checklist-accidente':
    'Hola, tuve un accidente de auto y quiero apoyo para dar seguimiento al reporte. Vengo de la guía de accidentes.',
  'poliza-existente': 'Hola, ya tengo una póliza y quiero revisarla con un asesor.',
  renovacion: 'Hola, quiero renovar mi póliza. Vengo de la página web.',
};

/**
 * Builds the message for a context, filling `{placeholders}` from `params`.
 *
 * A missing or blank param leaves nothing behind: the marker is removed and
 * the sentence is re-spaced, so a message never ships with `{necesidad}` or a
 * double space in it.
 */
export function buildWhatsAppMessage(
  context: WhatsAppContext,
  params: Record<string, string> = {},
): string {
  const template = CONTEXT_MESSAGES[context] ?? CONTEXT_MESSAGES.general;
  const filled = template.replace(/\{(\w+)\}/g, (_match, name: string) => params[name]?.trim() ?? '');

  return filled
    .replace(/\s+/g, ' ')
    .replace(/\s+([.,;:!?])/g, '$1')
    .trim();
}

/**
 * Encoded `wa.me` URL for a context, with the number from `site.ts`.
 *
 * `encodeURIComponent` is applied to the whole message, so accents, line
 * breaks and punctuation survive the trip to WhatsApp. In the browser the
 * message ends with the attribution reference; during the build there is no
 * storage to read, so the static href stays clean and `refreshWhatsAppLinks()`
 * adds the reference once the page loads.
 */
export function buildWhatsAppUrl(
  context: WhatsAppContext,
  params: Record<string, string> = {},
): string {
  const message = buildWhatsAppMessage(context, params) + getAttributionReference();

  return `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

const WHATSAPP_HREF_PREFIX = 'https://wa.me/';

/** Matches the reference this module appends, so a second pass replaces it. */
const ATTRIBUTION_REFERENCE = / ?\[Ref: [^\]]*\]$/;

/** Escapes the regular-expression characters of a literal message template. */
const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Template to matcher: the escaped text keeps its punctuation literal and every
 * `{placeholder}` becomes a wildcard. `buildWhatsAppMessage` drops an empty
 * placeholder together with its leading space, so the wildcard swallows that
 * space too.
 */
const contextPattern = (template: string): RegExp =>
  new RegExp(`^${escapeRegExp(template).replace(/ ?\\\{\w+\\\}/g, '.*')}$`);

/**
 * One matcher per context, built from the templates above, so the message inside
 * a `wa.me` link maps back to the context that produced it without a second
 * attribute on every anchor.
 */
const CONTEXT_MATCHERS = (Object.keys(CONTEXT_MESSAGES) as WhatsAppContext[]).map((context) => ({
  context,
  pattern: contextPattern(CONTEXT_MESSAGES[context]),
}));

/**
 * Reads the context back out of a WhatsApp URL so a click can be reported with
 * the same key the page used to build it. Unknown messages (a hand-written
 * link, a changed template) fall back to `other` instead of guessing.
 */
export function resolveWhatsAppContext(href: string): string {
  try {
    const message = new URL(href).searchParams.get('text');
    if (!message) return 'other';

    const normalized = message.replace(ATTRIBUTION_REFERENCE, '').replace(/\s+/g, ' ').trim();
    const match = CONTEXT_MATCHERS.find(({ pattern }) => pattern.test(normalized));

    return match?.context ?? 'other';
  } catch {
    return 'other';
  }
}

let trackingBound = false;

/**
 * Reports `whatsapp_click` for every WhatsApp CTA through one delegated
 * listener, so anchors rendered at build time and anchors rendered later by a
 * hydrated island are both covered. Nothing is cancelled: the link opens
 * normally whether or not the analytics script loaded.
 */
export function initWhatsAppTracking(root: Document = document): void {
  if (trackingBound) return;
  trackingBound = true;

  root.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const link = target.closest<HTMLAnchorElement>(`a[href^="${WHATSAPP_HREF_PREFIX}"]`);
    if (!link) return;

    trackWhatsAppClick(resolveWhatsAppContext(link.href));
  });
}

/**
 * Adds the first-touch reference to every WhatsApp CTA already on the page.
 *
 * The links are built at build time, when the visitor is unknown, so the client
 * rewrites the `text` parameter once the DOM is ready. Links without a message
 * are left alone, and a URL that fails to parse is skipped instead of breaking
 * the others.
 */
export function refreshWhatsAppLinks(root: ParentNode = document): void {
  const reference = getAttributionReference();
  if (!reference) return;

  root.querySelectorAll<HTMLAnchorElement>(`a[href^="${WHATSAPP_HREF_PREFIX}"]`).forEach((link) => {
    try {
      const url = new URL(link.href);
      const message = url.searchParams.get('text');
      if (!message) return;

      url.searchParams.set('text', `${message.replace(ATTRIBUTION_REFERENCE, '')}${reference}`);
      link.href = url.toString();
    } catch {
      // Leave the original href in place.
    }
  });
}
