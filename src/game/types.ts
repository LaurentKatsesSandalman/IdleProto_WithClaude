import Decimal from 'break_infinity.js';

/**
 * Maps each rank (where the player owns at least one generator) to its count.
 * Keys are ranks (1, 2, 3, …); values are Decimal counts.
 */
export type GeneratorMap = Map<number, Decimal>;

/** Batch size for buy actions. 'max' means "buy as many as currently affordable". */
export type BatchSize = 1 | 10 | 100 | 'max';

/** Identifier for a prestige formula. Change PRESTIGE_FORMULA in constants.ts to switch. */
export type PrestigeFormulaId = string;

/** A prestige formula takes the current generators and returns the next multiplier. */
export type PrestigeFormula = (generators: GeneratorMap) => Decimal;

/** One rank's contribution to the prestige multiplier, for display purposes. */
export interface PrestigeBreakdownEntry {
  rank: number;
  contribution: Decimal;
}

export interface GameState {
  /** Current currency owned by the player */
  currency: Decimal;

  /**
   * Generators owned, keyed by rank.
   * Only ranks with count > 0 are present.
   */
  generators: GeneratorMap;

  /**
   * Prestige/reset multiplier applied to all generator production.
   * Starts at 1. Recalculated at each RESET as the product of all generator counts.
   */
  prestigeMultiplier: Decimal;
}
