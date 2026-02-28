import { useState, useCallback, useEffect } from "react";
import { MainWindow } from "./MainWindow";
import { MiniPlayer } from "./MiniPlayer";
import type { Track } from "./types";
import { parseTime } from "./utils";
import { MOCK_TRACKS, MOCK_MIXES } from "./data/mock";

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

type AppProps = {
  electrobun: WinampElectrobun;
};

const MAIN_WINDOW_WIDTH = 1200;
const MAIN_WINDOW_HEIGHT = 800;

const defaultMix = MOCK_MIXES.find((m) => m.id === "mix3") ?? MOCK_MIXES[0];
const defaultTrack = MOCK_TRACKS.find((t) => t.id === 4) ?? MOCK_TRACKS[0];
const defaultPlayQueue = defaultMix.tracks
  .map((id) => MOCK_TRACKS.find((t) => t.id === id))
  .filter((t): t is Track => t != null);

export default function App({ electrobun }: AppProps) {
  const [windowMode, setWindowMode] = useState<"main" | "mini">("main");
  const [currentTrack, setCurrentTrack] = useState<Track>(defaultTrack);
  const [isPlaying, setIsPlaying] = useState(true);
  const [playQueue, setPlayQueue] = useState<Track[]>(defaultPlayQueue);
  const [currentTimeMs, setCurrentTimeMs] = useState(29);
  const [volume, setVolume] = useState(0.75);

  const switchToMini = useCallback(() => {
    setWindowMode("mini");
  }, []);

  const switchToMain = useCallback(() => {
    electrobun.rpc?.send?.resizeWindow?.({
      width: MAIN_WINDOW_WIDTH,
      height: MAIN_WINDOW_HEIGHT,
    });
    setWindowMode("main");
  }, [electrobun]);

  const playTrack = useCallback((track: Track, newQueue: Track[] | null = null) => {
    setCurrentTrack(track);
    if (newQueue) setPlayQueue(newQueue);
    setIsPlaying(true);
    setCurrentTimeMs(0);
  }, []);

  const handleNext = useCallback(() => {
    if (!playQueue.length) return;
    const idx = playQueue.findIndex((t) => t.id === currentTrack?.id);
    if (idx !== -1 && idx < playQueue.length - 1) {
      playTrack(playQueue[idx + 1]);
    } else {
      playTrack(playQueue[0]);
    }
  }, [playQueue, currentTrack, playTrack]);

  const handlePrev = useCallback(() => {
    if (!playQueue.length) return;
    const idx = playQueue.findIndex((t) => t.id === currentTrack?.id);
    if (idx > 0) {
      playTrack(playQueue[idx - 1]);
    } else {
      playTrack(playQueue[playQueue.length - 1]);
    }
  }, [playQueue, currentTrack, playTrack]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying && currentTrack) {
      const totalSecs = parseTime(currentTrack.time);
      interval = setInterval(() => {
        setCurrentTimeMs((prev) => {
          if (prev >= totalSecs) {
            handleNext();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTrack, playQueue, handleNext]);

  if (windowMode === "mini") {
    return (
      <div className="h-full w-full flex justify-center items-start pt-4">
        <MiniPlayer
          electrobun={electrobun}
          onExpandToMain={switchToMain}
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          playQueue={playQueue}
          currentTimeMs={currentTimeMs}
          volume={volume}
          onPlayPause={() => setIsPlaying((p) => !p)}
          onNext={handleNext}
          onPrev={handlePrev}
          onScrubberChange={setCurrentTimeMs}
          onVolumeChange={setVolume}
          onTrackSelect={playTrack}
        />
      </div>
    );
  }

  return (
    <MainWindow
      electrobun={electrobun}
      onToggleMini={switchToMini}
      currentTrack={currentTrack}
      isPlaying={isPlaying}
      playQueue={playQueue}
      currentTimeMs={currentTimeMs}
      volume={volume}
      onPlayTrack={playTrack}
      onPlayPause={() => setIsPlaying((p) => !p)}
      onNext={handleNext}
      onPrev={handlePrev}
      onScrubberChange={setCurrentTimeMs}
      onVolumeChange={setVolume}
    />
  );
}
