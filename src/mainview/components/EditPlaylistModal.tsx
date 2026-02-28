import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { usePlayerStore } from "../store/playerStore";
import type { Playlist } from "../types";

type EditPlaylistModalProps = {
  playlist: Playlist;
  onClose: () => void;
};

export function EditPlaylistModal({ playlist, onClose }: EditPlaylistModalProps) {
  const [name, setName] = useState(playlist.name.replace(/\.m3u8?$/i, ""));
  const renamePlaylist = usePlayerStore((s) => s.renamePlaylist);

  useEffect(() => {
    setName(playlist.name.replace(/\.m3u8?$/i, ""));
  }, [playlist]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || name === playlist.name.replace(/\.m3u8?$/i, "")) {
      onClose();
      return;
    }
    await renamePlaylist(playlist.id, name.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-winamp-panel border border-winamp-border p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-winamp-accent">RENAME PLAYLIST</h2>
          <button onClick={onClose} className="text-winamp-accent-muted hover:text-winamp-accent">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Playlist name"
            className="w-full px-4 py-2 bg-winamp-bg border border-winamp-border text-winamp-bar font-mono mb-4"
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-winamp-accent-muted hover:text-winamp-accent"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-4 py-2 bg-winamp-accent text-winamp-bg font-mono disabled:opacity-50"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
