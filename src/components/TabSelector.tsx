export type TabId = 'prod' | 'reset';

interface TabSelectorProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export function TabSelector({ activeTab, onTabChange }: TabSelectorProps) {
  return (
    <div className="tab-bar">
      <button
        className={`tab-btn${activeTab === 'prod' ? ' active' : ''}`}
        onClick={() => onTabChange('prod')}
      >
        Production
      </button>
      <button
        className={`tab-btn${activeTab === 'reset' ? ' active' : ''}`}
        onClick={() => onTabChange('reset')}
      >
        Prestige
      </button>
    </div>
  );
}
