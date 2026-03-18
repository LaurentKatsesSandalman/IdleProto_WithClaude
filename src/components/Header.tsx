import Decimal from 'break_infinity.js';
import { formatDecimal } from '../game/formulas';

interface HeaderProps {
  currency: Decimal;
  prestigeMultiplier: Decimal;
  totalCPS: Decimal;
}

export function Header({ currency, prestigeMultiplier, totalCPS }: HeaderProps) {
  return (
    <header className="game-header">
      <h1 className="game-title">Idle Proto</h1>
      <div className="game-header-stats">
        <span className="stat">
          <span className="stat-label">Currency</span>
          <span className="stat-value">{formatDecimal(currency)}</span>
        </span>
        <span className="stat-sep" />
        <span className="stat">
          <span className="stat-label">par seconde</span>
          <span className="stat-value">{formatDecimal(totalCPS)}/s</span>
        </span>
        <span className="stat-sep" />
        <span className="stat">
          <span className="stat-label">Prestige</span>
          <span className="stat-value">×{formatDecimal(prestigeMultiplier)}</span>
        </span>
      </div>
    </header>
  );
}
