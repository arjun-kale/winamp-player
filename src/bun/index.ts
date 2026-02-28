import path from "path";
import fs from "fs";
import Electrobun, { BrowserWindow, BrowserView, ContextMenu } from "electrobun/bun";
import type { WinampRPCSchema } from "../shared/rpc-types";
import { getDefaultMusicPath } from "./paths";
import { scanFolders } from "./scanner";
import { getTrackMetadata, formatMetadataTime } from "./metadata";
import { startAudioServer, setAllowedPaths, getAudioServerPort } from "./audioServer";
import { loadPlaylist, savePlaylist, listPlaylists } from "./playlists";
import { loadSettings, saveSettings } from "./settings";
import { PLAYLISTS_DIR } from "./paths";

let mainWindow: InstanceType<typeof BrowserWindow>;
let winampRpc: ReturnType<typeof BrowserView.defineRPC<WinampRPCSchema>>;

async function init(): Promise<void> {
  await startAudioServer();
  const settings = loadSettings();
  if (settings.watchFolders.length > 0) {
    setAllowedPaths(settings.watchFolders);
  }
}

const rpc = BrowserView.defineRPC<WinampRPCSchema>({
  handlers: {
    requests: {
      getDefaultMusicPath: () => getDefaultMusicPath(),

      scanFolders: ({ paths }) => {
        const files = scanFolders(paths);
        return { files };
      },

      getTrackMetadata: async ({ path: filePath }) => {
        const meta = await getTrackMetadata(filePath);
        if (!meta) return null;
        return {
          title: meta.title,
          artist: meta.artist,
          album: meta.album,
          duration: meta.duration,
          time: formatMetadataTime(meta),
          genre: meta.genre,
          picture: meta.picture,
        };
      },

      getPlaybackUrl: ({ path: filePath }) => {
        const port = getAudioServerPort();
        const encoded = encodeURIComponent(filePath);
        return `http://127.0.0.1:${port}/play?path=${encoded}`;
      },

      getWatchFolders: () => loadSettings().watchFolders,

      addFolder: ({ path: folderPath }) => {
        const resolved = path.resolve(folderPath.trim());
        if (!fs.existsSync(resolved)) {
          return { success: false, error: "Folder does not exist" };
        }
        if (!fs.statSync(resolved).isDirectory()) {
          return { success: false, error: "Path is not a folder" };
        }
        const settings = loadSettings();
        const normalized = path.normalize(resolved);
        const alreadyExists = settings.watchFolders.some(
          (p) => path.normalize(p) === normalized
        );
        if (!alreadyExists) {
          settings.watchFolders.push(normalized);
          saveSettings(settings);
          setAllowedPaths(settings.watchFolders);
        }
        return { success: true };
      },

      validateFolder: ({ path: folderPath }) => {
        try {
          const resolved = path.resolve(folderPath.trim());
          if (!fs.existsSync(resolved)) {
            return { valid: false, error: "Path does not exist" };
          }
          if (!fs.statSync(resolved).isDirectory()) {
            return { valid: false, error: "Path is not a folder" };
          }
          return { valid: true, resolvedPath: path.normalize(resolved) };
        } catch (err) {
          return {
            valid: false,
            error: err instanceof Error ? err.message : "Invalid path",
          };
        }
      },

      removeFolder: ({ path: folderPath }) => {
        const settings = loadSettings();
        settings.watchFolders = settings.watchFolders.filter((p) => p !== folderPath);
        saveSettings(settings);
        setAllowedPaths(settings.watchFolders);
      },

      loadPlaylist: ({ path: filePath }) => {
        const pl = loadPlaylist(filePath);
        if (!pl) return null;
        return {
          name: pl.name,
          path: pl.path,
          entries: pl.entries,
        };
      },

      savePlaylist: ({ path: targetPath, name, entries }) => {
        savePlaylist(targetPath, name, entries);
      },

      listPlaylists: () => {
        const list = listPlaylists();
        return list.map((pl) => ({
          name: pl.name,
          path: pl.path,
          entries: pl.entries,
        }));
      },

      getPlaylistsDir: () => PLAYLISTS_DIR,

      importPlaylist: ({ path: filePath }) => {
        const pl = loadPlaylist(filePath);
        if (!pl) return false;
        savePlaylist(PLAYLISTS_DIR, pl.name, pl.entries.map((e) => e.path));
        return true;
      },

      exportPlaylist: ({ name, entries }) => {
        savePlaylist(PLAYLISTS_DIR, name, entries);
        return path.join(PLAYLISTS_DIR, `${name}.m3u8`);
      },
    },
    messages: {
      resizeWindow: ({ width, height }) => {
        mainWindow.setSize(width, height);
      },
      closeWindow: () => mainWindow.close(),
      minimizeWindow: () => mainWindow.minimize(),
      maximizeWindow: () => {
        if (mainWindow.isMaximized()) {
          mainWindow.unmaximize();
        } else {
          mainWindow.maximize();
        }
      },
      showContextMenu: () => {
        ContextMenu.showContextMenu([
          { label: "Play / Pause", action: "playPause", accelerator: " " },
          { label: "Previous Track", action: "prev", accelerator: "Left" },
          { label: "Next Track", action: "next", accelerator: "Right" },
          { type: "separator" },
          { label: "Close", action: "close", accelerator: "q" },
        ]);
      },
    },
  },
});
winampRpc = rpc;

Electrobun.events.on("context-menu-clicked", (e: { data?: { action?: string } }) => {
  const action = e?.data?.action;
  if (action) {
    winampRpc.send.contextMenuAction({ action });
  }
});

await init();

mainWindow = new BrowserWindow({
  title: "Winamp Player",
  url: "views://mainview/index.html",
  frame: {
    width: 1200,
    height: 800,
    x: 100,
    y: 100,
  },
  titleBarStyle: "hidden",
  rpc,
});

console.log("Winamp Player started!");
