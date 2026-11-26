/**
 * Deductible calculation for `/herramientas/calculadora-deducible/`.
 *
 * Pure functions with no dependencies: the page imports them in its own
 * `<script>` tag, and they can be exercised from Node without a browser. Every
 * input is coerced to a non-negative finite number, so an empty, negative or
 * non-numeric value can never reach the UI as `NaN`.
 */

export interface DeductibleInput {
  /** Commercial value of the vehicle in MXN. */
  vehicleValue: string | number;
  /** Deductible percentage of the vehicle value. */
  deductiblePercent: string | number;
  /** Amount of the reported damage in MXN. */
  damageAmount: string | number;
}

export interface DeductibleResult {
  /** Vehicle value multiplied by the deductible percentage. */
  deductible: number;
  /** What the policyholder pays out of pocket for this damage. */
  policyholderPays: number;
  /** What the insurer pays for this damage. */
  insurerPays: number;
}

const roundToCents = (value: number): number => Math.round(value * 100) / 100;

/** Coerces user input to a non-negative finite number, defaulting to 0. */
export function toAmount(value: string | number): number {
  const parsed = typeof value === 'number' ? value : Number.parseFloat(value);

  if (!Number.isFinite(parsed) || parsed < 0) return 0;

  return parsed;
}

/** Coerces user input to a percentage between 0 and 100. */
export function toPercent(value: string | number): number {
  return Math.min(100, toAmount(value));
}

/**
 * Estimates the deductible and splits the damage between the policyholder and
 * the insurer.
 *
 * The deductible is a percentage of the vehicle value, not of the damage, so a
 * small claim can cost less than the deductible: in that case the policyholder
 * pays the whole repair and the insurer pays nothing.
 */
export function calculateDeductible(input: DeductibleInput): DeductibleResult {
  const vehicleValue = toAmount(input.vehicleValue);
  const damageAmount = toAmount(input.damageAmount);

  const deductible = roundToCents((vehicleValue * toPercent(input.deductiblePercent)) / 100);

  // The policyholder never pays more than the damage itself.
  const policyholderPays = roundToCents(Math.min(deductible, damageAmount));
  const insurerPays = roundToCents(damageAmount - policyholderPays);

  return { deductible, policyholderPays, insurerPays };
}

const mxnFormatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Formats a number as Mexican pesos, falling back to 0 for non-finite values. */
export function formatMxn(value: number): string {
  return mxnFormatter.format(Number.isFinite(value) ? value : 0);
}
