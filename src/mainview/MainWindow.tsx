import { useState } from "react";
import type { Track, NavState, NavView } from "./types";
import { usePlayerStore } from "./store/playerStore";
import { ASCII_ART } from "./data/mock";
import { TitleBar } from "./components/TitleBar";
import { Sidebar } from "./components/Sidebar";
import { PlayerBar } from "./components/PlayerBar";
import { HeroHeader } from "./components/HeroHeader";
import { TabNav } from "./components/TabNav";
import { TrackTable } from "./components/TrackTable";
import { GridView } from "./components/GridView";
import { FoldersView } from "./components/FoldersView";
import { EmptyLibrary } from "./components/EmptyLibrary";

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
  currentTrack: Track | null;
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
  const [navState, setNavState] = useState<NavState>({ view: "library", id: undefined });
  const [activeTab, setActiveTab] = useState<string>("ALL");

  const { library, playlists, loadPlaylistTracks, settings } = usePlayerStore();

  const handleNavigate = (view: NavView, id?: string) => {
    setNavState({ view, id });
    setActiveTab("ALL");
  };

  const artists = [...new Set(library.tracks.map((t) => t.artist))].map((name) => ({
    id: name,
    name,
    desc: `${library.tracks.filter((t) => t.artist === name).length} TRACKS`,
  }));

  const renderTracklistView = (
    title: string,
    subtitle: string,
    tracks: Track[],
    ascii: string,
    meta: React.ReactNode
  ) => (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      <HeroHeader
        title={title}
        subtitle={subtitle}
        meta={meta}
        ascii={ascii}
        isPlaying={isPlaying}
      />
      <TabNav
        tabs={["ALL", ...Array.from(new Set(tracks.map((t) => t.genre).filter(Boolean)))]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      <TrackTable
        tracks={activeTab === "ALL" ? tracks : tracks.filter((t) => t.genre === activeTab)}
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        onTrackClick={(track, queue) => onPlayTrack(track, queue)}
      />
    </div>
  );

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
        meta={`${items.length} ITEMS`}
        ascii={ascii}
        isPlaying={isPlaying}
      />
      <GridView items={items} onItemClick={onItemClick} />
    </div>
  );

  const renderMainContent = () => {
    if (library.loading) {
      return (
        <div className="flex-1 flex items-center justify-center text-winamp-accent-muted">
          <div className="text-center">
            <div className="text-lg mb-2">SCANNING LIBRARY...</div>
            <div className="text-sm">Loading tracks</div>
          </div>
        </div>
      );
    }

    if (library.tracks.length === 0 && !library.error && settings.watchFolders.length === 0) {
      return <EmptyLibrary />;
    }

    if (library.error) {
      return (
        <div className="flex-1 flex items-center justify-center text-winamp-accent-muted">
          <div className="text-center">
            <div className="text-lg mb-2 text-red-400">ERROR</div>
            <div className="text-sm mb-4">{library.error}</div>
            <button
              onClick={() => usePlayerStore.getState().loadLibrary()}
              className="px-4 py-2 bg-winamp-border hover:bg-winamp-accent-muted text-winamp-bar text-sm"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    if (library.tracks.length === 0 && settings.watchFolders.length > 0) {
      return (
        <div className="flex-1 flex items-center justify-center text-winamp-accent-muted">
          <div className="text-center">
            <div className="text-lg mb-2">NO TRACKS FOUND</div>
            <div className="text-sm">Add more folders or check your music library</div>
          </div>
        </div>
      );
    }

    switch (navState.view) {
      case "library":
        return renderTracklistView(
          "ALL TRACKS",
          "SYSTEM.LIBRARY",
          library.tracks,
          ASCII_ART.library,
          `${library.tracks.length} TRACKS`
        );

      case "artists":
        return renderGridView(
          "ARTISTS",
          "SYSTEM.DATABASE",
          artists,
          (artist) => handleNavigate("artist_detail", artist.name),
          ASCII_ART.artist
        );

      case "artist_detail": {
        const artistTracks = library.tracks.filter((t) => t.artist === navState.id);
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
          playlists.items.map((p) => ({ id: p.id, name: p.name, desc: `${p.trackIds.length} TRACKS` })),
          (item) => handleNavigate("playlist_detail", item.id),
          ASCII_ART.library
        );

      case "playlist_detail": {
        const plTracks = loadPlaylistTracks(navState.id ?? "");
        return renderTracklistView(
          playlists.items.find((p) => p.id === navState.id)?.name.toUpperCase() ?? "PLAYLIST",
          "USER.COLLECTION",
          plTracks,
          ASCII_ART.library,
          `${plTracks.length} TRACKS`
        );
      }

      case "folders":
        return <FoldersView />;

      case "radio":
        return (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-winamp-accent-muted">
              <div className="text-lg mb-2">RADIO</div>
              <div className="text-sm">Streaming coming soon</div>
            </div>
          </div>
        );

      case "recent":
        return renderTracklistView(
          "RECENTLY PLAYED",
          "SYSTEM.HISTORY",
          [...library.tracks].slice(0, 20),
          ASCII_ART.library,
          "LAST TRACKS"
        );

      case "mix":
      default:
        return renderTracklistView(
          "NOW PLAYING",
          "QUEUE",
          playQueue.length > 0 ? playQueue : library.tracks.slice(0, 10),
          ASCII_ART.mix,
          `${playQueue.length || library.tracks.length} TRACKS`
        );
    }
  };

  return (
    <div className="h-screen w-full bg-winamp-bg text-winamp-bar font-mono flex flex-col overflow-hidden">
      <TitleBar electrobun={electrobun} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar navState={navState} playlists={playlists.items} onNavigate={handleNavigate} />
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
