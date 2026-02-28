import { useState } from "react";
import { Volume2 } from "lucide-react";
import type { Track } from "../types";
import { TrackContextMenu } from "./TrackContextMenu";

type TrackRowProps = {
  track: Track;
  index: number;
  isActive: boolean;
  isPlaying: boolean;
  onClick: () => void;
};

export function TrackRow({ track, index, isActive, isPlaying, onClick }: TrackRowProps) {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  return (
    <>
      <div
        onClick={onClick}
        onContextMenu={(e) => {
          e.preventDefault();
          setContextMenu({ x: e.clientX, y: e.clientY });
        }}
      className={`flex px-8 py-3 text-sm group transition-colors border-b border-winamp-border/30 cursor-pointer ${
        isActive ? "bg-winamp-hover text-winamp-accent" : "text-winamp-text hover:bg-winamp-panel-alt hover:text-winamp-bar"
      }`}
    >
      <div className="w-12 flex items-center">
        {isActive ? (
          <Volume2 size={14} className={isPlaying ? "animate-pulse" : ""} />
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
    {contextMenu && (
      <TrackContextMenu
        x={contextMenu.x}
        y={contextMenu.y}
        track={track}
        onClose={() => setContextMenu(null)}
      />
    )}
    {contextMenu && (
      <div
        className="fixed inset-0 z-40"
        onClick={() => setContextMenu(null)}
        aria-hidden
      />
    )}
    </>
  );
}
