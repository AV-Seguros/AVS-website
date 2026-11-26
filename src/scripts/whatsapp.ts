/**
 * Contextual WhatsApp link builder.
 *
 * Every CTA that opens a WhatsApp chat goes through this module, so the
 * destination number is defined only in `site.ts` and each page sends the
 * advisor a message that says where the visitor came from and what they need.
 *
 * Pure functions with no browser APIs: the pages import them in their Astro
 * frontmatter at build time, and the output can be exercised from Node.
 */

import { siteConfig } from '../config/site';

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
  'cotizacion-auto': '¡Hola! Quiero cotizar mi seguro de auto con un agente real.',
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
 * breaks and punctuation survive the trip to WhatsApp.
 */
export function buildWhatsAppUrl(
  context: WhatsAppContext,
  params: Record<string, string> = {},
): string {
  return `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(
    buildWhatsAppMessage(context, params),
  )}`;
}
