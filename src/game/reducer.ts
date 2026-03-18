import Decimal from 'break_infinity.js';
import { INITIAL_CURRENCY } from './constants';
import { getNextPrice, getProductionPerSecond } from './formulas';
import type { GameState } from './types';

// ---------------------------------------------------------------------------
// Action types
// ---------------------------------------------------------------------------

export type BuyAction = { type: 'BUY'; payload: { rank: number } };
export type TickAction = { type: 'TICK'; payload: { delta: number } };
export type ResetAction = { type: 'RESET' };

export type GameAction = BuyAction | TickAction | ResetAction;

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

export const initialState: GameState = {
  currency: new Decimal(INITIAL_CURRENCY),
  generators: new Map(),
  prestigeMultiplier: new Decimal(1),
};

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'BUY': {
      const { rank } = action.payload;
      const currentCount = state.generators.get(rank) ?? new Decimal(0);
      const price = getNextPrice(rank, currentCount);

      if (state.currency.lt(price)) return state;

      const newGenerators = new Map(state.generators);
      newGenerators.set(rank, currentCount.add(1));

      return {
        ...state,
        currency: state.currency.sub(price),
        generators: newGenerators,
      };
    }

    case 'TICK': {
      const { delta } = action.payload;
      const deltaSeconds = delta / 1000;

      let totalProduction = new Decimal(0);
      for (const [rank, count] of state.generators) {
        totalProduction = totalProduction.add(
          count.mul(getProductionPerSecond(rank)).mul(state.prestigeMultiplier),
        );
      }

      return {
        ...state,
        currency: state.currency.add(totalProduction.mul(deltaSeconds)),
      };
    }

    case 'RESET': {
      // Don't reset if the player owns no generators (no meaningful multiplier)
      if (state.generators.size === 0) return state;

      // New prestige multiplier = product of all generator counts
      let newMultiplier = new Decimal(1);
      for (const [, count] of state.generators) {
        newMultiplier = newMultiplier.mul(count);
      }

      return {
        currency: new Decimal(INITIAL_CURRENCY),
        generators: new Map(),
        prestigeMultiplier: newMultiplier,
      };
    }

    default:
      return state;
  }
}
