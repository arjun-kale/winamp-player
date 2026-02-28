import type { Track, Mix, Artist, Radio } from "../types";

export const MOCK_TRACKS: Track[] = [
  { id: 1, title: "Neon Knights", artist: "The Nomads", album: "Midnight Run", time: "3:05", genre: "ROCK" },
  { id: 2, title: "Cyber Drift", artist: "92elm", album: "Binary Skies", time: "4:12", genre: "SYNTHWAVE" },
  { id: 3, title: "Desert Sand", artist: "The Nomads", album: "Wasteland", time: "3:30", genre: "ROCK" },
  { id: 4, title: "Aqua", artist: "92elm", album: "Deep Dive", time: "2:18", genre: "LOFI" },
  { id: 5, title: "Electric Pulse", artist: "Neon Knights", album: "Grid Lock", time: "3:05", genre: "SYNTHWAVE" },
  { id: 6, title: "Static Noise", artist: "Null Pointer", album: "Exceptions", time: "1:59", genre: "LOFI" },
  { id: 7, title: "Terminal Velocity", artist: "The Nomads", album: "Midnight Run", time: "5:45", genre: "ROCK" },
  { id: 8, title: "Ghost in the Shell", artist: "Cyberia", album: "Wired", time: "4:20", genre: "SYNTHWAVE" },
  { id: 9, title: "Syntax Error", artist: "Null Pointer", album: "Exceptions", time: "2:34", genre: "LOFI" },
  { id: 10, title: "Memory Leak", artist: "92elm", album: "Binary Skies", time: "6:11", genre: "ACOUSTIC" },
  { id: 11, title: "Overclocked", artist: "Neon Knights", album: "Grid Lock", time: "3:55", genre: "ROCK" },
  { id: 12, title: "Subroutine", artist: "Cyberia", album: "Wired", time: "4:01", genre: "SYNTHWAVE" },
  { id: 13, title: "System Failure", artist: "Null Pointer", album: "Exceptions", time: "3:33", genre: "ROCK" },
  { id: 14, title: "Data Stream", artist: "Cyberia", album: "Wired", time: "5:05", genre: "LOFI" },
  { id: 15, title: "Reboot", artist: "The Nomads", album: "Midnight Run", time: "2:50", genre: "ACOUSTIC" },
];

export const MOCK_MIXES: Mix[] = [
  { id: "mix1", name: "Late Night Coding", tracks: [2, 6, 8, 9, 10, 12, 13, 14], desc: "Deep focus, no lyrics" },
  { id: "mix2", name: "Cyberpunk 2077 OST", tracks: [1, 5, 7, 11, 15], desc: "High energy synth" },
  { id: "mix3", name: "Current: Rock / Indie", tracks: [1, 3, 4, 7, 11, 13], desc: "Guitar driven" },
  { id: "mix4", name: "90s Hackers", tracks: [6, 8, 9, 12, 13, 14], desc: "Retro electronic" },
  { id: "mix5", name: "Deep Focus Ambient", tracks: [2, 4, 10], desc: "Atmospheric soundscapes" },
];

export const MOCK_ARTISTS: Artist[] = Array.from(new Set(MOCK_TRACKS.map((t) => t.artist))).map((name) => ({
  id: name,
  name,
  desc: `${MOCK_TRACKS.filter((t) => t.artist === name).length} Tracks in Database`,
}));

export const MOCK_RADIOS: Radio[] = [
  { id: "r1", name: "NightCity FM", desc: "Synthwave & Retrowave 24/7" },
  { id: "r2", name: "Lofi Terminal", desc: "Beats to hack/study to" },
  { id: "r3", name: "Wasteland Radio", desc: "Desert Rock & Acoustic" },
  { id: "r4", name: "Null Sector", desc: "Deep electronic focus" },
];

export const ASCII_ART = {
  mix: "\n ▄▄▄▄▄▄▄▄▄▄▄\n █         █\n █  MIX    █\n █  VOL.1  █\n █         █\n █▄▄▄▄▄▄▄▄▄█",
  library: "\n ▄▄▄▄▄▄▄▄▄▄▄\n █ ≡≡≡≡≡≡≡ █\n █ ≡≡≡≡≡≡≡ █\n █ ≡≡≡≡≡≡≡ █\n █ ≡≡≡≡≡≡≡ █\n █▄▄▄▄▄▄▄▄▄█",
  artist: "\n ▄▄▄▄▄▄▄▄▄▄▄\n █  () ()  █\n █   ___   █\n █  |___|  █\n █         █\n █▄▄▄▄▄▄▄▄▄█",
  radio: "\n ▄▄▄▄▄▄▄▄▄▄▄\n █  (())   █\n █  /||\\   █\n █ / || \\  █\n █   ||    █\n █▄▄▄▄▄▄▄▄▄█",
} as const;

export const GENRE_TABS = ["ALL", "LOFI", "ROCK", "ACOUSTIC", "SYNTHWAVE"] as const;
export type GenreTab = (typeof GENRE_TABS)[number];

/* Pre-generate visualizer bar data to prevent flickering on re-renders */
export const VISUALIZER_DATA = Array.from({ length: 120 }).map(() => ({
  delay: Math.random() * -2,
  duration: 0.5 + Math.random() * 0.8,
  height: 20 + Math.random() * 80,
}));
