import { useState, useEffect } from "react";
import { FolderPlus, Trash2, Loader2, AlertCircle, ChevronDown, FolderOpen } from "lucide-react";
import { usePlayerStore } from "../store/playerStore";

export function FoldersView() {
  const { settings, addFolder, removeFolder, library, rpc } = usePlayerStore();
  const [pathInput, setPathInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [defaultPath, setDefaultPath] = useState<string | null>(null);

  useEffect(() => {
    if (rpc) {
      rpc.request.getDefaultMusicPath().then(setDefaultPath);
    }
  }, [rpc]);

  const clearError = () => {
    setLocalError(null);
    usePlayerStore.setState((s) => ({
      library: { ...s.library, error: null },
    }));
  };

  const handleAddDefault = async () => {
    if (!rpc || !defaultPath) return;
    setLoading(true);
    setLocalError(null);
    try {
      await addFolder(defaultPath);
      setShowAdd(false);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustom = async () => {
    if (!pathInput.trim()) return;
    setLoading(true);
    setLocalError(null);
    try {
      await addFolder(pathInput.trim());
      setPathInput("");
      setShowAdd(false);
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async () => {
    if (!rpc || !pathInput.trim()) return;
    const result = await rpc.request.validateFolder({ path: pathInput.trim() });
    if (result.valid && result.resolvedPath) {
      setPathInput(result.resolvedPath);
      setLocalError(null);
    } else {
      setLocalError(result.error ?? "Invalid path");
    }
  };

  const handlePaste = () => {
    navigator.clipboard.readText().then((text) => {
      const trimmed = text.trim().replace(/^["']|["']$/g, "");
      if (trimmed) setPathInput(trimmed);
    });
  };

  const error = localError ?? library.error;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="h-56 border-b border-winamp-border p-8 flex flex-col justify-end shrink-0">
        <div className="text-winamp-accent-muted text-sm tracking-widest mb-2">
          SETTINGS
        </div>
        <h1 className="text-4xl font-bold text-winamp-accent tracking-wider mb-2">
          WATCH FOLDERS
        </h1>
        <p className="text-winamp-text text-sm">
          Folders listed here are scanned recursively for audio files
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        {error && (
          <div
            className="flex items-center justify-between gap-4 px-4 py-3 mb-6 bg-red-500/10 border border-red-500/30 text-red-400 rounded font-mono text-sm"
          >
            <div className="flex items-center gap-2 min-w-0">
              <AlertCircle size={18} className="flex-shrink-0" />
              <span className="truncate">{error}</span>
            </div>
            <button
              onClick={clearError}
              className="text-red-400 hover:text-red-300 flex-shrink-0 px-2"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="mb-8">
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-2 px-4 py-2.5 bg-winamp-border hover:bg-winamp-accent-muted text-winamp-bar font-mono text-sm transition-colors"
          >
            <FolderPlus size={18} />
            Add folder
            <ChevronDown
              size={16}
              className={`transition-transform ${showAdd ? "rotate-180" : ""}`}
            />
          </button>

          {showAdd && (
            <div className="mt-4 p-6 bg-winamp-panel border border-winamp-border space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs text-winamp-accent-muted tracking-wider">
                  QUICK ADD
                </label>
                <button
                  onClick={handleAddDefault}
                  disabled={loading || !defaultPath}
                  className="flex items-center gap-2 w-fit px-4 py-2 bg-winamp-border hover:bg-winamp-accent-muted disabled:opacity-50 text-winamp-bar font-mono text-sm"
                >
                  {loading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <FolderOpen size={16} />
                  )}
                  {loading ? "Adding..." : "Add default Music folder"}
                </button>
                {defaultPath && (
                  <p className="text-xs text-winamp-accent-muted font-mono break-all">
                    {defaultPath}
                  </p>
                )}
              </div>

              <div className="border-t border-winamp-border pt-4">
                <label className="text-xs text-winamp-accent-muted tracking-wider block mb-2">
                  CUSTOM PATH
                </label>
                <div className="flex flex-wrap gap-2">
                  <input
                    type="text"
                    value={pathInput}
                    onChange={(e) => {
                      setPathInput(e.target.value);
                      setLocalError(null);
                    }}
                    placeholder="C:\Users\...\Music"
                    className="flex-1 min-w-[200px] px-4 py-2 bg-winamp-bg border border-winamp-border text-winamp-bar placeholder-winamp-accent-muted font-mono text-sm focus:border-winamp-accent outline-none"
                  />
                  <button
                    onClick={handlePaste}
                    className="px-3 py-2 bg-winamp-bg border border-winamp-border text-winamp-accent-muted hover:text-winamp-accent text-xs font-mono"
                  >
                    Paste
                  </button>
                  <button
                    onClick={handleValidate}
                    className="px-3 py-2 bg-winamp-bg border border-winamp-border text-winamp-bar hover:bg-winamp-hover text-xs font-mono"
                  >
                    Validate
                  </button>
                  <button
                    onClick={handleAddCustom}
                    disabled={!pathInput.trim() || loading}
                    className="px-4 py-2 bg-winamp-accent text-winamp-bg hover:opacity-90 disabled:opacity-50 font-mono text-sm"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="text-xs text-winamp-accent-muted tracking-wider mb-3">
            FOLDERS ({settings.watchFolders.length})
          </div>
          <div className="space-y-2">
            {settings.watchFolders.map((folder) => (
              <div
                key={folder}
                className="flex items-center gap-3 px-4 py-3 bg-winamp-panel border border-winamp-border group"
              >
                <FolderOpen size={16} className="text-winamp-accent-muted flex-shrink-0" />
                <span className="text-sm text-winamp-bar font-mono truncate flex-1">
                  {folder}
                </span>
                <button
                  onClick={() => removeFolder(folder)}
                  className="p-2 text-winamp-accent-muted hover:text-red-400 transition-colors opacity-70 group-hover:opacity-100"
                  aria-label="Remove folder"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            {settings.watchFolders.length === 0 && (
              <div className="py-16 text-center text-winamp-accent-muted">
                <FolderOpen size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-sm">No folders added yet.</p>
                <p className="text-xs mt-1">Click &quot;Add folder&quot; above to get started.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
