import type { Track } from "../types";

type TrackRowProps = {
  track: Track;
  index: number;
  isActive: boolean;
  isPlaying: boolean;
  onClick: () => void;
};

export function TrackRow({ track, index, isActive, isPlaying, onClick }: TrackRowProps) {
  return (
    <div
      onClick={onClick}
      className={`flex px-8 py-3 text-sm group transition-colors border-b border-winamp-border/30 cursor-pointer ${
        isActive ? "bg-winamp-hover text-winamp-accent" : "text-winamp-text hover:bg-winamp-panel-alt hover:text-winamp-bar"
      }`}
    >
      <div className="w-12 flex items-center">
        {isActive ? (
          <div className="flex gap-0.5 items-end h-3">
            <div
              className="w-0.5 bg-winamp-accent visualizer-bar"
              style={{
                animationDelay: "0s",
                animationDuration: "0.8s",
                animationPlayState: isPlaying ? "running" : "paused",
              }}
            />
            <div
              className="w-0.5 bg-winamp-accent visualizer-bar"
              style={{
                animationDelay: "-0.2s",
                animationDuration: "0.6s",
                animationPlayState: isPlaying ? "running" : "paused",
              }}
            />
            <div
              className="w-0.5 bg-winamp-accent visualizer-bar"
              style={{
                animationDelay: "-0.4s",
                animationDuration: "0.9s",
                animationPlayState: isPlaying ? "running" : "paused",
              }}
            />
          </div>
        ) : (
          <span className="text-winamp-accent-muted">{(index + 1).toString().padStart(2, "0")}</span>
        )}
      </div>
      <div className="flex-1 flex items-center">{track.title}</div>
      <div className="flex-1 flex items-center">{track.artist}</div>
      <div className="flex-1 hidden md:flex items-center text-winamp-accent-muted group-hover:text-winamp-text">
        {track.album}
      </div>
      <div className="w-16 text-right flex items-center justify-end">{track.time}</div>
    </div>
  );
}
