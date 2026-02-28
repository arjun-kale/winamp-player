import { useState, useEffect } from "react";
import { usePlayerStore } from "../store/playerStore";
import type { Playlist } from "../types";
import { Dialog } from "./Dialog";

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
    <Dialog title="RENAME PLAYLIST" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Playlist name"
          className="w-full px-4 py-2.5 bg-winamp-panel-alt border border-winamp-border text-winamp-text-bright font-mono text-sm mb-4 placeholder:text-winamp-accent-muted focus:border-winamp-accent focus:outline-none transition-colors"
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
    </Dialog>
  );
}
