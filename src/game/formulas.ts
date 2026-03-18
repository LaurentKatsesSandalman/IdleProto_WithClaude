import Decimal from 'break_infinity.js';
import {
  INFLATION,
  PRIX_INITIAL,
  RANK_MULTIPLIER,
  RATIO_INITIAL,
  USURE,
} from './constants';

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
 * Price of the NEXT copy of a rank-N generator when `currentCount` are already owned.
 * Prix(p+1) = PrixInitial(N) * (1 + INFLATION)^currentCount
 */
export function getNextPrice(rank: number, currentCount: Decimal): Decimal {
  return getBasePrice(rank).mul(new Decimal(1 + INFLATION).pow(currentCount));
}
