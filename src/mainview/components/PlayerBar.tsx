import { Shuffle, Repeat, SkipBack, SkipForward, Minimize2 } from "lucide-react";
import type { Track } from "../types";
import { parseTime } from "../utils";
import { Scrubber } from "./Scrubber";
import { VolumeSlider } from "./VolumeSlider";
import { PlayPauseButton } from "./PlayPauseButton";

type PlayerBarProps = {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTimeMs: number;
  volume: number;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onScrubberChange: (seconds: number) => void;
  onVolumeChange: (value: number) => void;
  onToggleMini?: () => void;
};

export function PlayerBar({
  currentTrack,
  isPlaying,
  currentTimeMs,
  volume,
  onPlayPause,
  onNext,
  onPrev,
  onScrubberChange,
  onVolumeChange,
  onToggleMini,
}: PlayerBarProps) {
  const totalCurrentSecs = currentTrack ? parseTime(currentTrack.time) : 0;

  return (
    <div className="h-28 bg-winamp-panel border-t border-winamp-border flex flex-col shrink-0">
      <div className="flex-1 flex items-center justify-between px-6">
        <div className="w-1/4 flex items-center gap-4">
          {currentTrack && (
            <>
              {currentTrack.picture && (
                <img
                  src={currentTrack.picture}
                  alt=""
                  className="w-12 h-12 object-cover border border-winamp-border flex-shrink-0"
                />
              )}
              <div>
                <div className="text-lg font-bold text-winamp-accent mb-1 leading-none">{currentTrack.title}</div>
                <div className="text-sm text-winamp-accent-muted leading-none">{currentTrack.artist}</div>
              </div>
            </>
          )}
        </div>

        <div className="w-2/4 flex flex-col items-center justify-center gap-2 max-w-2xl">
          <Scrubber
            value={currentTimeMs}
            max={totalCurrentSecs}
            maxLabel={currentTrack?.time ?? "0:00"}
            onChange={onScrubberChange}
          />
          <div className="flex items-center gap-6 mt-1">
            <Shuffle size={16} className="text-winamp-accent-muted hover:text-winamp-accent cursor-pointer transition-colors" />
            <SkipBack
              onClick={onPrev}
              size={20}
              className="text-winamp-bar hover:text-winamp-accent cursor-pointer fill-current transition-colors"
            />
            <PlayPauseButton isPlaying={isPlaying} onToggle={onPlayPause} />
            <SkipForward
              onClick={onNext}
              size={20}
              className="text-winamp-bar hover:text-winamp-accent cursor-pointer fill-current transition-colors"
            />
            <Repeat size={16} className="text-winamp-accent-muted hover:text-winamp-accent cursor-pointer transition-colors" />
          </div>
        </div>

        <div className="w-1/4 flex items-center justify-end gap-6">
          <VolumeSlider value={volume} onChange={onVolumeChange} />
          <button
            type="button"
            onClick={onToggleMini}
            aria-label="Open mini player"
            className="text-winamp-accent-muted hover:text-winamp-accent cursor-pointer transition-colors"
          >
            <Minimize2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
