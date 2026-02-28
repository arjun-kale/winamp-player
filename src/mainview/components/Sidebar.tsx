import { Disc, Mic2, ListMusic, Radio, Clock, Heart, Settings } from "lucide-react";
import type { NavState, NavView } from "../types";
import type { Mix } from "../types";

type SidebarProps = {
  navState: NavState;
  mixes: Mix[];
  onNavigate: (view: NavView, id?: string) => void;
};

const NAV_ITEMS: { id: NavView; icon: typeof Disc; label: string }[] = [
  { id: "library", icon: Disc, label: "All Tracks" },
  { id: "artists", icon: Mic2, label: "Artists" },
  { id: "playlists", icon: ListMusic, label: "Playlists" },
  { id: "radio", icon: Radio, label: "Radio Streams" },
  { id: "recent", icon: Clock, label: "Recently Played" },
];

export function Sidebar({ navState, mixes, onNavigate }: SidebarProps) {
  return (
    <div className="w-64 border-r border-winamp-border bg-winamp-panel-alt flex flex-col flex-shrink-0">
      <div className="p-6">
        <div className="text-winamp-accent-muted text-xs tracking-[0.2em] mb-4">LIBRARY</div>
        <div className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = navState.view === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-left transition-colors ${
                  isActive
                    ? "bg-winamp-border text-winamp-accent border-l-2 border-winamp-accent"
                    : "text-winamp-text hover:bg-winamp-hover hover:text-winamp-bar border-l-2 border-transparent"
                }`}
              >
                <item.icon size={16} /> {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-6 py-4 border-t border-winamp-border flex-1">
        <div className="flex items-center justify-between mb-4">
          <div className="text-winamp-accent-muted text-xs tracking-[0.2em]">YOUR MIXES</div>
          <Heart size={12} className="text-winamp-accent-muted" />
        </div>
        <div className="space-y-2 text-sm text-winamp-text">
          {mixes.map((mix) => (
            <div
              key={mix.id}
              onClick={() => onNavigate("mix", mix.id)}
              className={`cursor-pointer truncate transition-colors ${
                navState.view === "mix" && navState.id === mix.id ? "text-winamp-accent" : "hover:text-winamp-accent"
              }`}
            >
              &gt; {mix.name}
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-winamp-border flex items-center gap-3 text-sm text-winamp-accent-muted hover:text-winamp-accent cursor-pointer transition-colors">
        <Settings size={16} /> SETTINGS
      </div>
    </div>
  );
}
