import Decimal from 'break_infinity.js';
import {
  INFLATION,
  PRIX_INITIAL,
  RANK_MULTIPLIER,
  RATIO_INITIAL,
  USURE,
} from './constants';
import type { GeneratorMap } from './types';

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

  if (batchSize === 1) return firstCost;

  // Geometric series multiplier: ((1+INFLATION)^batchSize - 1) / INFLATION
  const seriesMultiplier = inflation.pow(batchSize).sub(1).div(INFLATION);
  return firstCost.mul(seriesMultiplier);
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
 * Prestige multiplier the player would gain if they reset now.
 * = product of all generator counts (1 if no generators).
 */
export function computeNextMultiplier(generators: GeneratorMap): Decimal {
  let mult = new Decimal(1);
  for (const [, count] of generators) {
    mult = mult.mul(count);
  }
  return mult;
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
  );
}

/**
 * Human-readable number formatting for the UI.
 */
export function formatDecimal(d: Decimal): string {
  if (d.lt(1e6)) return d.toFixed(2);
  return d.toExponential(2);
}
