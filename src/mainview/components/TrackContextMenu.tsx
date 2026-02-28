import { createPortal } from "react-dom";
import { Plus, Check } from "lucide-react";
import type { Track } from "../types";
import { usePlayerStore } from "../store/playerStore";

type TrackContextMenuProps = {
  x: number;
  y: number;
  track: Track;
  onClose: () => void;
};

export function TrackContextMenu({ x, y, track, onClose }: TrackContextMenuProps) {
  const { playlists, addTrackToPlaylist } = usePlayerStore();

  return createPortal(
    <div
      className="fixed z-50 bg-winamp-panel border border-winamp-border shadow-xl py-1 min-w-[180px]"
      style={{ left: x, top: y }}
    >
      <div className="px-3 py-2 text-xs text-winamp-accent-muted border-b border-winamp-border/50">
        ADD TO PLAYLIST
      </div>
      {playlists.items.length === 0 ? (
        <div className="px-3 py-2 text-sm text-winamp-accent-muted">No playlists yet</div>
      ) : (
        playlists.items.map((pl) => {
          const isInPlaylist = pl.trackIds.includes(track.path);
          return (
            <button
              key={pl.id}
              onClick={async () => {
                if (!isInPlaylist) {
                  await addTrackToPlaylist(pl.id, track);
                }
                onClose();
              }}
              disabled={isInPlaylist}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left ${
                isInPlaylist
                  ? "text-winamp-accent-muted cursor-default"
                  : "text-winamp-bar hover:bg-winamp-hover hover:text-winamp-accent"
              }`}
            >
              {isInPlaylist ? (
                <Check size={14} className="text-winamp-accent shrink-0" />
              ) : (
                <Plus size={14} className="shrink-0" />
              )}
              <span className={isInPlaylist ? "italic" : ""}>{pl.name}</span>
              {isInPlaylist && <span className="text-xs text-winamp-accent-muted">(in playlist)</span>}
            </button>
          );
        })
      )}
    </div>,
    document.body
  );
}
