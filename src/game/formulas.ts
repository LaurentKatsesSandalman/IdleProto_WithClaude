import Decimal from 'break_infinity.js';
import {
  INFLATION,
  PRESTIGE_FORMULA,
  PRIX_INITIAL,
  RANK_MULTIPLIER,
  RATIO_INITIAL,
  USURE,
} from './constants';
import type { GeneratorMap, PrestigeFormula, PrestigeFormulaId } from './types';

/**
 * Base price of the FIRST copy of a rank-N generator.
 * PrixInitialPourN(N) = PRIX_INITIAL * RANK_MULTIPLIER^(N-1)
 */
export function getBasePrice(rank: number): Decimal {
  return PRIX_INITIAL.mul(RANK_MULTIPLIER.pow(rank - 1));
}

/**
 * Production ratio for rank N.
 * RatioPourN(N) = RATIO_INITIAL * (1 - USURE)^(N-1)
 */
export function getRatio(rank: number): number {
  return RATIO_INITIAL * Math.pow(1 - USURE, rank - 1);
}

/**
 * Production per second of ONE generator of rank N (before multiplier).
 * ProdRangN(N) = PrixInitialPourN(N) * RatioPourN(N)
 */
export function getProductionPerSecond(rank: number): Decimal {
  return getBasePrice(rank).mul(getRatio(rank));
}

/**
 * Total cost to buy `batchSize` copies of rank-N generator when `currentCount` are already owned.
 * Uses geometric series:
 *   cost = basePrice * (1+INFLATION)^currentCount * ((1+INFLATION)^batchSize - 1) / INFLATION
 * For batchSize=1 this simplifies to basePrice * (1+INFLATION)^currentCount.
 */
export function getNextPrice(
  rank: number,
  currentCount: Decimal,
  batchSize: 1 | 10 | 100 = 1,
): Decimal {
  const base = getBasePrice(rank);
  const inflation = new Decimal(1 + INFLATION);
  const firstCost = base.mul(inflation.pow(currentCount));

  if (batchSize === 1) return firstCost.ceil();

  // Geometric series multiplier: ((1+INFLATION)^batchSize - 1) / INFLATION
  const seriesMultiplier = inflation.pow(batchSize).sub(1).div(INFLATION);
  return firstCost.mul(seriesMultiplier).ceil();
}

/**
 * Display name of the generator of rank N, derived from the exponent of its base price.
 * Mapping: exponent → letters where each 'Z' represents 26 and the final letter 1-26.
 * Examples: 10^1→GenA, 10^3→GenC, 10^76→GenZZX (26+26+24=76).
 */
export function getGeneratorName(rank: number): string {
  const exponent = Math.round(getBasePrice(rank).log10());
  let n = exponent;
  let letters = '';
  while (n > 26) {
    letters += 'Z';
    n -= 26;
  }
  letters += String.fromCharCode(64 + n); // 65='A', 90='Z'
  return `Gen${letters}`;
}

/**
 * Total currency produced per second across all generators.
 */
export function computeTotalCPS(
  generators: GeneratorMap,
  prestigeMultiplier: Decimal,
): Decimal {
  let total = new Decimal(0);
  for (const [rank, count] of generators) {
    total = total.add(count.mul(getProductionPerSecond(rank)).mul(prestigeMultiplier));
  }
  return total;
}

/**
 * V1 — product of all generator counts.
 * e.g. 234 GenA + 5 GenC → 234 × 5 = 1170
 */
export function computeNextMultiplier_V1(generators: GeneratorMap): Decimal {
  let mult = new Decimal(1);
  for (const [, count] of generators) {
    mult = mult.mul(count);
  }
  return mult;
}

/** Number of decimal digits of a Decimal integer (e.g. 234 → 3, 999 → 3, 1000 → 4). */
function digitCount(n: Decimal): number {
  return Math.floor(n.log10()) + 1;
}

/**
 * V2 — product of the digit-count of each generator count.
 * e.g. 234 GenA (3 digits) + 5 GenC (1 digit) → 3 × 1 = 3
 * Owning 999 or 234 of the same rank both contribute 3.
 */
function computeNextMultiplier_V2(generators: GeneratorMap): Decimal {
  let mult = new Decimal(1);
  for (const [, count] of generators) {
    mult = mult.mul(digitCount(count)+1);
  }
  return mult;
}

/**
 * Registry of all prestige formulas.
 * To add a new one: implement the function above, then add an entry here.
 * PrestigeFormulaId is automatically derived from the keys — no type to update manually.
 */
const PRESTIGE_FORMULAS: Record<PrestigeFormulaId, PrestigeFormula> = {
  v1: computeNextMultiplier_V1,
  v2: computeNextMultiplier_V2,
};


/** Active prestige formula — switch via PRESTIGE_FORMULA in constants.ts. */
export function computeNextMultiplier(generators: GeneratorMap): Decimal {
  return PRESTIGE_FORMULAS[PRESTIGE_FORMULA](generators);
}

/**
 * Maximum number of generators of rank N the player can afford right now.
 * Uses break_infinity's built-in geometric series solver.
 */
export function getMaxAffordable(
  rank: number,
  currentCount: Decimal,
  currency: Decimal,
): Decimal {
  return Decimal.affordGeometricSeries(
    currency,
    getBasePrice(rank),
    new Decimal(1 + INFLATION),
    currentCount,
  );
}

/**
 * Total cost to buy exactly `batchCount` generators of rank N starting from `currentCount`.
 * Uses break_infinity's geometric series sum.
 */
export function getTotalPriceForBatch(
  rank: number,
  currentCount: Decimal,
  batchCount: Decimal,
): Decimal {
  return Decimal.sumGeometricSeries(
    batchCount,
    getBasePrice(rank),
    new Decimal(1 + INFLATION),
    currentCount,
  ).ceil();
}

/** Inserts a non-breaking space every 3 digits on the integer part. */
function withThousandsSep(s: string): string {
  const [int, dec] = s.split('.');
  const formatted = int.replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0');
  return dec !== undefined ? `${formatted}.${dec}` : formatted;
}

/**
 * Human-readable number formatting for the UI.
 */
export function formatDecimal(d: Decimal): string {
  if (d.lt(1e6)) return withThousandsSep(d.toFixed(0));
  return d.toExponential(2);
}

/**
 * Formatting for prices (always integers after ceil — no decimal places below 1e6).
 */
export function formatPrice(d: Decimal): string {
  if (d.lt(1e6)) return withThousandsSep(d.toFixed(0));
  return d.toExponential(2);
}
