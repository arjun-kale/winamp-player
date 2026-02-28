import type { GenreTab } from "../data/mock";
import { GENRE_TABS } from "../data/mock";

type TabNavProps = {
  activeTab: GenreTab;
  onTabChange: (tab: GenreTab) => void;
};

export function TabNav({ activeTab, onTabChange }: TabNavProps) {
  return (
    <div className="flex items-center gap-6 px-8 py-4 border-b border-winamp-border text-sm tracking-widest shrink-0 bg-winamp-bg">
      {GENRE_TABS.map((tab) => (
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
