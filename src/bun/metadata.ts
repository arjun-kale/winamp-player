import path from "path";
import { parseFile } from "music-metadata";
import { AUDIO_EXTENSIONS } from "../shared/constants";

const metadataCache = new Map<string, TrackMetadata>();

export interface TrackMetadata {
  title: string;
  artist: string;
  album: string;
  duration: number;
  genre: string;
  picture?: string;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export async function getTrackMetadata(filePath: string): Promise<TrackMetadata | null> {
  const cached = metadataCache.get(filePath);
  if (cached) return cached;

  const ext = path.extname(filePath).toLowerCase();
  if (!AUDIO_EXTENSIONS.has(ext)) return null;

  try {
    const metadata = await parseFile(filePath, { duration: true });

    const duration = metadata.format.duration ?? 0;
    const common = metadata.common;
    const picture = common.picture?.[0];

    const result: TrackMetadata = {
      title: common.title ?? path.basename(filePath, ext),
      artist: common.artist ?? "Unknown Artist",
      album: common.album ?? "Unknown Album",
      duration,
      genre: common.genre?.[0] ?? "Unknown",
      picture: picture
        ? `data:${picture.format};base64,${picture.data.toString("base64")}`
        : undefined,
    };

    metadataCache.set(filePath, result);
    return result;
  } catch {
    return null;
  }
}

export function formatMetadataTime(metadata: TrackMetadata): string {
  return formatDuration(metadata.duration);
}
