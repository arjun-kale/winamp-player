export interface Track {
  id: string;
  path: string;
  title: string;
  artist: string;
  album: string;
  time: string;
  genre: string;
  picture?: string;
}

export interface Mix {
  id: string;
  name: string;
  tracks: string[];
  desc: string;
}

export interface Playlist {
  id: string;
  name: string;
  path: string;
  trackIds: string[];
}

export interface Artist {
  id: string;
  name: string;
  desc: string;
}

export interface Radio {
  id: string;
  name: string;
  desc: string;
}

export type NavView =
  | "library"
  | "artists"
  | "artist_detail"
  | "playlists"
  | "playlist_detail"
  | "folders"
  | "radio"
  | "recent"
  | "mix";

export interface NavState {
  view: NavView;
  id?: string;
}
