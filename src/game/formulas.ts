import Decimal from 'break_infinity.js';
import {
  INFLATION,
  PRESTIGE_FORMULA,
  PRIX_INITIAL,
  RANK_MULTIPLIER,
  RATIO_INITIAL,
  USURE,
} from './constants';
import type { GeneratorMap, PrestigeBreakdownEntry, PrestigeFormulaId } from './types';

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
 * Effective production per second of ONE generator of rank N, after prestige multiplier.
 * Ceiled to an integer so that the displayed value and the actual TICK computation agree.
 * (The ceil becomes a no-op in scientific notation where fractions are negligible.)
 */
export function getEffectiveProdPerUnit(rank: number, prestigeMultiplier: Decimal): Decimal {
  return getProductionPerSecond(rank).mul(prestigeMultiplier).ceil();
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
    total = total.add(count.mul(getEffectiveProdPerUnit(rank, prestigeMultiplier)));
  }
  return total;
}

/** Number of decimal digits of a Decimal integer (e.g. 234 → 3, 999 → 3, 1000 → 4). */
function digitCount(n: Decimal): number {
  return Math.floor(n.log10()) + 1;
}

/**
 * Per-rank contribution functions — UNIQUE source de vérité pour chaque formule.
 * Pour ajouter une version : ajouter une entrée ici, c'est tout.
 *
 * v1 — contribution = count lui-même      (234 GenA → ×234)
 * v2 — contribution = nb de digits + 0.5  (234 GenA → ×3.5, car 3 digits)
 */
type ContributionFn = (count: Decimal) => Decimal;
const PRESTIGE_CONTRIBUTIONS: Record<PrestigeFormulaId, ContributionFn> = {
  v1: (count) => count,
  v2: (count) => new Decimal(digitCount(count) + 0.5),
};

/** Active prestige formula — switch via PRESTIGE_FORMULA in constants.ts. */
export function computeNextMultiplier(generators: GeneratorMap): Decimal {
  return computePrestigeBreakdown(generators)
    .reduce((acc, { contribution }) => acc.mul(contribution), new Decimal(1));
}

/**
 * Breakdown of the prestige multiplier by rank, sorted by rank ascending.
 * Used for display in the prestige tab.
 */
export function computePrestigeBreakdown(generators: GeneratorMap): PrestigeBreakdownEntry[] {
  const fn = PRESTIGE_CONTRIBUTIONS[PRESTIGE_FORMULA];
  return Array.from(generators.entries())
    .sort(([a], [b]) => a - b)
    .map(([rank, count]) => ({ rank, contribution: fn(count) }));
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
  if (d.lt(1e6)) return withThousandsSep(d.ceil().toFixed(0));
  return d.toExponential(2);
}

/**
 * Formatting for prices (always integers after ceil — no decimal places below 1e6).
 */
export function formatPrice(d: Decimal): string {
  if (d.lt(1e6)) return withThousandsSep(d.toFixed(0));
  return d.toExponential(2);
}

/**
 * Formatting for multipliers — shows up to 2 decimal places, trailing zeros trimmed.
 * e.g. 2.0 → "2", 1.5 → "1.5", 1.50 → "1.5"
 */
export function formatMultiplier(d: Decimal): string {
  if (d.lt(1e6)) return withThousandsSep(d.toFixed(2).replace(/\.?0+$/, ''));
  return d.toExponential(2);
}
