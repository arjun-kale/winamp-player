import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { WinampContextMenu } from "./WinampContextMenu";
import {
  Music,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  ListMusic,
  VolumeX,
  ArrowDownToLine,
  FoldVertical,
  Minus,
  Square,
  X,
} from "lucide-react";
import { formatTime } from "./utils";

type MiniSong = { id: number; title: string; artist: string; duration: number };

type WinampElectrobun = {
  rpc?: {
    send?: {
      resizeWindow: (p: { width: number; height: number }) => void;
      closeWindow: () => void;
      minimizeWindow: () => void;
      maximizeWindow: () => void;
    };
  };
};

type MiniPlayerProps = {
  electrobun: WinampElectrobun;
  onShade?: () => void;
  onExpandToMain?: () => void;
};

const LOFI_SONGS: MiniSong[] = [
  { id: 1, title: "Morning Coffee", artist: "Lofi Girl", duration: 145 },
  { id: 2, title: "City Lights", artist: "Kudasai", duration: 180 },
  { id: 3, title: "Late Night Drive", artist: "WYS", duration: 160 },
  { id: 4, title: "Aqua", artist: "92elm", duration: 138 },
  { id: 5, title: "Aura", artist: "Tatami", duration: 138 },
  { id: 6, title: "Between Dreams", artist: "Prigida", duration: 93 },
  { id: 7, title: "Birds", artist: "Qube", duration: 125 },
  { id: 8, title: "Borrowed Perspective", artist: "Genuine Colour", duration: 309 },
  { id: 9, title: "Cali Sunset", artist: "Richard Smithson", duration: 204 },
  { id: 10, title: "Calm River", artist: "Dope Cat", duration: 162 },
];

const ROCK_SONGS: MiniSong[] = [
  { id: 11, title: "Desert Sand", artist: "The Nomads", duration: 210 },
  { id: 12, title: "Electric Pulse", artist: "Neon Knights", duration: 185 },
];

const ACOUSTIC_SONGS: MiniSong[] = [
  { id: 13, title: "Morning Dew", artist: "Sarah Jenkins", duration: 195 },
  { id: 14, title: "Fireside", artist: "The Woodsmen", duration: 240 },
];

const TABS = {
  LOFI: LOFI_SONGS,
  ROCK: ROCK_SONGS,
  ACOUSTIC: ACOUSTIC_SONGS,
} as const;

const BASE_EQ_CURVE = [
  90, 85, 80, 70, 60, 40, 35, 30, 35, 30, 35, 30, 25, 20, 15, 10, 8, 6, 5, 4, 3,
  2, 2, 2,
];

const MIN_WIDTH = 380;
const MIN_HEIGHT = 400;

function useResizeToContent(
  electrobun: WinampElectrobun,
  enabled: boolean,
  contentKey: number
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const reportSize = useCallback(
    (w: number, h: number) => {
      electrobun.rpc?.send?.resizeWindow?.({
        width: Math.max(MIN_WIDTH, Math.round(w)),
        height: Math.max(MIN_HEIGHT, Math.round(h)),
      });
    },
    [electrobun]
  );

  const measure = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const w = el.scrollWidth || el.clientWidth;
    const h = el.scrollHeight || el.clientHeight;
    if (w > 0 && h > 0) reportSize(w, h);
  }, [reportSize]);

  useEffect(() => {
    if (!enabled || !containerRef.current) return;
    const el = containerRef.current;
    const schedule = () => {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(measure, 50);
    };
    const ro = new ResizeObserver(schedule);
    ro.observe(el);
    measure();
    requestAnimationFrame(() => setTimeout(measure, 0));
    return () => {
      ro.disconnect();
      clearTimeout(debounceRef.current);
    };
  }, [enabled, measure, contentKey]);

  return containerRef;
}

