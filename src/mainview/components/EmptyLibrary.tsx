import { useState, useEffect } from "react";
import { FolderPlus, Music, Loader2, AlertCircle, ChevronDown } from "lucide-react";
import { usePlayerStore } from "../store/playerStore";

export function EmptyLibrary() {
  const { rpc, addFolder, library } = usePlayerStore();
  const [pathInput, setPathInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [defaultPath, setDefaultPath] = useState<string | null>(null);

  useEffect(() => {
    if (rpc) {
      rpc.request.getDefaultMusicPath().then(setDefaultPath);
    }
  }, [rpc]);

  const handleAddDefault = async () => {
    if (!rpc || !defaultPath) return;
    setLoading(true);
    try {
      await addFolder(defaultPath);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustom = async () => {
    if (!pathInput.trim()) return;
    setLoading(true);
    try {
      await addFolder(pathInput.trim());
      setPathInput("");
      setShowCustom(false);
    } finally {
      setLoading(false);
    }
  };

  const handlePaste = () => {
    navigator.clipboard.readText().then((text) => {
      const trimmed = text.trim().replace(/^["']|["']$/g, "");
      if (trimmed) setPathInput(trimmed);
    });
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-8 p-12">
      <div className="w-36 h-36 border-2 border-winamp-border bg-winamp-panel-alt flex items-center justify-center rounded-lg">
        <Music size={64} className="text-winamp-accent-muted" />
      </div>

      <div className="text-center max-w-lg">
        <h2 className="text-3xl font-bold text-winamp-accent mb-3 tracking-wide">
          ADD YOUR MUSIC
        </h2>
        <p className="text-winamp-accent-muted text-sm mb-8 leading-relaxed">
          Add a folder to scan for audio files. We&apos;ll search recursively through
          all subfolders for MP3, FLAC, M4A, and more.
        </p>

        {library.error && (
          <div className="flex items-center gap-2 px-4 py-3 mb-6 bg-red-500/10 border border-red-500/30 text-red-400 rounded font-mono text-sm">
            <AlertCircle size={18} className="flex-shrink-0" />
            <span>{library.error}</span>
          </div>
        )}

        <div className="flex flex-col gap-4">
          <button
            onClick={handleAddDefault}
            disabled={loading || !defaultPath}
            className="flex items-center justify-center gap-3 px-8 py-4 bg-winamp-border hover:bg-winamp-accent-muted text-winamp-bar hover:text-winamp-bg transition-colors font-mono text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <FolderPlus size={20} />
            )}
            {loading ? "Scanning..." : "Add default Music folder"}
          </button>

          {defaultPath && (
            <p className="text-xs text-winamp-accent-muted font-mono truncate px-4">
              {defaultPath}
            </p>
          )}

          <div className="relative pt-4">
            <button
              onClick={() => setShowCustom(!showCustom)}
              className="flex items-center justify-center gap-2 text-winamp-accent-muted hover:text-winamp-accent transition-colors text-sm"
            >
              <ChevronDown
                size={16}
                className={`transition-transform ${showCustom ? "rotate-180" : ""}`}
              />
              {showCustom ? "Hide" : "Or add a different folder"}
            </button>

            {showCustom && (
              <div className="mt-4 flex flex-col gap-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={pathInput}
                    onChange={(e) => setPathInput(e.target.value)}
                    placeholder="Paste or type folder path..."
                    className="flex-1 px-4 py-2.5 bg-winamp-panel border border-winamp-border text-winamp-bar placeholder-winamp-accent-muted font-mono text-sm focus:border-winamp-accent outline-none transition-colors"
                  />
                  <button
                    onClick={handlePaste}
                    className="px-3 py-2.5 bg-winamp-panel border border-winamp-border text-winamp-accent-muted hover:text-winamp-accent text-xs font-mono"
                  >
                    Paste
                  </button>
                </div>
                <button
                  onClick={handleAddCustom}
                  disabled={!pathInput.trim() || loading}
                  className="px-4 py-2.5 bg-winamp-border hover:bg-winamp-accent-muted disabled:opacity-50 disabled:cursor-not-allowed text-winamp-bar font-mono text-sm"
                >
                  Add Folder
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
