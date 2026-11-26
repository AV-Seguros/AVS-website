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

/** A titled column inside the header mega menu. */
export interface NavGroup {
  /** Stable id, used to build DOM ids for the panel columns. */
  id: string;
  label: string;
  description: string;
  links: NavLink[];
}

/** A top-level header entry. `menu` opens a mega menu built from `serviceGroups`. */
export interface NavItem extends NavLink {
  menu?: 'services';
}

/** Insurance for individuals: car, life, home and medical expenses. */
export const personNavigation: NavLink[] = [
  { label: 'Seguro de auto', href: '/seguros-de-auto/' },
  { label: 'Seguro de vida', href: '/seguros-de-vida/' },
  { label: 'Seguro de hogar', href: '/seguros-de-hogar/' },
  { label: 'Seguro de gastos médicos', href: '/seguros-de-gastos-medicos/' },
];

/** Insurance tied to work: app drivers, delivery drivers and businesses. */
export const workNavigation: NavLink[] = [
  { label: 'Seguro para Uber', href: '/seguro-para-uber/' },
  { label: 'Seguro para DiDi', href: '/seguro-para-didi/' },
  { label: 'Seguro para repartidores', href: '/seguros-para-repartidores/' },
  { label: 'Seguro empresarial', href: '/seguros-empresariales/' },
];

/**
 * Interactive tools, in display order. Only routes that exist are listed.
 */
export const toolsNavigation: NavLink[] = [
  { label: 'Calculadora de deducible', href: '/herramientas/calculadora-deducible/' },
];

/**
 * Groups rendered in the header mega menu. The order of the groups and of the
 * links inside them is the order the visitor sees.
 */
export const serviceGroups: NavGroup[] = [
  {
    id: 'personas',
    label: 'Seguros para personas',
    description: 'Protección para tu auto, tu familia y tu patrimonio.',
    links: personNavigation,
  },
  {
    id: 'trabajo',
    label: 'Seguros para trabajo',
    description: 'Coberturas para conductores de aplicación, repartidores y negocios.',
    links: workNavigation,
  },
];

/** Links rendered in the header, in display order. */
export const mainNavigation: NavItem[] = [
  { label: 'Servicios', href: '/servicios/', menu: 'services' },
  { label: 'Quiénes somos', href: '/quienes-somos/' },
  { label: 'Contacto', href: '/contacto/' },
  { label: 'Preguntas frecuentes', href: '/faq/' },
];

/**
 * Tools group rendered after the product groups, so the mega menu keeps one
 * column for insurance products and one for the tools that support them.
 */
export const toolGroups: NavGroup[] = [
  {
    id: 'herramientas',
    label: 'Herramientas',
    description: 'Calcula antes de cotizar: ejercicios educativos con tus propios números.',
    links: toolsNavigation,
  },
];

/**
 * Every insurance product in display order, derived from `serviceGroups` so
 * the header menu and the footer column can never disagree. Tools are kept out
 * of this list: the footer "Servicios" column lists products only.
 */
export const productNavigation: NavLink[] = serviceGroups.flatMap((group) => group.links);

/** Every group the header mega menu renders: products first, tools last. */
export const menuGroups: NavGroup[] = [...serviceGroups, ...toolGroups];

/** Site links rendered in the footer "Enlaces" column. */
export const siteNavigation: NavLink[] = [
  { label: 'Inicio', href: '/' },
  ...mainNavigation.map(({ label, href }) => ({ label, href })),
];

/**
 * Every footer link in display order (site links followed by the product
 * column). Use `siteNavigation` and `productNavigation` to render the columns.
 */
export const footerNavigation: NavLink[] = [...siteNavigation, ...productNavigation];

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

/** True when `pathname` is one of the routes in `links`. */
export function isCurrentSection(links: NavLink[], pathname: string): boolean {
  return links.some((link) => isCurrentPath(link.href, pathname));
}
