import { useState, useEffect, useCallback } from "react";
import type { Track, NavState, NavView } from "./types";
import {
  MOCK_TRACKS,
  MOCK_MIXES,
  MOCK_ARTISTS,
  MOCK_RADIOS,
  ASCII_ART,
} from "./data/mock";
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
  currentTrack: Track;
  isPlaying: boolean;
  playQueue: Track[];
  currentTimeMs: number;
  volume: number;
  onPlayTrack: (track: Track, queue: Track[] | null) => void;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onScrubberChange: (seconds: number) => void;
  onVolumeChange: (value: number) => void;
};

export function MainWindow({
  electrobun,
  onToggleMini,
  currentTrack,
  isPlaying,
  playQueue,
  currentTimeMs,
  volume,
  onPlayTrack,
  onPlayPause,
  onNext,
  onPrev,
  onScrubberChange,
  onVolumeChange,
}: MainWindowProps) {
  const [navState, setNavState] = useState<NavState>({ view: "mix", id: "mix3" });
  const [activeTab, setActiveTab] = useState<string>("ALL");

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
    const availableGenres = ["ALL", ...Array.from(new Set(tracks.map((t) => t.genre)))];
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
        <TabNav tabs={availableGenres} activeTab={activeTab} onTabChange={setActiveTab} />
        <TrackTable
          tracks={filteredTracks}
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          onTrackClick={(track, queue) => onPlayTrack(track, queue)}
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
            onPlayTrack(randomTrack, MOCK_TRACKS);
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
        onPlayPause={onPlayPause}
        onNext={onNext}
        onPrev={onPrev}
        onScrubberChange={onScrubberChange}
        onVolumeChange={onVolumeChange}
        onToggleMini={onToggleMini}
      />
    </div>
  );
}