export function MiniPlayer({ electrobun, onShade, onExpandToMain }: MiniPlayerProps) {
  const send = electrobun.rpc?.send;
  const [activeTab, setActiveTab] = useState<keyof typeof TABS>("LOFI");
  const [activeSongId, setActiveSongId] = useState(9);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(15);
  const [volume, setVolume] = useState(0.7);
  const [eqValues, setEqValues] = useState<number[]>(BASE_EQ_CURVE);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  const currentSongs = TABS[activeTab];
  const activeSong =
    Object.values(TABS)
      .flat()
      .find((s) => s.id === activeSongId) || LOFI_SONGS[5];

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= activeSong.duration) {
            setIsPlaying(false);
            return activeSong.duration;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, activeSong.duration]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying) {
      interval = setInterval(() => {
        setEqValues((prev) =>
          prev.map((_, i) => {
            const max = BASE_EQ_CURVE[i];
            const min = max * 0.4;
            return Math.random() * (max - min) + min;
          })
        );
      }, 150);
    } else {
      setEqValues(BASE_EQ_CURVE);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handlePlayPause = () => setIsPlaying((prev) => !prev);

  const handleNext = () => {
    const currentIndex = currentSongs.findIndex((s) => s.id === activeSongId);
    if (currentIndex !== -1 && currentIndex < currentSongs.length - 1) {
      setActiveSongId(currentSongs[currentIndex + 1].id);
      setCurrentTime(0);
      setIsPlaying(true);
    }
  };

  const handlePrev = () => {
    const currentIndex = currentSongs.findIndex((s) => s.id === activeSongId);
    if (currentIndex > 0) {
      setActiveSongId(currentSongs[currentIndex - 1].id);
      setCurrentTime(0);
      setIsPlaying(true);
    } else if (currentTime > 3) {
      setCurrentTime(0);
    }
  };

  const handleSongClick = (songId: number) => {
    if (songId === activeSongId) {
      handlePlayPause();
    } else {
      setActiveSongId(songId);
      setCurrentTime(0);
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    const handler = (e: CustomEvent<{ x: number; y: number }>) => {
      setContextMenu({ x: e.detail.x, y: e.detail.y });
    };
    const wrapped = (e: Event) => handler(e as CustomEvent<{ x: number; y: number }>);
    document.addEventListener("winamp-show-context-menu", wrapped);
    return () => document.removeEventListener("winamp-show-context-menu", wrapped);
  }, []);

  const handleContextMenuAction = useCallback((action: string) => {
    document.dispatchEvent(new CustomEvent("winamp-context-action", { detail: action }));
  }, []);

  useEffect(() => {
    const handler = (e: CustomEvent<string>) => {
      switch (e.detail) {
        case "playPause":
          handlePlayPause();
          break;
        case "prev":
          handlePrev();
          break;
        case "next":
          handleNext();
          break;
        case "close":
          send?.closeWindow?.();
          break;
      }
    };
    const wrapped = (e: Event) => handler(e as CustomEvent<string>);
    document.addEventListener("winamp-context-action", wrapped);
    return () => document.removeEventListener("winamp-context-action", wrapped);
  }, [isPlaying, send]);

  const contentKey = currentSongs.length * 10 + activeTab.length;
  const containerRef = useResizeToContent(electrobun, true, contentKey);

  return (
    <div
      ref={containerRef}
      className="min-w-[380px] w-[380px] bg-winamp-panel rounded-md border border-winamp-border shadow-2xl overflow-hidden flex flex-col font-mono text-winamp-bar select-none"
    >
      <div className="flex items-center justify-between px-2 py-2 border-b border-winamp-border electrobun-webkit-app-region-drag">
        <div className="electrobun-webkit-app-region-no-drag flex items-center gap-1">
          <button
            onClick={() => send?.closeWindow?.()}
            className="p-1 rounded text-winamp-accent-muted hover:text-winamp-accent hover:bg-winamp-border/50 transition-colors"
            aria-label="Close"
          >
            <X size={12} />
          </button>
          <button
            onClick={() => send?.minimizeWindow?.()}
            className="p-1 rounded text-winamp-accent-muted hover:text-winamp-accent hover:bg-winamp-border/50 transition-colors"
            aria-label="Minimize"
          >
            <Minus size={12} />
          </button>
          <button
            onClick={() => onExpandToMain?.() ?? send?.maximizeWindow?.()}
            className="p-1 rounded text-winamp-accent-muted hover:text-winamp-accent hover:bg-winamp-border/50 transition-colors"
            aria-label="Maximize"
          >
            <Square size={12} />
          </button>
        </div>
        <div className="flex items-center gap-2 flex-1 justify-center">
          <Music size={14} className="text-winamp-bar" />
          <span className="text-xs tracking-widest font-bold">WINAMP</span>
        </div>
        <button
          onClick={onShade}
          className="electrobun-webkit-app-region-no-drag text-winamp-accent-muted hover:text-winamp-bar transition-colors p-1"
          aria-label="Shade"
        >
          <ArrowDownToLine size={14} />
        </button>
      </div>

      <div className="p-4 border-b border-winamp-border">
        <div className="flex items-end gap-[2px] h-16 mb-5">
          {eqValues.map((val, i) => (
            <div
              key={i}
              className="flex-1 bg-winamp-bar transition-all duration-150 ease-in-out"
              style={{ height: `${val}%`, minHeight: "2px" }}
            />
          ))}
        </div>

        <div className="mb-5">
          <h2 className="text-lg font-bold text-winamp-accent mb-1">{activeSong.title}</h2>
          <p className="text-sm text-winamp-accent-muted">{activeSong.artist}</p>
        </div>

        <div className="flex items-center gap-3 mb-5 text-xs text-winamp-accent-muted">
          <span className="w-10 text-right">{formatTime(currentTime)}</span>
          <div
            className="flex-1 relative h-1 bg-winamp-border rounded-full cursor-pointer group"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              setCurrentTime((x / rect.width) * activeSong.duration);
            }}
          >
            <div
              className="absolute top-0 left-0 h-full bg-winamp-accent-muted rounded-full"
              style={{ width: `${(currentTime / activeSong.duration) * 100}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-winamp-accent-muted rounded-full shadow transition-transform group-hover:scale-125"
              style={{
                left: `calc(${(currentTime / activeSong.duration) * 100}% - 5px)`,
              }}
            />
          </div>
          <span className="w-10">{formatTime(activeSong.duration)}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handlePrev}
              className="text-winamp-accent-muted hover:text-winamp-bar transition-colors"
            >
              <SkipBack size={18} fill="currentColor" />
            </button>
            <button
              onClick={handlePlayPause}
              className="text-winamp-bar hover:text-winamp-accent transition-colors"
            >
              {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
            </button>
            <button
              onClick={handleNext}
              className="text-winamp-accent-muted hover:text-winamp-bar transition-colors"
            >
              <SkipForward size={18} fill="currentColor" />
            </button>
          </div>

          <div className="flex items-center gap-2 w-24">
            <button
              onClick={() => setVolume(volume === 0 ? 0.7 : 0)}
              className="text-winamp-accent-muted hover:text-winamp-bar transition-colors"
            >
              {volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <div
              className="flex-1 relative h-1 bg-winamp-border rounded-full cursor-pointer group"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                setVolume(Math.max(0, Math.min(1, x / rect.width)));
              }}
            >
              <div
                className="absolute top-0 left-0 h-full bg-winamp-accent-muted rounded-full"
                style={{ width: `${volume * 100}%` }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-winamp-accent-muted rounded-full shadow transition-transform group-hover:scale-125"
                style={{ left: `calc(${volume * 100}% - 5px)` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col flex-1 h-[300px]">
        <div className="flex items-center justify-between px-4 py-3 border-b border-winamp-border">
          <div className="flex items-center gap-2">
            <ListMusic size={14} className="text-winamp-accent-muted" />
            <span className="text-xs tracking-widest text-winamp-accent-muted font-bold">PLAYLIST</span>
          </div>
          <button className="text-winamp-accent-muted hover:text-winamp-bar transition-colors">
            <FoldVertical size={14} />
          </button>
        </div>

        <div className="flex px-4 pt-3 gap-6 border-b border-winamp-border">
          {(Object.keys(TABS) as (keyof typeof TABS)[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 text-xs tracking-wider transition-colors border-b-2 ${
                activeTab === tab
                  ? "text-winamp-bar border-winamp-bar"
                  : "text-winamp-accent-muted border-transparent hover:text-winamp-bar"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {currentSongs.map((song) => {
            const isActive = song.id === activeSongId;
            return (
              <div
                key={song.id}
                onClick={() => handleSongClick(song.id)}
                className={`flex items-center justify-between p-2 rounded cursor-pointer group transition-colors ${
                  isActive ? "bg-winamp-hover" : "hover:bg-winamp-panel-alt"
                }`}
              >
                <div className="flex items-center gap-4">
                  <span
                    className={`w-4 text-xs text-right ${
                      isActive ? "text-winamp-bar" : "text-winamp-accent-muted"
                    }`}
                  >
                    {isActive ? (
                      <Volume2 size={14} className={isPlaying ? "animate-pulse" : ""} />
                    ) : (
                      song.id
                    )}
                  </span>
                  <span
                    className={`text-sm ${
                      isActive ? "text-winamp-accent" : "text-winamp-bar group-hover:text-winamp-bar"
                    }`}
                  >
                    {song.title}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-winamp-accent-muted">
                  <span className="truncate max-w-[120px]">{song.artist}</span>
                  <span>{formatTime(song.duration)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {contextMenu &&
        createPortal(
          <WinampContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            isPlaying={isPlaying}
            onAction={handleContextMenuAction}
            onClose={() => setContextMenu(null)}
          />,
          document.body
        )}
    </div>
  );
}
