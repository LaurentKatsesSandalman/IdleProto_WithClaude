import Decimal from 'break_infinity.js';
import type { PrestigeFormulaId } from './types';

/** Starting currency and cost of the first rank-1 generator */
export const INITIAL_CURRENCY = new Decimal(10);
export const PRIX_INITIAL = INITIAL_CURRENCY;

/** Production ratio for rank-1 generators (currency/s per currency of cost) */
export const RATIO_INITIAL = 0.1;

/** Cost multiplier between ranks: rank-N base price = PRIX_INITIAL * RANK_MULTIPLIER^(N-1) */
export const RANK_MULTIPLIER = new Decimal(10);

/** Price inflation per additional copy of the same generator */
export const INFLATION = 0.25;

/** Production ratio decay per rank */
export const USURE = 0.75;

/** Interval between TICK dispatches in milliseconds */
export const TICK_INTERVAL_MS = 100;

/**
 * Prestige formula to use.
 * 'v1' — product of generator counts (234 GenA → ×234)
 * 'v2' — product of digit-counts    (234 GenA → ×3)
 */
export const PRESTIGE_FORMULA: PrestigeFormulaId = 'v2';
