import { useState } from "react";
import type { Track, NavState, NavView } from "./types";
import { usePlayerStore } from "./store/playerStore";
import { ASCII_ART } from "./data/mock";
import { formatTotalDuration } from "./utils";
import { TitleBar } from "./components/TitleBar";
import { Sidebar } from "./components/Sidebar";
import { PlayerBar } from "./components/PlayerBar";
import { HeroHeader } from "./components/HeroHeader";
import { TabNav } from "./components/TabNav";
import { TrackTable } from "./components/TrackTable";
import { GridView } from "./components/GridView";
import { FoldersView } from "./components/FoldersView";
import { EmptyLibrary } from "./components/EmptyLibrary";
import { PlaylistHeaderActions } from "./components/PlaylistHeaderActions";

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
    meta: React.ReactNode,
    extraActions?: React.ReactNode
  ) => (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      <HeroHeader
        title={title}
        subtitle={subtitle}
        meta={meta}
        ascii={ascii}
        isPlaying={isPlaying}
        actions={extraActions}
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
            <div className="text-sm mb-4">Add more folders or check your music library</div>
            <button
              onClick={() => handleNavigate("folders")}
              className="px-4 py-2 bg-winamp-border hover:bg-winamp-accent-muted text-winamp-bar text-sm"
            >
              Manage folders
            </button>
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
          `${library.tracks.length} TRACKS • ${formatTotalDuration(library.tracks)}`
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
          `${artistTracks.length} TRACKS • ${formatTotalDuration(artistTracks)}`
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
        const activePlaylist = playlists.items.find((p) => p.id === navState.id);
        return renderTracklistView(
          activePlaylist?.name.toUpperCase() ?? "PLAYLIST",
          "USER.COLLECTION",
          plTracks,
          ASCII_ART.library,
          `${plTracks.length} TRACKS • ${formatTotalDuration(plTracks)}`,
          activePlaylist && (
            <PlaylistHeaderActions
              playlist={activePlaylist}
              onNavigate={handleNavigate}
            />
          )
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

      case "recent": {
        const recentTracks = [...library.tracks].slice(0, 20);
        return renderTracklistView(
          "RECENTLY PLAYED",
          "SYSTEM.HISTORY",
          recentTracks,
          ASCII_ART.library,
          `${recentTracks.length} TRACKS • ${formatTotalDuration(recentTracks)}`
        );
      }

      case "mix":
      default: {
        const mixTracks = playQueue.length > 0 ? playQueue : library.tracks.slice(0, 10);
        return renderTracklistView(
          "NOW PLAYING",
          "QUEUE",
          mixTracks,
          ASCII_ART.mix,
          `${mixTracks.length} TRACKS • ${formatTotalDuration(mixTracks)}`
        );
      }
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
