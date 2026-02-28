import { useEffect } from "react";
import ColorThief from "colorthief";
import { usePlayerStore } from "../store/playerStore";

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
}

function adjustColor(hex: string, factor: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return rgbToHex(
    Math.min(255, Math.floor(r * factor)),
    Math.min(255, Math.floor(g * factor)),
    Math.min(255, Math.floor(b * factor))
  );
}

export function useThemeFromArt() {
  const currentTrack = usePlayerStore((s) => s.player.currentTrack);
  const updateTheme = usePlayerStore((s) => s.updateTheme);
  const resetTheme = usePlayerStore((s) => s.resetTheme);

  useEffect(() => {
    if (!currentTrack?.picture) {
      resetTheme();
      return;
    }

    const img = new Image();
    if (!currentTrack.picture.startsWith("data:")) {
      img.crossOrigin = "anonymous";
    }

    const onLoad = () => {
      try {
        const thief = new ColorThief();
        const color = thief.getColor(img);
        if (color) {
          const [r, g, b] = color;
          const accent = rgbToHex(r, g, b);
          const palette = [
            accent,
            adjustColor(accent, 0.85),
            adjustColor(accent, 0.6),
          ];
          updateTheme(accent, palette);
        }
      } catch {
        resetTheme();
      }
    };

    img.onerror = resetTheme;
    img.src = currentTrack.picture;
    if (img.complete) onLoad();
    else img.addEventListener("load", onLoad);

    return () => img.removeEventListener("load", onLoad);
  }, [currentTrack?.picture, currentTrack?.id, updateTheme, resetTheme]);
}
