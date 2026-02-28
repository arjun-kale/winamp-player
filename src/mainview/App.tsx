import { useState, useCallback } from "react";
import { MainWindow } from "./MainWindow";
import { MiniPlayer } from "./MiniPlayer";

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

export default function App({ electrobun }: AppProps) {
  const [windowMode, setWindowMode] = useState<"main" | "mini">("main");

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

  if (windowMode === "mini") {
    return (
      <div className="h-full w-full flex justify-center items-start pt-4">
        <MiniPlayer electrobun={electrobun} onShade={switchToMain} onExpandToMain={switchToMain} />
      </div>
    );
  }

  return (
    <MainWindow
      electrobun={electrobun}
      onToggleMini={switchToMini}
    />
  );
}
