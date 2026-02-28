import { formatTime } from "../utils";

type ScrubberProps = {
  value: number;
  max: number;
  currentLabel?: string;
  maxLabel?: string;
  onChange: (value: number) => void;
};

export function Scrubber({ value, max, currentLabel, maxLabel, onChange }: ScrubberProps) {
  const percent = max > 0 ? (value / max) * 100 : 0;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    onChange(Math.max(0, Math.min(max, pct * max)));
  };

  return (
    <div className="w-full flex items-center gap-4 text-xs text-winamp-text">
      <span className="w-10 text-right">{currentLabel ?? formatTime(value)}</span>
      <div
        className="flex-1 h-1.5 bg-winamp-border relative rounded-full cursor-pointer group"
        onClick={handleClick}
      >
        <div
          className="absolute top-0 left-0 h-full bg-winamp-accent-muted group-hover:bg-winamp-bar rounded-full transition-colors"
          style={{ width: `${percent}%` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 -ml-2 w-4 h-4 bg-winamp-bar group-hover:bg-winamp-accent rounded-full shadow-[0_0_8px_rgba(113,166,125,0.4)] transition-colors pointer-events-none"
          style={{ left: `${percent}%` }}
        />
      </div>
      <span className="w-10">{maxLabel ?? formatTime(max)}</span>
    </div>
  );
}
