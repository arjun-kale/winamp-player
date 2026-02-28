export interface Track {
  id: number;
  title: string;
  artist: string;
  album: string;
  time: string;
  genre: string;
}

export interface Mix {
  id: string;
  name: string;
  tracks: number[];
  desc: string;
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
  | "radio"
  | "recent"
  | "mix";

export interface NavState {
  view: NavView;
  id?: string;
}
