import { Volume2 } from "lucide-react";

type VolumeSliderProps = {
  value: number;
  onChange: (value: number) => void;
};

export function VolumeSlider({ value, onChange }: VolumeSliderProps) {
  const percent = Math.max(0, Math.min(1, value)) * 100;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    onChange(Math.max(0, Math.min(1, pct)));
  };

  return (
    <div className="flex items-center gap-3 w-32">
      <Volume2 size={18} className="text-winamp-text" />
      <div
        className="flex-1 h-1 bg-winamp-border relative rounded-full cursor-pointer group"
        onClick={handleClick}
      >
        <div
          className="absolute top-0 left-0 h-full bg-winamp-text group-hover:bg-winamp-accent rounded-full transition-colors"
          style={{ width: `${percent}%` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 -ml-2 w-3 h-3 bg-winamp-bar group-hover:bg-winamp-accent rounded-full transition-colors pointer-events-none"
          style={{ left: `${percent}%` }}
        />
      </div>
    </div>
  );
}
