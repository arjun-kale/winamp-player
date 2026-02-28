import { create } from "zustand";
import type { Track, Playlist } from "../types";

const CONCURRENCY = 10;

function hashPath(p: string): string {
  let h = 0;
  for (let i = 0; i < p.length; i++) {
    h = (h << 5) - h + p.charCodeAt(i);
    h |= 0;
  }
  return `t_${Math.abs(h).toString(36)}`;
}

async function pLimit<T, R>(items: T[], fn: (x: T) => Promise<R>): Promise<R[]> {
  const results: R[] = [];
  let idx = 0;

  async function worker(): Promise<void> {
    while (idx < items.length) {
      const i = idx++;
      const res = await fn(items[i]);
      results[i] = res;
    }
  }

  const workers = Array.from({ length: Math.min(CONCURRENCY, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

export type WinampRPC = {
  request: {
    getDefaultMusicPath: () => Promise<string>;
    scanFolders: (p: { paths: string[] }) => Promise<{ files: { path: string; ext: string }[] }>;
    getTrackMetadata: (p: { path: string }) => Promise<{
      title: string;
      artist: string;
      album: string;
      duration: number;
      time: string;
      genre: string;
      picture?: string;
    } | null>;
    getPlaybackUrl: (p: { path: string }) => Promise<string>;
    getWatchFolders: () => Promise<string[]>;
    addFolder: (p: { path: string }) => Promise<{ success: boolean; error?: string }>;
    validateFolder: (p: { path: string }) => Promise<{ valid: boolean; resolvedPath?: string; error?: string }>;
    removeFolder: (p: { path: string }) => Promise<void>;
    loadPlaylist: (p: { path: string }) => Promise<{
      name: string;
      path: string;
      entries: { path: string; title?: string }[];
    } | null>;
    savePlaylist: (p: { path: string; name: string; entries: string[] }) => Promise<void>;
    listPlaylists: () => Promise<{
      name: string;
      path: string;
      entries: { path: string; title?: string }[];
    }[]>;
    getPlaylistsDir: () => Promise<string>;
  };
};

interface PlayerState {
  rpc: WinampRPC | null;
  library: { tracks: Track[]; loading: boolean; error: string | null };
  playlists: { items: Playlist[]; activeId: string | null };
  player: {
    currentTrack: Track | null;
    queue: Track[];
    isPlaying: boolean;
    currentTime: number;
    volume: number;
    playbackUrl: string | null;
  };
  settings: { watchFolders: string[] };
  theme: { accentColor: string; palette: string[] };
}

interface PlayerActions {
  setRpc: (rpc: WinampRPC | null) => void;
  loadLibrary: () => Promise<void>;
  addFolder: (path: string) => Promise<void>;
  removeFolder: (path: string) => void;
  playTrack: (track: Track, queue?: Track[] | null) => void;
  togglePlay: () => void;
  handleNext: () => void;
  handlePrev: () => void;
  setCurrentTime: (seconds: number) => void;
  setVolume: (value: number) => void;
  setPlaybackUrl: (url: string | null) => void;
  updateTheme: (accent: string, palette: string[]) => void;
  resetTheme: () => void;
  loadPlaylists: () => Promise<void>;
  setActivePlaylist: (id: string | null) => void;
  createPlaylist: (name: string) => Promise<void>;
  addTrackToPlaylist: (playlistId: string, track: Track) => Promise<void>;
  loadPlaylistTracks: (playlistId: string) => Track[];
  getQueueFromLibrary: () => Track[];
}

const defaultTheme = { accentColor: "#98e0a7", palette: ["#98e0a7", "#71a67d", "#4b7556"] };

export const usePlayerStore = create<PlayerState & PlayerActions>((set, get) => ({
  rpc: null,

  library: { tracks: [], loading: false, error: null },
  playlists: { items: [], activeId: null },
  player: {
    currentTrack: null,
    queue: [],
    isPlaying: false,
    currentTime: 0,
    volume: 0.75,
    playbackUrl: null,
  },
  settings: { watchFolders: [] },
  theme: defaultTheme,

  setRpc: (rpc) => set({ rpc }),

  loadLibrary: async () => {
    const { rpc } = get();
    if (!rpc) return;

    set((s) => ({ library: { ...s.library, loading: true, error: null } }));

    try {
      let folders = await rpc.request.getWatchFolders();
      if (folders.length === 0) {
        const defaultPath = await rpc.request.getDefaultMusicPath();
        const addResult = await rpc.request.addFolder({ path: defaultPath });
        if (!addResult.success) {
          set((s) => ({
            library: {
              tracks: [],
              loading: false,
              error: addResult.error ?? "Could not add folder",
            },
            settings: { watchFolders: [] },
          }));
          return;
        }
        folders = await rpc.request.getWatchFolders();
      }

      const allFolders = folders;
      const { files } = await rpc.request.scanFolders({ paths: allFolders });

      const results = await pLimit(files, async (f) => {
        const meta = await rpc.request.getTrackMetadata({ path: f.path });
        if (!meta) return null;
        return {
          id: hashPath(f.path),
          path: f.path,
          title: meta.title,
          artist: meta.artist,
          album: meta.album,
          time: meta.time,
          genre: meta.genre,
          picture: meta.picture,
        } as Track;
      });

      const tracks = results.filter((t): t is Track => t != null);

      set((s) => ({
        library: { tracks, loading: false, error: null },
        settings: { watchFolders: allFolders },
      }));
    } catch (err) {
      set((s) => ({
        library: {
          ...s.library,
          loading: false,
          error: err instanceof Error ? err.message : "Failed to load library",
        },
      }));
    }
  },

  addFolder: async (folderPath) => {
    const { rpc } = get();
    if (!rpc) {
      set((s) => ({ library: { ...s.library, error: "App not ready. Please try again." } }));
      return;
    }

    const result = await rpc.request.addFolder({ path: folderPath });
    if (!result.success) {
      const msg = result.error ?? "Failed to add folder";
      const hint =
        msg.includes("does not exist") && folderPath.includes("Music")
          ? " Create the Music folder first, or add a different folder."
          : "";
      set((s) => ({
        library: { ...s.library, loading: false, error: msg + hint },
      }));
      return;
    }

    const folders = await rpc.request.getWatchFolders();
    set((s) => ({ settings: { watchFolders: folders }, library: { ...s.library, error: null } }));
    await get().loadLibrary();
  },

  removeFolder: (folderPath) => {
    const { rpc } = get();
    if (!rpc) return;

    rpc.request.removeFolder({ path: folderPath });
    const sep = folderPath.includes("\\") ? "\\" : "/";
    const prefix = folderPath.endsWith(sep) ? folderPath : folderPath + sep;
    set((s) => ({
      settings: {
        watchFolders: s.settings.watchFolders.filter((p) => p !== folderPath),
      },
      library: {
        tracks: s.library.tracks.filter((t) => !t.path.startsWith(prefix)),
        loading: false,
        error: null,
      },
    }));
  },

  playTrack: (track, queue = null) => {
    const q = queue ?? get().player.queue;
    set({
      player: {
        ...get().player,
        currentTrack: track,
        queue: q,
        isPlaying: true,
        currentTime: 0,
      },
    });
  },

  togglePlay: () => set((s) => ({ player: { ...s.player, isPlaying: !s.player.isPlaying } })),

  handleNext: () => {
    const { queue, currentTrack } = get().player;
    if (queue.length === 0) return;
    const idx = queue.findIndex((t) => t.id === currentTrack?.id);
    const next = idx >= 0 && idx < queue.length - 1 ? queue[idx + 1] : queue[0];
    if (next) get().playTrack(next, queue);
  },

  handlePrev: () => {
    const { queue, currentTrack } = get().player;
    if (queue.length === 0) return;
    const idx = queue.findIndex((t) => t.id === currentTrack?.id);
    const prev = idx > 0 ? queue[idx - 1] : queue[queue.length - 1];
    if (prev) get().playTrack(prev, queue);
  },

  setCurrentTime: (seconds) =>
    set((s) => ({ player: { ...s.player, currentTime: seconds } })),

  setVolume: (value) =>
    set((s) => ({ player: { ...s.player, volume: Math.max(0, Math.min(1, value)) } })),

  setPlaybackUrl: (url) => set((s) => ({ player: { ...s.player, playbackUrl: url } })),

  updateTheme: (accentColor, palette) => set({ theme: { accentColor, palette } }),

  resetTheme: () => set({ theme: defaultTheme }),

  loadPlaylists: async () => {
    const { rpc } = get();
    if (!rpc) return;

    const list = await rpc.request.listPlaylists();
    const items: Playlist[] = list.map((pl, i) => ({
      id: `pl_${i}_${pl.path}`,
      name: pl.name,
      path: pl.path,
      trackIds: pl.entries.map((e) => e.path),
    }));
    set((s) => ({ playlists: { ...s.playlists, items } }));
  },

  setActivePlaylist: (id) => set((s) => ({ playlists: { ...s.playlists, activeId: id } })),

  createPlaylist: async (name) => {
    const { rpc } = get();
    if (!rpc) return;

    const dir = await rpc.request.getPlaylistsDir();
    await rpc.request.savePlaylist({
      path: dir,
      name,
      entries: [],
    });
    await get().loadPlaylists();
  },

  addTrackToPlaylist: async (playlistId, track) => {
    const { rpc, playlists } = get();
    if (!rpc) return;

    const pl = playlists.items.find((p) => p.id === playlistId);
    if (!pl) return;

    const entries = [...pl.trackIds, track.path];
    const dir = pl.path.replace(/[/\\][^/\\]+$/, "");
    const name = pl.name.replace(/\.m3u8?$/, "");
    await rpc.request.savePlaylist({ path: dir, name, entries });
    await get().loadPlaylists();
  },

  loadPlaylistTracks: (playlistId) => {
    const { playlists, library } = get();
    const pl = playlists.items.find((p) => p.id === playlistId);
    if (!pl) return [];
    const pathMap = new Map(library.tracks.map((t) => [t.path, t]));
    return pl.trackIds.map((p) => pathMap.get(p)).filter((t): t is Track => t != null);
  },

  getQueueFromLibrary: () => get().library.tracks,
}));
