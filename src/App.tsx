import { useEffect, useReducer } from 'react';
import { TICK_INTERVAL_MS } from './game/constants';
import { getNextPrice } from './game/formulas';
import { gameReducer, initialState } from './game/reducer';
import Decimal from 'break_infinity.js';

function App() {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Tick loop
  useEffect(() => {
    const id = setInterval(() => {
      dispatch({ type: 'TICK', payload: { delta: TICK_INTERVAL_MS } });
    }, TICK_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  // Ranks visible to the player:
  // - rank 1 is always visible
  // - rank N+1 is visible if the player owns at least one generator of rank N
  const highestOwnedRank = state.generators.size > 0
    ? Math.max(...state.generators.keys())
    : 0;
  const visibleRanks = Array.from({ length: highestOwnedRank + 1 }, (_, i) => i + 1);

  return (
    <div style={{ fontFamily: 'monospace', padding: '1rem' }}>
      <h1>Idle Game</h1>
      <p>Currency: {state.currency.toFixed(2)}</p>
      <p>Prestige multiplier: ×{state.prestigeMultiplier.toFixed(2)}</p>

      <h2>Generators</h2>
      {visibleRanks.map((rank) => {
        const count = state.generators.get(rank) ?? new Decimal(0);
        const price = getNextPrice(rank, count);
        const canAfford = state.currency.gte(price);
        return (
          <div key={rank} style={{ marginBottom: '0.5rem' }}>
            <strong>Rank {rank}</strong> — owned: {count.toFixed(0)} — next cost:{' '}
            {price.toFixed(2)}
            <button
              style={{ marginLeft: '0.5rem' }}
              disabled={!canAfford}
              onClick={() => dispatch({ type: 'BUY', payload: { rank } })}
            >
              Buy
            </button>
          </div>
        );
      })}

      <hr />
      <button onClick={() => dispatch({ type: 'RESET' })}>
        Prestige (reset)
      </button>
    </div>
  );
}

export default App;
