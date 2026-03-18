import { useState } from 'react';
import type { GameAction } from '../game/reducer';
import type { BatchSize, GameState } from '../game/types';
import { GeneratorList } from './GeneratorList';

interface ProdTabProps {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

const BATCH_SIZES: BatchSize[] = [1, 10, 100, 'max'];

function batchLabel(size: BatchSize): string {
  return size === 'max' ? 'Max' : `×${size}`;
}

export function ProdTab({ state, dispatch }: ProdTabProps) {
  const [batchSize, setBatchSize] = useState<BatchSize>(1);

  return (
    <div className="tab-content">
      <div className="batch-toggle">
        {BATCH_SIZES.map((size) => (
          <button
            key={size}
            className={`batch-btn${batchSize === size ? ' active' : ''}`}
            onClick={() => setBatchSize(size)}
          >
            {batchLabel(size)}
          </button>
        ))}
      </div>
      <GeneratorList state={state} dispatch={dispatch} batchSize={batchSize} />
    </div>
  );
}
