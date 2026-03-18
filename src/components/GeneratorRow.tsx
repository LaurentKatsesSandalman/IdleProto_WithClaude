import Decimal from 'break_infinity.js';
import {
  formatDecimal,
  formatPrice,
  getEffectiveProdPerUnit,
  getGeneratorName,
  getMaxAffordable,
  getNextPrice,
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
  const prodPerUnit = getEffectiveProdPerUnit(rank, prestigeMultiplier);
  const cps = count.mul(prodPerUnit);
  const payback = getNextPrice(rank, count, 1).div(prodPerUnit);

  const affordable = batchSize === 'max' ? getMaxAffordable(rank, count, currency) : null;
  const price = batchSize === 'max'
    ? getTotalPriceForBatch(rank, count, affordable!)
    : getNextPrice(rank, count, batchSize);
  const canAfford = batchSize === 'max' ? affordable!.gt(0) : currency.gte(price);
  const displayCount = (batchSize === 'max' && affordable!.lte(0))
    ? '1'
    : batchSize === 'max' ? affordable!.toFixed(0) : String(batchSize);
  const displayPrice = (batchSize === 'max' && affordable!.lte(0))
    ? formatPrice(getNextPrice(rank, count, 1))
    : formatPrice(price);
  const buyLabel = batchSize === 'max'
    ? `Max ×${displayCount} : ${displayPrice}`
    : `Acheter ×${batchSize} : ${displayPrice}`;

  return (
    <div className="generator-row">
      <div className="gen-info">
        <span className="gen-name">{name} : produit {formatDecimal(prodPerUnit)}/s</span>
        <span className="gen-owned">{count.toFixed(0)} possédé</span>
        <span className="gen-cps">{formatDecimal(cps)}/s</span>
        <span className="gen-payback">rentabilisation : {formatDecimal(payback)}s</span>
      </div>
      <button className="buy-btn" disabled={!canAfford} onClick={onBuy}>
        {buyLabel}
      </button>
    </div>
  );
}
