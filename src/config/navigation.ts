/**
 * Navigation configuration.
 *
 * Single source of truth for the links rendered by `Header.astro` and
 * `Footer.astro`. Every `href` points at a real route built by the site.
 */

export interface NavLink {
  label: string;
  href: string;
}

/** Links rendered in the header, in display order. */
export const mainNavigation: NavLink[] = [
  { label: 'Servicios', href: '/servicios/' },
  { label: 'Quiénes somos', href: '/quienes-somos/' },
  { label: 'Contacto', href: '/contacto/' },
  { label: 'Preguntas frecuentes', href: '/faq/' },
];

/**
 * Driver landing pages. They are listed in the footer for now; whether they
 * belong in the header is decided once the 1.2.x set is complete.
 */
export const driverNavigation: NavLink[] = [
  { label: 'Seguro para Uber', href: '/seguro-para-uber/' },
  { label: 'Seguro para DiDi', href: '/seguro-para-didi/' },
  { label: 'Seguro para repartidores', href: '/seguros-para-repartidores/' },
];

/** Site links rendered in the footer, in display order. */
export const footerNavigation: NavLink[] = [
  { label: 'Inicio', href: '/' },
  ...mainNavigation,
  { label: 'Seguro de auto', href: '/seguros-de-auto/' },
  ...driverNavigation,
];

/** Legal links rendered in the footer, in display order. */
export const legalNavigation: NavLink[] = [
  { label: 'Aviso de privacidad', href: '/aviso-de-privacidad/' },
  { label: 'Términos y condiciones', href: '/terminos-y-condiciones/' },
];

/**
 * True when `href` points at the page currently being rendered. Trailing
 * slashes are ignored so "/servicios/" and "/servicios" match equally.
 */
export function isCurrentPath(href: string, pathname: string): boolean {
  const normalize = (value: string) => value.replace(/\/+$/, '') || '/';
  return normalize(href) === normalize(pathname);
}
