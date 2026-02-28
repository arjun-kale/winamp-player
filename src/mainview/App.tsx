import { useState, useCallback, useEffect, useRef } from "react";
import { MainWindow } from "./MainWindow";
import { MiniPlayer } from "./MiniPlayer";
import { usePlayerStore } from "./store/playerStore";
import { useAudioEngine } from "./hooks/useAudioEngine";
import { useThemeFromArt } from "./hooks/useThemeFromArt";
import { AudioEngineProvider } from "./context/AudioEngineContext";
import { ThemeProvider } from "./components/ThemeProvider";
type WinampElectrobun = {
  rpc?: {
    send?: {
      resizeWindow: (p: { width: number; height: number }) => void;
      closeWindow: () => void;
      minimizeWindow: () => void;
      maximizeWindow: () => void;
    };
    request?: unknown;
  };
};

type AppProps = {
  electrobun: WinampElectrobun;
};

const MAIN_WINDOW_WIDTH = 1200;
const MAIN_WINDOW_HEIGHT = 800;

export default function App({ electrobun }: AppProps) {
  const [windowMode, setWindowMode] = useState<"main" | "mini">("main");
  const initRef = useRef(false);

  const { setRpc, loadLibrary, loadPlaylists, player } = usePlayerStore();
  const playTrack = usePlayerStore((s) => s.playTrack);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const setCurrentTime = usePlayerStore((s) => s.setCurrentTime);
  const setVolume = usePlayerStore((s) => s.setVolume);
  const handleNext = usePlayerStore((s) => s.handleNext);
  const handlePrev = usePlayerStore((s) => s.handlePrev);

  const { analyserRef, analyserReady } = useAudioEngine();
  useThemeFromArt();

  const rpcReady = usePlayerStore((s) => s.rpc !== null);

  useEffect(() => {
    const rpc = electrobun.rpc;
    if (rpc && rpc.request) {
      setRpc(rpc as Parameters<typeof setRpc>[0]);
    }
    return () => setRpc(null);
  }, [electrobun, setRpc]);

  useEffect(() => {
    if (!initRef.current && rpcReady) {
      initRef.current = true;
      loadLibrary();
      loadPlaylists();
    }
  }, [rpcReady, loadLibrary, loadPlaylists]);

  const switchToMini = useCallback(() => setWindowMode("mini"), []);

  const switchToMain = useCallback(() => {
    electrobun.rpc?.send?.resizeWindow?.({
      width: MAIN_WINDOW_WIDTH,
      height: MAIN_WINDOW_HEIGHT,
    });
    setWindowMode("main");
  }, [electrobun]);

  if (windowMode === "mini") {
    return (
      <ThemeProvider>
        <div className="h-full w-full flex justify-center items-start pt-4">
          <MiniPlayer
          electrobun={electrobun}
          onExpandToMain={switchToMain}
          currentTrack={player.currentTrack}
          isPlaying={player.isPlaying}
          playQueue={player.queue}
          currentTimeMs={player.currentTime}
          volume={player.volume}
          onPlayPause={togglePlay}
          onNext={handleNext}
          onPrev={handlePrev}
          onScrubberChange={setCurrentTime}
          onVolumeChange={setVolume}
          onTrackSelect={(track, queue) => playTrack(track, queue)}
        />
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <AudioEngineProvider analyserRef={analyserRef} analyserReady={analyserReady}>
        <MainWindow
        electrobun={electrobun}
        onToggleMini={switchToMini}
        currentTrack={player.currentTrack}
        isPlaying={player.isPlaying}
        playQueue={player.queue}
        currentTimeMs={player.currentTime}
        volume={player.volume}
        onPlayTrack={(track, queue) => playTrack(track, queue)}
        onPlayPause={togglePlay}
        onNext={handleNext}
        onPrev={handlePrev}
        onScrubberChange={setCurrentTime}
        onVolumeChange={setVolume}
      />
      </AudioEngineProvider>
    </ThemeProvider>
  );
}
