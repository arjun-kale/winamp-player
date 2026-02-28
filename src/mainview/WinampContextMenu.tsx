import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Play, Pause, SkipBack, SkipForward, X } from "lucide-react";

type MenuItem = {
  label: string;
  action: string;
  accelerator?: string;
  icon?: React.ReactNode;
};

type MenuSeparator = { type: "separator" };

const MENU_ITEMS: (MenuItem | MenuSeparator)[] = [
  { label: "Play / Pause", action: "playPause", accelerator: "Space" },
  { label: "Previous Track", action: "prev", accelerator: "Left", icon: <SkipBack size={14} /> },
  { label: "Next Track", action: "next", accelerator: "Right", icon: <SkipForward size={14} /> },
  { type: "separator" },
  { label: "Close", action: "close", accelerator: "Q", icon: <X size={14} /> },
];

type WinampContextMenuProps = {
  x: number;
  y: number;
  isPlaying: boolean;
  onAction: (action: string) => void;
  onClose: () => void;
};

export function WinampContextMenu({
  x,
  y,
  isPlaying,
  onAction,
  onClose,
}: WinampContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const [position, setPosition] = useState({ x, y });

  useLayoutEffect(() => {
    const el = menuRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let adjX = x;
    let adjY = y;
    if (x + rect.width > vw) adjX = vw - rect.width - 8;
    if (y + rect.height > vh) adjY = vh - rect.height - 8;
    if (adjX !== x || adjY !== y) setPosition({ x: adjX, y: adjY });
  }, [x, y]);

  return (
    <div
      ref={menuRef}
      className="fixed z-[9999] min-w-[180px] py-1 rounded-md border border-winamp-border shadow-2xl bg-winamp-panel font-mono text-winamp-text text-sm overflow-hidden"
      style={{ left: position.x, top: position.y }}
    >
      {MENU_ITEMS.map((item, i) => {
        if ("type" in item && item.type === "separator") {
          return (
            <div
              key={`sep-${i}`}
              className="my-1 h-px bg-winamp-border"
              role="separator"
            />
          );
        }
        const menuItem = item as MenuItem;
        return (
          <button
            key={menuItem.action}
            type="button"
            onClick={() => {
              onAction(menuItem.action);
              onClose();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-left text-winamp-bar hover:bg-winamp-hover hover:text-winamp-accent transition-colors"
          >
            {menuItem.action === "playPause" ? (
              isPlaying ? (
                <Pause size={14} />
              ) : (
                <Play size={14} />
              )
            ) : (
              menuItem.icon
            )}
            <span className="flex-1">{menuItem.label}</span>
            {menuItem.accelerator && (
              <span className="text-winamp-muted text-xs">
                {menuItem.accelerator}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
