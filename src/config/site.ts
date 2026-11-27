/**
 * Site-wide configuration.
 *
 * This is the single source of truth for values that appear on more than one
 * page (domain, contact data, branding). Components must not hardcode them.
 */

export interface SocialLink {
  platform: string;
  url: string;
}

export interface PostalAddress {
  street: string;
  city: string;
  region: string;
  postalCode: string;
  country: 'MX';
}

export interface SiteConfig {
  /** Production origin, always HTTPS and without a trailing slash. */
  siteUrl: string;
  siteName: string;
  advisorName: string;
  /** Human-readable phone number, e.g. "+52 1 81 2013 0995". */
  phone: string;
  /** WhatsApp number in international format, digits only. */
  whatsappNumber: string;
  /**
   * Public contact address shown on the site. Used by the forms' failure
   * fallback and by the legal pages as the ARCO contact channel.
   */
  email: string;
  /**
   * Personal advisor inbox kept as a fallback when the corporate mailbox is
   * unavailable. Never rendered on the site.
   */
  advisorFallbackEmail?: string;
  address: PostalAddress;
  socialLinks: SocialLink[];
  defaultOgImage: string;
  /**
   * Umami Cloud website id used for conversion events. The placeholder keeps
   * the analytics script out of the build until the real id is set, so a
   * forgotten value never ships a broken request to Umami.
   */
  umamiWebsiteId: string;
  /**
   * ISO date of the last revision of the legal pages (`/aviso-de-privacidad/`
   * and `/terminos-y-condiciones/`). Update it whenever their content changes.
   */
  legalLastUpdated: string;
}

export const siteConfig: SiteConfig = {
  siteUrl: 'https://avsegurosreal.com',
  siteName: 'AV Seguros Real',
  advisorName: 'Luis Adolfo Villarreal',
  phone: '+52 1 81 2013 0995',
  whatsappNumber: '5218120130995',
  email: 'contacto@avsegurosreal.com',
  advisorFallbackEmail: 'luisadolfovillarreal@gmail.com',
  address: {
    street: 'Hacienda San Gabriel 310, Villas de la Hacienda',
    city: 'Juárez',
    region: 'Nuevo León',
    postalCode: '67288',
    country: 'MX',
  },
  // No social profiles are linked from the current site.
  socialLinks: [],
  defaultOgImage: '/og/default.jpg',
  umamiWebsiteId: '1ae12a5e-999d-480c-bd93-16e3d6a3223d',
  legalLastUpdated: '2026-11-26',
};
