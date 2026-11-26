/**
 * First-touch attribution.
 *
 * The site is static: there is no backend, no cookie and no PII involved. The
 * campaign that produced the visit is remembered for the life of the browser tab
 * in `sessionStorage` and then attached to whatever the visitor sends — hidden
 * fields on the lead form and a short `[Ref: …]` line on the WhatsApp message.
 *
 * Every browser API is guarded: the Astro frontmatter imports this module at
 * build time (Node), where the storage does not exist and the reference is empty.
 */

/** `sessionStorage` key. One entry per tab; never synced across tabs. */
export const ATTRIBUTION_STORAGE_KEY = 'av_attribution';

export interface Attribution {
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmContent: string;
  utmTerm: string;
  referrer: string;
  landingPage: string;
}

const EMPTY_ATTRIBUTION: Attribution = {
  utmSource: '',
  utmMedium: '',
  utmCampaign: '',
  utmContent: '',
  utmTerm: '',
  referrer: '',
  landingPage: '',
};

/** Query parameter → field. The five UTMs the roadmap asks for. */
const UTM_PARAMS: Record<string, keyof Attribution> = {
  utm_source: 'utmSource',
  utm_medium: 'utmMedium',
  utm_campaign: 'utmCampaign',
  utm_content: 'utmContent',
  utm_term: 'utmTerm',
};

const MAX_LENGTH = 200;
const MAX_REFERRER_LENGTH = 500;

/** Collapses whitespace and caps the length, so one long URL cannot bloat a lead. */
const sanitize = (value: string | null | undefined, max = MAX_LENGTH): string =>
  (value ?? '').replace(/\s+/g, ' ').trim().slice(0, max);

/** `sessionStorage` can throw when cookies are blocked; the site must survive that. */
const getStorage = (): Storage | null => {
  if (typeof window === 'undefined') return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
};

/**
 * Accepts anything that still has the expected shape, so an older or partial
 * record stored by a previous visit is read instead of discarded.
 */
const parseAttribution = (value: unknown): Attribution | null => {
  if (typeof value !== 'object' || value === null) return null;

  const source = value as Record<string, unknown>;
  const data = { ...EMPTY_ATTRIBUTION };

  (Object.keys(data) as Array<keyof Attribution>).forEach((field) => {
    const stored = source[field];
    if (typeof stored === 'string') data[field] = stored;
  });

  return data;
};

const readStored = (storage: Storage): Attribution | null => {
  try {
    const raw = storage.getItem(ATTRIBUTION_STORAGE_KEY);
    return raw ? parseAttribution(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
};

const writeStored = (storage: Storage, data: Attribution): void => {
  try {
    storage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Quota exceeded or storage disabled: attribution is a nice-to-have.
  }
};

/**
 * Reads the visit once and stores it for the rest of the tab session.
 *
 * **First touch wins:** when a record already exists the function returns it and
 * never overwrites it, so navigating from another page, or landing again with a
 * different `utm_source`, keeps the campaign that actually produced the visit.
 */
export function captureAttribution(): Attribution {
  const storage = getStorage();

  if (storage) {
    const stored = readStored(storage);
    if (stored) return stored;
  }

  const data: Attribution = { ...EMPTY_ATTRIBUTION };

  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);

    (Object.keys(UTM_PARAMS) as Array<keyof typeof UTM_PARAMS>).forEach((param) => {
      data[UTM_PARAMS[param]] = sanitize(params.get(param));
    });

    data.referrer = sanitize(document.referrer, MAX_REFERRER_LENGTH);
    data.landingPage = sanitize(window.location.pathname);
  }

  if (storage) writeStored(storage, data);

  return data;
}

/** The stored first touch, or a fresh capture when nothing is stored yet. */
export function readAttribution(): Attribution {
  const storage = getStorage();
  const stored = storage ? readStored(storage) : null;

  return stored ?? captureAttribution();
}

const referrerHost = (referrer: string): string => {
  if (!referrer) return '';

  try {
    return new URL(referrer).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
};

/**
 * Short origin line appended to WhatsApp messages.
 *
 * Campaign data wins (`source / medium / campaign`); a direct visit falls back to
 * the referring site, and a direct visit with no referrer to the landing page.
 * Returns an empty string when there is nothing worth saying, so a message never
 * ends with an empty bracket.
 */
export function getAttributionReference(data: Attribution = readAttribution()): string {
  const campaign = [data.utmSource, data.utmMedium, data.utmCampaign].filter(Boolean);
  const parts = campaign.length > 0 ? campaign : [referrerHost(data.referrer) || data.landingPage];

  const reference = parts.filter(Boolean).join(' / ');

  return reference ? ` [Ref: ${reference}]` : '';
}
