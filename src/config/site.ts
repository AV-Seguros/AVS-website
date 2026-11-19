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
  email: string;
  address: PostalAddress;
  socialLinks: SocialLink[];
  defaultOgImage: string;
}

export const siteConfig: SiteConfig = {
  siteUrl: 'https://avsegurosreal.com',
  siteName: 'AV Seguros Real',
  advisorName: 'Luis Adolfo Villarreal',
  phone: '+52 1 81 2013 0995',
  whatsappNumber: '5218120130995',
  email: 'luisadolfovillarreal@gmail.com',
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
};
