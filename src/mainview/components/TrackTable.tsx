import type { Track } from "../types";
import { TrackRow } from "./TrackRow";

type TrackTableProps = {
  tracks: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  onTrackClick: (track: Track, queue: Track[]) => void;
};

export function TrackTable({ tracks, currentTrack, isPlaying, onTrackClick }: TrackTableProps) {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="w-full text-left border-collapse">
        <div className="sticky top-0 bg-winamp-bg border-b border-winamp-border z-10 flex px-8 py-3 text-xs text-winamp-accent-muted tracking-widest">
          <div className="w-12">#</div>
          <div className="flex-1">TITLE</div>
          <div className="flex-1">ARTIST</div>
          <div className="flex-1 hidden md:block">ALBUM</div>
          <div className="w-16 text-right">TIME</div>
        </div>

        <div className="pb-4">
          {tracks.map((track, i) => (
            <TrackRow
              key={`${track.id}-${i}`}
              track={track}
              index={i}
              isActive={track.id === currentTrack?.id}
              isPlaying={isPlaying}
              onClick={() => onTrackClick(track, tracks)}
            />
          ))}
          {tracks.length === 0 && (
            <div className="px-8 py-12 text-center text-winamp-accent-muted">NO TRACKS MATCHING PROTOCOL.</div>
          )}
        </div>
      </div>
    </div>
  );
}
