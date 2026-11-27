/**
 * Single entry point for every analytics event on the site.
 *
 * Pageviews are not counted here: Cloudflare Web Analytics already does that,
 * and Umami (privacy-first, cookie-free, so no consent banner is required) only
 * receives the conversion events. Components import the small helpers below
 * instead of calling `window.umami` directly, so an event name or payload shape
 * is defined in one place.
 *
 * Events are best effort. The Umami script loads `defer`red, so anything fired
 * before it is available is silently dropped: `track()` does nothing when the
 * global is missing and never throws into the page.
 */

/** Subset of Umami's global API used by this site. */
interface UmamiTracker {
  track: (eventName: string, data?: Record<string, string | number>) => void;
}

declare global {
  interface Window {
    umami?: UmamiTracker;
  }
}

/** Umami accepts flat key/value data; numbers are sent as-is. */
export type EventData = Record<string, string | number>;

/**
 * Sends one event to Umami.
 *
 * Returns silently when running on the server (Astro frontmatter imports this
 * module at build time), when the analytics script is blocked or still loading,
 * or when the tracker itself fails.
 */
export function track(eventName: string, data?: EventData): void {
  if (typeof window === 'undefined') return;

  const umami = window.umami;
  if (!umami || typeof umami.track !== 'function') return;

  try {
    umami.track(eventName, data);
  } catch {
    // Analytics must never break the interaction it is measuring.
  }
}

/** A WhatsApp CTA was clicked; `context` is the CTA's message context. */
export function trackWhatsAppClick(context: string): void {
  track('whatsapp_click', { context });
}

/** The visitor started filling a lead form (first focus on any field). */
export function trackLeadFormStart(source: string): void {
  track('lead_form_start', { source });
}

/** A lead form was accepted by the endpoint. */
export function trackLeadFormSubmit(source: string): void {
  track('lead_form_submit', { source });
}

/**
 * A lead form was rejected: `error` is the field that failed validation, or
 * `submission` when the endpoint itself failed.
 */
export function trackLeadFormError(source: string, error: string): void {
  track('lead_form_error', { source, error });
}

/** A tool reached its result: deductible calculator, assistant, checklist. */
export function trackToolComplete(tool: string): void {
  track('tool_complete', { tool });
}
