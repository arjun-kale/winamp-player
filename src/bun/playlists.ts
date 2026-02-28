import path from "path";
import fs from "fs";
import { PLAYLISTS_DIR } from "./paths";
import { ensureAppDataDirs } from "./paths";

export interface PlaylistEntry {
  path: string;
  title?: string;
}

export interface Playlist {
  name: string;
  path: string;
  entries: PlaylistEntry[];
}

function parseM3U(content: string, baseDir: string): PlaylistEntry[] {
  const entries: PlaylistEntry[] = [];
  const lines = content.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  let currentTitle: string | undefined;

  for (const line of lines) {
    if (line.startsWith("#EXTINF:")) {
      const match = line.match(/^#EXTINF:\d+,(.+)$/);
      currentTitle = match?.[1]?.trim();
      continue;
    }

    if (line.startsWith("#")) continue;

    let filePath = line;
    if (!path.isAbsolute(line)) {
      filePath = path.resolve(baseDir, line);
    }
    entries.push({ path: filePath, title: currentTitle });
    currentTitle = undefined;
  }

  return entries;
}

function parsePLS(content: string, baseDir: string): PlaylistEntry[] {
  const entries: PlaylistEntry[] = [];
  const lines = content.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  const files: string[] = [];
  const titles: string[] = [];

  for (const line of lines) {
    const fileMatch = line.match(/^File(\d+)=(.+)$/i);
    if (fileMatch) {
      const idx = parseInt(fileMatch[1], 10) - 1;
      let p = fileMatch[2].trim();
      if (!path.isAbsolute(p)) p = path.resolve(baseDir, p);
      files[idx] = p;
    }
    const titleMatch = line.match(/^Title(\d+)=(.+)$/i);
    if (titleMatch) {
      const idx = parseInt(titleMatch[1], 10) - 1;
      titles[idx] = titleMatch[2].trim();
    }
  }

  for (let i = 0; i < files.length; i++) {
    if (files[i]) {
      entries.push({ path: files[i], title: titles[i] });
    }
  }

  return entries;
}

export function loadPlaylist(filePath: string): Playlist | null {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const ext = path.extname(filePath).toLowerCase();
    const baseDir = path.dirname(filePath);
    const name = path.basename(filePath, ext);

    let entries: PlaylistEntry[];
    if (ext === ".pls") {
      entries = parsePLS(content, baseDir);
    } else {
      entries = parseM3U(content, baseDir);
    }

    return { name, path: filePath, entries };
  } catch {
    return null;
  }
}

export function savePlaylist(
  targetPath: string,
  name: string,
  entries: string[]
): void {
  ensureAppDataDirs();

  const lines: string[] = ["#EXTM3U"];
  for (const p of entries) {
    const basename = path.basename(p);
    lines.push(`#EXTINF:0,${basename}`);
    lines.push(p);
  }

  const filePath = path.join(targetPath, `${name}.m3u8`);
  fs.writeFileSync(filePath, lines.join("\n"), "utf-8");
}

export function listPlaylists(): Playlist[] {
  ensureAppDataDirs();

  try {
    const files = fs.readdirSync(PLAYLISTS_DIR);
    const playlists: Playlist[] = [];

    for (const f of files) {
      if (!f.endsWith(".m3u8") && !f.endsWith(".m3u")) continue;
      const fullPath = path.join(PLAYLISTS_DIR, f);
      const pl = loadPlaylist(fullPath);
      if (pl) playlists.push(pl);
    }

    return playlists;
  } catch {
    return [];
  }
}
