type TabNavProps = {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
};

export function TabNav({ tabs, activeTab, onTabChange }: TabNavProps) {
  if (tabs.length <= 1) return null;

  return (
    <div className="flex items-center gap-6 px-8 py-4 border-b border-winamp-border text-sm tracking-widest shrink-0 bg-winamp-bg">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`relative pb-2 transition-colors ${
            activeTab === tab ? "text-winamp-accent" : "text-winamp-accent-muted hover:text-winamp-bar"
          }`}
        >
          {tab}
          {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-winamp-accent" />}
        </button>
      ))}
    </div>
  );
}
