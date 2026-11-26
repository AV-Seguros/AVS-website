/**
 * Answer model, recommendation rules and WhatsApp message assembly for the
 * "¿Qué seguro necesito?" assistant (`/herramientas/que-seguro-necesito/`).
 *
 * Pure functions and data with no React or Astro imports, so the rules can be
 * exercised directly from Node and the UI stays a thin rendering layer.
 */

export type Protection = 'auto' | 'familia' | 'hogar' | 'negocio';
export type VehicleType = 'auto' | 'moto';
export type Usage = 'personal' | 'uber' | 'didi' | 'reparto';
export type Priority = 'precio' | 'cobertura' | 'asistencia';

export interface Answers {
  protection: Protection | null;
  vehicleType: VehicleType | null;
  usage: Usage | null;
  priority: Priority | null;
}

export interface Option<T extends string> {
  value: T;
  label: string;
  hint: string;
}

export const EMPTY_ANSWERS: Answers = {
  protection: null,
  vehicleType: null,
  usage: null,
  priority: null,
};

export const PROTECTION_OPTIONS: Option<Protection>[] = [
  {
    value: 'auto',
    label: 'Vehículo',
    hint: 'Auto o moto, de uso particular o para trabajar',
  },
  {
    value: 'familia',
    label: 'Familia',
    hint: 'El ingreso de la casa y la salud de los tuyos',
  },
  {
    value: 'hogar',
    label: 'Hogar',
    hint: 'La casa, lo que hay dentro y tu responsabilidad',
  },
  {
    value: 'negocio',
    label: 'Negocio',
    hint: 'Local, inventario, equipo y terceros',
  },
];

export const VEHICLE_TYPE_OPTIONS: Option<VehicleType>[] = [
  { value: 'auto', label: 'Auto', hint: 'Sedán, hatchback, SUV o camioneta' },
  { value: 'moto', label: 'Moto', hint: 'Motocicleta de trabajo o de uso personal' },
];

export const USAGE_OPTIONS: Option<Usage>[] = [
  { value: 'personal', label: 'Uso particular', hint: 'Traslados personales, sin apps' },
  { value: 'uber', label: 'Uber', hint: 'Viajes con pasajeros en la app' },
  { value: 'didi', label: 'DiDi', hint: 'Viajes con pasajeros en la app' },
  { value: 'reparto', label: 'Reparto', hint: 'Entregas de pedidos en moto o auto' },
];

export const PRIORITY_OPTIONS: Option<Priority>[] = [
  { value: 'precio', label: 'El precio más bajo', hint: 'Pagar la prima más económica posible' },
  { value: 'cobertura', label: 'La mejor cobertura', hint: 'Que el siniestro quede cubierto' },
  { value: 'asistencia', label: 'Asistencia rápida', hint: 'Grúa y apoyo cuando lo necesitas' },
];

export interface Recommendation {
  title: string;
  href: string;
  linkLabel: string;
  description: string;
  /** Extra caveat shown under the description, only when it applies. */
  note?: string;
}

const PRIORITY_FRAGMENTS: Record<Priority, string> = {
  precio: 'el precio más bajo',
  cobertura: 'la mejor cobertura',
  asistencia: 'la asistencia rápida',
};

const PRIORITY_NOTES: Record<Priority, string> = {
  precio:
    'Como tu prioridad es el precio, compara primero el deducible y la suma asegurada: la cotización más barata suele traer deducibles altos.',
  cobertura:
    'Como tu prioridad es la cobertura, el siguiente paso es leer el condicionado: qué incluye, qué excluye y de cuánto es el deducible.',
  asistencia:
    'Como tu prioridad es la asistencia, revisa los servicios incluidos (grúa, auto sustituto, atención 24 horas) y sus límites antes de contratar.',
};

const VEHICLE_RECOMMENDATIONS: Record<Usage, Recommendation> = {
  personal: {
    title: 'Seguro de auto particular',
    href: '/seguros-de-auto/',
    linkLabel: 'Ver la guía de seguro de auto',
    description:
      'Un auto de uso particular necesita al menos responsabilidad civil, que es la cobertura que responde por los daños que causes a terceros. La cobertura amplia añade daños materiales y robo, y normalmente aplica un deducible. Antes de cotizar revisamos suma asegurada, deducible y exclusiones.',
  },
  uber: {
    title: 'Seguro para conductores de Uber',
    href: '/seguro-para-uber/',
    linkLabel: 'Ver la guía para Uber',
    description:
      'Cuando el auto trabaja en la app, el uso declarado a la aseguradora cambia, y una póliza particular puede no responder durante un viaje. La guía explica qué revisar en las condiciones y qué datos pide la aseguradora.',
  },
  didi: {
    title: 'Seguro para conductores de DiDi',
    href: '/seguro-para-didi/',
    linkLabel: 'Ver la guía para DiDi',
    description:
      'Conducir en DiDi cambia el uso del vehículo frente a la aseguradora, y la cobertura que ofrece la plataforma no sustituye una póliza propia. La guía detalla qué comparar antes de contratar.',
  },
  reparto: {
    title: 'Seguro para repartidores',
    href: '/seguros-para-repartidores/',
    linkLabel: 'Ver la guía para repartidores',
    description:
      'Quien reparte pedidos pasa el día en la calle, en moto o en auto, y el uso comercial debe quedar declarado en la póliza. La guía separa lo que cubre un seguro particular de lo que suele requerir el reparto.',
  },
};

