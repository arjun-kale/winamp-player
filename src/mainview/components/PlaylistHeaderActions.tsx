import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { usePlayerStore } from "../store/playerStore";
import type { Playlist } from "../types";
import type { NavView } from "../types";
import { EditPlaylistModal } from "./EditPlaylistModal";

type PlaylistHeaderActionsProps = {
  playlist: Playlist;
  onNavigate: (view: NavView, id?: string) => void;
};

export function PlaylistHeaderActions({ playlist, onNavigate }: PlaylistHeaderActionsProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const deletePlaylist = usePlayerStore((s) => s.deletePlaylist);

  const handleDelete = async () => {
    if (!confirm(`Delete playlist "${playlist.name}"? This will not remove the tracks from your library.`)) {
      return;
    }
    await deletePlaylist(playlist.id);
    onNavigate("playlists");
  };

  return (
    <>
      <div className="flex items-center gap-1">
        <button
          onClick={() => setShowEditModal(true)}
          className="p-1.5 rounded text-winamp-accent-muted hover:text-winamp-accent hover:bg-winamp-hover transition-colors"
          aria-label="Rename playlist"
        >
          <Pencil size={18} />
        </button>
        <button
          onClick={handleDelete}
          className="p-1.5 rounded text-winamp-accent-muted hover:text-red-400 hover:bg-winamp-hover transition-colors"
          aria-label="Delete playlist"
        >
          <Trash2 size={18} />
        </button>
      </div>
      {showEditModal && (
        <EditPlaylistModal playlist={playlist} onClose={() => setShowEditModal(false)} />
      )}
    </>
  );
}
