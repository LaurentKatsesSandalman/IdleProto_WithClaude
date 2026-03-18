import Decimal from 'break_infinity.js';
import {
  formatDecimal,
  getGeneratorName,
  getMaxAffordable,
  getNextPrice,
  getProductionPerSecond,
  getTotalPriceForBatch,
} from '../game/formulas';
import type { BatchSize } from '../game/types';

interface GeneratorRowProps {
  rank: number;
  count: Decimal;
  prestigeMultiplier: Decimal;
  currency: Decimal;
  batchSize: BatchSize;
  onBuy: () => void;
}

export function GeneratorRow({
  rank,
  count,
  prestigeMultiplier,
  currency,
  batchSize,
  onBuy,
}: GeneratorRowProps) {
  const name = getGeneratorName(rank);
  const cps = count.mul(getProductionPerSecond(rank)).mul(prestigeMultiplier);

  const affordable = batchSize === 'max' ? getMaxAffordable(rank, count, currency) : null;
  const price = batchSize === 'max'
    ? getTotalPriceForBatch(rank, count, affordable!)
    : getNextPrice(rank, count, batchSize);
  const canAfford = batchSize === 'max' ? affordable!.gt(0) : currency.gte(price);
  const buyLabel = batchSize === 'max'
    ? `Max ×${affordable!.toFixed(0)}: ${formatDecimal(price)}`
    : `Buy ×${batchSize}: ${formatDecimal(price)}`;

  return (
    <div className="generator-row">
      <div className="gen-info">
        <span className="gen-name">{name}</span>
        <span className="gen-owned">{count.toFixed(0)} owned</span>
        <span className="gen-cps">{formatDecimal(cps)}/s</span>
      </div>
      <button className="buy-btn" disabled={!canAfford} onClick={onBuy}>
        {buyLabel}
      </button>
    </div>
  );
}
