import { useEffect } from "react";
import { usePlayerStore } from "../store/playerStore";

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

function adjustHex(hex: string, factor: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `#${[r, g, b]
    .map((x) => Math.min(255, Math.floor(x * factor)).toString(16).padStart(2, "0"))
    .join("")}`;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = usePlayerStore((s) => s.theme);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--color-winamp-accent", theme.accentColor);
    root.style.setProperty("--color-winamp-bar", theme.palette[1] ?? adjustHex(theme.accentColor, 0.85));
    root.style.setProperty("--color-winamp-accent-muted", theme.palette[2] ?? adjustHex(theme.accentColor, 0.6));
    root.style.setProperty("--color-winamp-text", adjustHex(theme.accentColor, 0.65));
    root.style.setProperty("--color-winamp-text-bright", theme.accentColor);
    root.style.setProperty("--color-winamp-scrollbar", adjustHex(theme.accentColor, 0.25));
    root.style.setProperty("--color-winamp-scrollbar-hover", adjustHex(theme.accentColor, 0.4));
  }, [theme.accentColor, theme.palette]);

  return <>{children}</>;
}
