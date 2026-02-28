import { useState } from "react";
import { Disc, Mic2, ListMusic, Radio, Clock, FolderOpen, Settings, Plus } from "lucide-react";
import type { NavState, NavView } from "../types";
import type { Playlist } from "../types";
import { CreatePlaylistModal } from "./CreatePlaylistModal";

type SidebarProps = {
  navState: NavState;
  playlists: Playlist[];
  onNavigate: (view: NavView, id?: string) => void;
};

const NAV_ITEMS: { id: NavView; icon: typeof Disc; label: string }[] = [
  { id: "library", icon: Disc, label: "All Tracks" },
  { id: "artists", icon: Mic2, label: "Artists" },
  { id: "playlists", icon: ListMusic, label: "Playlists" },
  { id: "folders", icon: FolderOpen, label: "Folders" },
  { id: "radio", icon: Radio, label: "Radio" },
  { id: "recent", icon: Clock, label: "Recently Played" },
];

export function Sidebar({ navState, playlists, onNavigate }: SidebarProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);

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
        <div className="flex justify-between items-center mb-4">
          <div className="text-winamp-accent-muted text-xs tracking-[0.2em]">PLAYLISTS</div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="p-1 text-winamp-accent-muted hover:text-winamp-accent"
            aria-label="Create playlist"
          >
            <Plus size={14} />
          </button>
        </div>
        <div className="space-y-2 text-sm text-winamp-text">
          {playlists.map((pl) => (
            <div
              key={pl.id}
              onClick={() => onNavigate("playlist_detail", pl.id)}
              className={`cursor-pointer truncate transition-colors ${
                navState.view === "playlist_detail" && navState.id === pl.id
                  ? "text-winamp-accent"
                  : "hover:text-winamp-accent"
              }`}
            >
              &gt; {pl.name}
            </div>
          ))}
          {playlists.length === 0 && (
            <div className="text-winamp-accent-muted text-xs">No playlists yet</div>
          )}
        </div>
      </div>

      <div
        className="p-4 border-t border-winamp-border flex items-center gap-3 text-sm text-winamp-accent-muted hover:text-winamp-accent cursor-pointer transition-colors"
        onClick={() => onNavigate("folders")}
      >
        <Settings size={16} /> FOLDERS
      </div>
      {showCreateModal && (
        <CreatePlaylistModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
}
