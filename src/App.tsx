import { useEffect, useReducer, useState } from 'react';
import './App.css';
import { Header } from './components/Header';
import { ProdTab } from './components/ProdTab';
import { ResetTab } from './components/ResetTab';
import { TabSelector, type TabId } from './components/TabSelector';
import { TICK_INTERVAL_MS } from './game/constants';
import { computeTotalCPS } from './game/formulas';
import { gameReducer, initialState } from './game/reducer';

function App() {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const [activeTab, setActiveTab] = useState<TabId>('prod');

  useEffect(() => {
    const id = setInterval(() => {
      dispatch({ type: 'TICK', payload: { delta: TICK_INTERVAL_MS } });
    }, TICK_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  const totalCPS = computeTotalCPS(state.generators, state.prestigeMultiplier);

  return (
    <div className="game-root">
      <Header
        currency={state.currency}
        prestigeMultiplier={state.prestigeMultiplier}
        totalCPS={totalCPS}
      />
      <TabSelector activeTab={activeTab} onTabChange={setActiveTab} />
      {activeTab === 'prod' && <ProdTab state={state} dispatch={dispatch} />}
      {activeTab === 'reset' && <ResetTab state={state} dispatch={dispatch} />}
    </div>
  );
}

export default App;
