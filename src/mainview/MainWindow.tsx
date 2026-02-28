import { useState, useEffect, useCallback } from "react";
import type { Track, NavState, NavView } from "./types";
import { parseTime } from "./utils";
import {
  MOCK_TRACKS,
  MOCK_MIXES,
  MOCK_ARTISTS,
  MOCK_RADIOS,
  ASCII_ART,
} from "./data/mock";
import type { GenreTab } from "./data/mock";
import { TitleBar } from "./components/TitleBar";
import { Sidebar } from "./components/Sidebar";
import { PlayerBar } from "./components/PlayerBar";
import { HeroHeader } from "./components/HeroHeader";
import { TabNav } from "./components/TabNav";
import { TrackTable } from "./components/TrackTable";
import { GridView } from "./components/GridView";

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

type MainWindowProps = {
  electrobun?: WinampElectrobun;
  onToggleMini?: () => void;
};

const defaultMix = MOCK_MIXES.find((m) => m.id === "mix3") ?? MOCK_MIXES[0];
const defaultTrack = MOCK_TRACKS.find((t) => t.id === 4) ?? MOCK_TRACKS[0];

export function MainWindow({ electrobun, onToggleMini }: MainWindowProps) {
  const [navState, setNavState] = useState<NavState>({ view: "mix", id: "mix3" });
  const [activeTab, setActiveTab] = useState<GenreTab>("ALL");
  const [currentTrack, setCurrentTrack] = useState<Track>(defaultTrack);
  const [isPlaying, setIsPlaying] = useState(true);
  const [playQueue, setPlayQueue] = useState<Track[]>(
    defaultMix.tracks.map((id) => MOCK_TRACKS.find((t) => t.id === id)!).filter(Boolean)
  );
  const [currentTimeMs, setCurrentTimeMs] = useState(29);
  const [volume, setVolume] = useState(0.75);

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

  const handleScrubberChange = (seconds: number) => setCurrentTimeMs(seconds);
  const handleVolumeChange = (value: number) => setVolume(value);

  const handleNavigate = (view: NavView, id?: string) => {
    setNavState({ view, id });
    setActiveTab("ALL");
  };

  const renderTracklistView = (
    title: string,
    subtitle: string,
    tracks: Track[],
    ascii: string,
    meta: React.ReactNode
  ) => {
    const filteredTracks =
      activeTab === "ALL" ? tracks : tracks.filter((t) => t.genre === activeTab);

    return (
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <HeroHeader
          title={title}
          subtitle={subtitle}
          meta={meta}
          ascii={ascii}
          isPlaying={isPlaying}
        />
        <TabNav activeTab={activeTab} onTabChange={setActiveTab} />
        <TrackTable
          tracks={filteredTracks}
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          onTrackClick={(track, queue) => playTrack(track, queue)}
        />
      </div>
    );
  };

  const renderGridView = (
    title: string,
    subtitle: string,
    items: { id: string; name: string; desc: string }[],
    onItemClick: (item: { id: string; name: string; desc: string }) => void,
    ascii: string
  ) => (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      <HeroHeader
        title={title}
        subtitle={subtitle}
        meta={`${items.length} DATABANKS`}
        ascii={ascii}
        isPlaying={isPlaying}
      />
      <GridView items={items} onItemClick={onItemClick} />
    </div>
  );

  const renderMainContent = () => {
    switch (navState.view) {
      case "library":
        return renderTracklistView(
          "ALL TRACKS",
          "SYSTEM.LIBRARY",
          MOCK_TRACKS,
          ASCII_ART.library,
          `${MOCK_TRACKS.length} TRACKS`
        );
      case "artists":
        return renderGridView(
          "ARTISTS",
          "SYSTEM.DATABASE",
          MOCK_ARTISTS,
          (artist) => handleNavigate("artist_detail", artist.name),
          ASCII_ART.artist
        );
      case "artist_detail": {
        const artistTracks = MOCK_TRACKS.filter((t) => t.artist === navState.id);
        return renderTracklistView(
          (navState.id ?? "").toUpperCase(),
          "ARTIST OVERVIEW",
          artistTracks,
          ASCII_ART.artist,
          `${artistTracks.length} TRACKS`
        );
      }
      case "playlists":
        return renderGridView(
          "PLAYLISTS",
          "USER.COLLECTIONS",
          MOCK_MIXES,
          (mix) => handleNavigate("mix", mix.id),
          ASCII_ART.library
        );
      case "radio":
        return renderGridView(
          "RADIO STREAMS",
          "LIVE.BROADCASTS",
          MOCK_RADIOS,
          (_item) => {
            const randomTrack =
              MOCK_TRACKS[Math.floor(Math.random() * MOCK_TRACKS.length)];
            playTrack(randomTrack, MOCK_TRACKS);
          },
          ASCII_ART.radio
        );
      case "recent":
        return renderTracklistView(
          "RECENTLY PLAYED",
          "SYSTEM.HISTORY",
          [...MOCK_TRACKS].reverse().slice(0, 8),
          ASCII_ART.library,
          "LAST 24 HOURS"
        );
      case "mix":
      default: {
        const mix = MOCK_MIXES.find((m) => m.id === navState.id) ?? MOCK_MIXES[0];
        const mixTracks = mix.tracks
          .map((tId) => MOCK_TRACKS.find((t) => t.id === tId))
          .filter((t): t is Track => t != null);
        return renderTracklistView(
          mix.name.toUpperCase(),
          "NOW PLAYING PLAYLIST",
          mixTracks,
          ASCII_ART.mix,
          `${mixTracks.length} TRACKS • ${mix.desc}`
        );
      }
    }
  };

  return (
    <div className="h-screen w-full bg-winamp-bg text-winamp-bar font-mono flex flex-col overflow-hidden">
      <TitleBar electrobun={electrobun} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar navState={navState} mixes={MOCK_MIXES} onNavigate={handleNavigate} />
        {renderMainContent()}
      </div>

      <PlayerBar
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        currentTimeMs={currentTimeMs}
        volume={volume}
        onPlayPause={() => setIsPlaying(!isPlaying)}
        onNext={handleNext}
        onPrev={handlePrev}
        onScrubberChange={handleScrubberChange}
        onVolumeChange={handleVolumeChange}
        onToggleMini={onToggleMini}
      />
    </div>
  );
}
