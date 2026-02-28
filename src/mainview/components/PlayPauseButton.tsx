import { Play, Pause } from "lucide-react";

type PlayPauseButtonProps = {
  isPlaying: boolean;
  onToggle: () => void;
};

export function PlayPauseButton({ isPlaying, onToggle }: PlayPauseButtonProps) {
  return (
    <div
      className="w-10 h-10 rounded-full border border-winamp-border flex items-center justify-center cursor-pointer hover:border-winamp-bar hover:bg-winamp-hover transition-all text-winamp-accent"
      onClick={onToggle}
    >
      {isPlaying ? (
        <Pause size={20} className="fill-current" />
      ) : (
        <Play size={20} className="fill-current ml-1" />
      )}
    </div>
  );
}
