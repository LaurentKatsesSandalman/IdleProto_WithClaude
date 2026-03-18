import Decimal from 'break_infinity.js';
import { formatDecimal } from '../game/formulas';

interface ConfirmModalProps {
  nextMultiplier: Decimal;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({ nextMultiplier, onConfirm, onCancel }: ConfirmModalProps) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h2>Confirmer le prestige ?</h2>
        <p>
          Tout sera remis à zéro, mais votre multiplicateur de production
          deviendra{' '}
          <strong>×{formatDecimal(nextMultiplier)}</strong>.
        </p>
        <div className="modal-actions">
          <button className="modal-btn cancel" onClick={onCancel}>
            Annuler
          </button>
          <button className="modal-btn confirm" onClick={onConfirm}>
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
}
