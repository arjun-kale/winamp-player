type TabNavProps = {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
};

const MAX_TAB_WIDTH = 140;

export function TabNav({ tabs, activeTab, onTabChange }: TabNavProps) {
  if (tabs.length <= 1) return null;

  return (
    <div className="shrink-0 border-b border-winamp-border bg-winamp-bg overflow-hidden">
      <div className="flex items-center gap-6 px-8 py-4 overflow-x-auto text-sm tracking-widest">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            title={tab}
            className={`relative pb-2 flex-shrink-0 truncate transition-colors ${
              activeTab === tab ? "text-winamp-accent" : "text-winamp-accent-muted hover:text-winamp-bar"
            }`}
            style={{ maxWidth: MAX_TAB_WIDTH }}
          >
            <span className="block truncate">{tab}</span>
            {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-winamp-accent" />}
          </button>
        ))}
      </div>
    </div>
  );
}
