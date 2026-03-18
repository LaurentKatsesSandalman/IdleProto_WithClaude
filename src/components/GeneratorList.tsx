import Decimal from 'break_infinity.js';
import type { GameAction } from '../game/reducer';
import type { BatchSize, GameState } from '../game/types';
import { GeneratorRow } from './GeneratorRow';

interface GeneratorListProps {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  batchSize: BatchSize;
}

export function GeneratorList({ state, dispatch, batchSize }: GeneratorListProps) {
  const highestOwnedRank = state.generators.size > 0
    ? Math.max(...state.generators.keys())
    : 0;

  const visibleRanks = Array.from({ length: highestOwnedRank + 1 }, (_, i) => i + 1);

  return (
    <div className="generator-list">
      {visibleRanks.map((rank) => {
        const count = state.generators.get(rank) ?? new Decimal(0);
        return (
          <GeneratorRow
            key={rank}
            rank={rank}
            count={count}
            prestigeMultiplier={state.prestigeMultiplier}
            currency={state.currency}
            batchSize={batchSize}
            onBuy={() => {
              if (batchSize === 'max') {
                dispatch({ type: 'BUY_MAX', payload: { rank } });
              } else {
                dispatch({ type: 'BUY', payload: { rank, batchSize } });
              }
            }}
          />
        );
      })}
    </div>
  );
}
