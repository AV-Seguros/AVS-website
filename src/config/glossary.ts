/**
 * Insurance glossary.
 *
 * Single source of truth for `/glosario/` and the printable quick guide at
 * `/recursos/guia-terminos/`, so a definition is written once. Slugs are stable
 * anchors: other pages may deep-link to `/glosario/<slug>/` later, so do not
 * rename one without checking its references.
 *
 * Term names and definitions are visible copy and therefore in Spanish.
 */

export interface GlossaryTerm {
  /** Visible term, e.g. "Deducible". */
  term: string;
  /** Stable ASCII anchor, e.g. "deducible". */
  slug: string;
  /** Two or three plain-language sentences. */
  definition: string;
}

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    term: 'Prima',
    slug: 'prima',
    definition:
      'Es el precio que pagas por la protección de tu póliza, ya sea cada mes, cada trimestre o cada año. Se calcula con el riesgo declarado: el tipo de auto, su valor, el uso y tu historial. Si alguno de esos datos cambia, la prima puede ajustarse.',
  },
  {
    term: 'Deducible',
    slug: 'deducible',
    definition:
      'Es la parte del siniestro que pagas tú antes de que la aseguradora cubra el resto. Se define como un porcentaje del valor del auto o como un monto fijo en la carátula. Un deducible más alto suele bajar la prima, pero sube lo que pagas cuando ocurre un siniestro.',
  },
  {
    term: 'Póliza',
    slug: 'poliza',
    definition:
      'Es el documento que contiene el contrato de seguro: qué se cubre, por cuánto, durante qué periodo y con qué condiciones. La carátula resume los datos principales y el condicionado explica las reglas completas. Es lo que se revisa cuando hay un siniestro y lo que se presenta ante la autoridad.',
  },
  {
    term: 'Siniestro',
    slug: 'siniestro',
    definition:
      'Es el evento que activa la cobertura: un choque, un robo, una inundación o un daño causado a un tercero. Debe reportarse a la aseguradora dentro del plazo que marca el condicionado. A partir del reporte se abre el expediente y se asigna un ajustador.',
  },
  {
    term: 'Cobertura',
    slug: 'cobertura',
    definition:
      'Es cada protección específica que incluye tu póliza, por ejemplo daños materiales, robo total o responsabilidad civil. Cada cobertura tiene su propia suma asegurada, su deducible y sus condiciones. Lo que no aparece en la carátula no está cubierto.',
  },
  {
    term: 'Vigencia',
    slug: 'vigencia',
    definition:
      'Es el periodo durante el cual la póliza está activa, con fecha de inicio y fecha de fin. Un siniestro ocurrido fuera de la vigencia no se cubre. Al terminar, la póliza se renueva o se deja vencer, según decidas.',
  },
  {
    term: 'Endoso',
    slug: 'endoso',
    definition:
      'Es una modificación formal a una póliza ya emitida: cambiar el uso del auto, agregar un conductor, sumar una cobertura o corregir datos. Debe quedar por escrito y reflejarse en la carátula. Los acuerdos verbales con el agente no modifican la póliza.',
  },
  {
    term: 'Asegurado',
    slug: 'asegurado',
    definition:
      'Es la persona o el bien protegido por la póliza. En un seguro de auto suele ser el propietario del vehículo, aunque la póliza puede incluir a otros conductores autorizados. Sus datos y el uso declarado son los que la aseguradora revisa al pagar un reclamo.',
  },
  {
    term: 'Contratante',
    slug: 'contratante',
    definition:
      'Es quien firma el contrato y paga la prima, que no siempre es la misma persona que el asegurado. Por ejemplo, una empresa puede contratar la póliza de un auto que conduce un empleado. El contratante asume las obligaciones del contrato.',
  },
  {
    term: 'Beneficiario',
    slug: 'beneficiario',
    definition:
      'Es la persona designada para recibir la indemnización en un seguro de vida. Debe quedar registrada por escrito y puede actualizarse cuando cambie tu situación familiar. Si no hay beneficiario designado, el pago sigue el orden que marca la ley.',
  },
  {
    term: 'Responsabilidad Civil',
    slug: 'responsabilidad-civil',
    definition:
      'Es la cobertura que paga los daños que causas a otras personas o a sus bienes: el otro auto, una barda, un local o lesiones a terceros. También puede incluir defensa legal y gastos médicos de los afectados. No repara tu propio vehículo.',
  },
  {
    term: 'Valor Asegurado',
    slug: 'valor-asegurado',
    definition:
      'Es el monto por el que se asegura el bien, y en autos suele corresponder al valor comercial del vehículo. Es la base para calcular la indemnización en pérdida total y también el deducible cuando se expresa en porcentaje. Conviene revisarlo en cada renovación porque el valor del auto baja con el tiempo.',
  },
  {
    term: 'Copago',
    slug: 'copago',
    definition:
      'Es la cantidad fija que pagas cada vez que usas un servicio cubierto, común en gastos médicos. Se suma al deducible y no lo sustituye. Aparece en la carátula junto con el deducible y el coaseguro.',
  },
  {
    term: 'Renovación',
    slug: 'renovacion',
    definition:
      'Es la continuación de la póliza por un nuevo periodo, normalmente un año. Antes de renovar conviene revisar el valor del auto, el uso declarado y las coberturas contratadas. La aseguradora puede ajustar la prima para el nuevo periodo.',
  },
  {
    term: 'Cancelación',
    slug: 'cancelacion',
    definition:
      'Es el fin anticipado de la póliza antes de su fecha de vencimiento. Puede pedirla el contratante o, en ciertos casos, la aseguradora. Según la póliza y el momento del año, puede generar una devolución de prima o un cargo.',
  },
  {
    term: 'Coaseguro',
    slug: 'coaseguro',
    definition:
      'Es el porcentaje del daño que compartes con la aseguradora después de aplicar el deducible. Por ejemplo, con 10% de coaseguro pagas una décima parte del resto del siniestro. No todas las pólizas lo incluyen.',
  },
  {
    term: 'Suma Asegurada',
    slug: 'suma-asegurada',
    definition:
      'Es el límite máximo que la aseguradora pagaría por una cobertura determinada. Puede ser una cantidad fija o el valor del vehículo al momento del siniestro. Si el daño supera ese límite, la diferencia queda de tu lado.',
  },
  {
    term: 'Ajustador',
    slug: 'ajustador',
    definition:
      'Es el profesional que la aseguradora envía para valuar el daño y revisar la documentación del reclamo. Su valoración determina el monto de la indemnización. Pide su nombre y el número de reporte para dar seguimiento al expediente.',
  },
];

export const GLOSSARY_PATH = '/glosario/';
