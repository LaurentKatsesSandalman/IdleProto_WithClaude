import { useState } from 'react';
import { computeNextMultiplier, formatDecimal } from '../game/formulas';
import type { GameAction } from '../game/reducer';
import type { GameState } from '../game/types';
import { ConfirmModal } from './ConfirmModal';

interface ResetTabProps {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

export function ResetTab({ state, dispatch }: ResetTabProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const nextMultiplier = computeNextMultiplier(state.generators);
  const canReset = nextMultiplier.gt(state.prestigeMultiplier);

  function handleConfirm() {
    dispatch({ type: 'RESET' });
    setModalOpen(false);
  }

  return (
    <div className="tab-content">
      <div className="reset-panel">
        <div className="reset-row">
          <span className="reset-label">Multiplicateur actuel</span>
          <span className="reset-value">×{formatDecimal(state.prestigeMultiplier)}</span>
        </div>
        <div className="reset-row">
          <span className="reset-label">Prochain multiplicateur</span>
          <span className={`reset-value${canReset ? ' better' : ''}`}>
            ×{formatDecimal(nextMultiplier)}
          </span>
        </div>
        <p className="reset-hint">
          {canReset
            ? 'Vous pouvez effectuer un prestige pour booster votre production.'
            : 'Achetez plus de générateurs pour débloquer un meilleur multiplicateur.'}
        </p>
        <button
          className="reset-btn"
          disabled={!canReset}
          onClick={() => setModalOpen(true)}
        >
          Prestige
        </button>
      </div>

      {modalOpen && (
        <ConfirmModal
          nextMultiplier={nextMultiplier}
          onConfirm={handleConfirm}
          onCancel={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
