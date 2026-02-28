import { useState } from "react";
import { usePlayerStore } from "../store/playerStore";
import { Dialog } from "./Dialog";

type CreatePlaylistModalProps = {
  onClose: () => void;
};

export function CreatePlaylistModal({ onClose }: CreatePlaylistModalProps) {
  const [name, setName] = useState("");
  const createPlaylist = usePlayerStore((s) => s.createPlaylist);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await createPlaylist(name.trim());
    onClose();
  };

  return (
    <Dialog title="CREATE PLAYLIST" onClose={onClose}>
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
            Create
          </button>
        </div>
      </form>
    </Dialog>
  );
}
