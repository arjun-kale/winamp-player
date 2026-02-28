import { Minus, Square, X, Search, Download, ListMusic } from "lucide-react";
import { APP_DISPLAY_NAME } from "../constants";

type ElectrobunRpc = {
  resizeWindow?: (p: { width: number; height: number }) => void;
  closeWindow?: () => void;
  minimizeWindow?: () => void;
  maximizeWindow?: () => void;
};

type TitleBarProps = {
  electrobun?: { rpc?: { send?: ElectrobunRpc } };
};

export function TitleBar({ electrobun }: TitleBarProps) {
  const send = electrobun?.rpc?.send;

  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-winamp-border bg-winamp-panel shrink-0">
      <div className="flex items-center gap-4 text-winamp-accent-muted electrobun-webkit-app-region-no-drag">
        <button
          onClick={() => send?.minimizeWindow?.()}
          className="hover:text-winamp-accent cursor-pointer transition-colors"
          aria-label="Minimize"
        >
          <Minus size={14} />
        </button>
        <button
          onClick={() => send?.maximizeWindow?.()}
          className="hover:text-winamp-accent cursor-pointer transition-colors"
          aria-label="Maximize"
        >
          <Square size={12} />
        </button>
        <button
          onClick={() => send?.closeWindow?.()}
          className="hover:text-winamp-accent cursor-pointer transition-colors"
          aria-label="Close"
        >
          <X size={14} />
        </button>
      </div>
      <div className="flex items-center gap-2 text-winamp-accent tracking-widest text-sm font-bold electrobun-webkit-app-region-drag flex-1 justify-center">
        <ListMusic size={14} /> {APP_DISPLAY_NAME.toUpperCase().replace(/\s/g, " ")}
      </div>
      <div className="flex items-center gap-4 text-winamp-accent-muted electrobun-webkit-app-region-no-drag">
        <Search size={14} className="hover:text-winamp-accent cursor-pointer transition-colors" />
        <Download size={14} className="hover:text-winamp-accent cursor-pointer transition-colors" />
      </div>
    </div>
  );
}