const MOTO_APP_NOTE =
  'Las plataformas de viajes suelen operar con autos: confirma con el asesor si la app trabaja con moto en tu ciudad.';

/**
 * Picks the landing page and the explanation that match the answers.
 * Returns null while the questionnaire is incomplete.
 */
export function buildRecommendation(answers: Answers): Recommendation | null {
  const { protection, vehicleType, usage, priority } = answers;

  if (!protection || !priority) return null;

  const priorityNote = PRIORITY_NOTES[priority];

  if (protection === 'auto') {
    if (!vehicleType || !usage) return null;

    const base = VEHICLE_RECOMMENDATIONS[usage];
    const usesApp = usage === 'uber' || usage === 'didi';
    const note = vehicleType === 'moto' && usesApp ? MOTO_APP_NOTE : base.note;

    return {
      ...base,
      title: vehicleType === 'moto' ? `${base.title} (moto)` : base.title,
      description: `${base.description} ${priorityNote}`,
      ...(note ? { note } : {}),
    };
  }

  if (protection === 'familia') {
    return {
      title: 'Seguro de vida para tu familia',
      href: '/seguros-de-vida/',
      linkLabel: 'Ver la guía de seguro de vida',
      description: `Si alguien depende de tu ingreso, el seguro de vida deja una suma asegurada a tus beneficiarios y evita que la familia cubra el gasto con deuda. Si lo que te preocupa son las facturas médicas, eso se resuelve con gastos médicos mayores, que es otro producto y se puede combinar. ${priorityNote}`,
    };
  }

  if (protection === 'hogar') {
    return {
      title: 'Seguro de hogar',
      href: '/seguros-de-hogar/',
      linkLabel: 'Ver la guía de seguro de hogar',
      description: `Una póliza de hogar protege la casa y lo que hay dentro frente a incendio, daños y robo, según las condiciones contratadas, y responde por los daños que causes a terceros. Lo más importante es declarar el valor real de la construcción y del contenido. ${priorityNote}`,
    };
  }

  return {
    title: 'Seguro empresarial',
    href: '/seguros-empresariales/',
    linkLabel: 'Ver la guía de seguro empresarial',
    description: `Un negocio necesita proteger el local, el inventario, el equipo y la responsabilidad frente a clientes y visitantes. La cotización parte del giro, la ubicación y el valor de los bienes. ${priorityNote}`,
  };
}

function labelOf<T extends string>(options: Option<T>[], value: T | null): string {
  return options.find((option) => option.value === value)?.label ?? '';
}

/** Rows rendered in the final summary and reused as the WhatsApp context. */
export function summarizeAnswers(answers: Answers): { label: string; value: string }[] {
  const rows: { label: string; value: string }[] = [];

  if (answers.protection) {
    rows.push({
      label: 'Quieres proteger',
      value: labelOf(PROTECTION_OPTIONS, answers.protection),
    });
  }

  if (answers.protection === 'auto') {
    if (answers.vehicleType) {
      rows.push({ label: 'Vehículo', value: labelOf(VEHICLE_TYPE_OPTIONS, answers.vehicleType) });
    }
    if (answers.usage) {
      rows.push({ label: 'Uso', value: labelOf(USAGE_OPTIONS, answers.usage) });
    }
  }

  if (answers.priority) {
    rows.push({ label: 'Prioridad', value: labelOf(PRIORITY_OPTIONS, answers.priority) });
  }

  return rows;
}

const USAGE_FRAGMENTS: Record<Usage, string> = {
  personal: 'de uso particular',
  uber: 'para conductor de Uber',
  didi: 'para conductor de DiDi',
  reparto: 'para repartidor de pedidos',
};

/** Plain-language description of the need, used inside the WhatsApp message. */
export function describeNeed(answers: Answers): string {
  const priority = answers.priority ? `, priorizando ${PRIORITY_FRAGMENTS[answers.priority]}` : '';

  if (answers.protection === 'auto') {
    const vehicle = answers.vehicleType === 'moto' ? 'moto' : 'auto';
    const usage = answers.usage ? ` ${USAGE_FRAGMENTS[answers.usage]}` : '';
    return `un seguro de ${vehicle}${usage}${priority}`;
  }

  if (answers.protection === 'familia') return `un seguro de vida para mi familia${priority}`;
  if (answers.protection === 'hogar') return `un seguro de hogar para mi casa${priority}`;
  if (answers.protection === 'negocio') return `un seguro empresarial para mi negocio${priority}`;

  return `un seguro${priority}`;
}

/** Full message sent to the advisor, in Spanish, with the answers inside. */
export function buildWhatsAppMessage(answers: Answers): string {
  return `Hola, necesito ${describeNeed(answers)}. Vengo del asistente web.`;
}

/** `wa.me` URL with the number from `site.ts` and the encoded message. */
export function buildWhatsAppUrl(whatsappNumber: string, answers: Answers): string {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(buildWhatsAppMessage(answers))}`;
}
