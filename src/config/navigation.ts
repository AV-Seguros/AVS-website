/**
 * Navigation configuration.
 *
 * These arrays mirror the links currently hardcoded in `Header.astro` and
 * `Footer.astro`. Both components are wired to this config in sub-milestone
 * 1.1.4; until then this module is the reference for the planned link set.
 */

export interface NavLink {
  label: string;
  href: string;
}

/** Links rendered in the header, in display order. */
export const mainNavigation: NavLink[] = [
  { label: 'Inicio', href: '#hero' },
  { label: 'Quiénes somos', href: '#quienes' },
  { label: 'Servicios', href: '#servicios' },
  { label: 'Marcas', href: '#marcas' },
];

/** Links rendered in the footer, in display order. */
export const footerNavigation: NavLink[] = [
  { label: 'Inicio', href: '#hero' },
  { label: 'Quiénes somos', href: '#quienes' },
  { label: 'Servicios', href: '#servicios' },
  { label: 'Marcas', href: '#marcas' },
  // Legal links. Their real routes arrive in sub-milestone 1.1.3.
  { label: 'Aviso de privacidad', href: '#' },
  { label: 'Términos y condiciones', href: '#' },
];
