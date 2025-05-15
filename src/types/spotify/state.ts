import {SpotifyEvent, SpotifyEventType, SpotifyGenricEvent} from "@/types/spotify/shared";

export function isSpotifyMessageEvent(data: SpotifyEvent): data is SpotifyMessageEvent {
  return (data as SpotifyMessageEvent).uri == 'wss://event';
}

export interface SpotifyMessageEvent extends SpotifyGenricEvent<SpotifyMessageEventPayload> {}

export interface SpotifyMessageEventPayload {
  events: SpotifyEventElement[];
}

export interface SpotifyEventElement {
  source: string;
  type: SpotifyEventType.PLAYER_STATE_CHANGED;
  uri: null;
  href: string;
  event: SpotifyEventEvent;
  user: SpotifyUser;
}

export interface SpotifyEventEvent {
  event_id: number;
  state: SpotifyState;
}

export interface SpotifyState {
  device: SpotifyDevice;
  shuffle_state: boolean;
  repeat_state: string;
  timestamp: number;
  context: SpotifyContext;
  progress_ms: number;
  item: SpotifyItem;
  currently_playing_type: string;
  actions: SpotifyActions;
  is_playing: boolean;
}

export interface SpotifyActions {
  disallows: SpotifyDisallows;
}

export interface SpotifyDisallows {
  resuming: boolean;
  toggling_repeat_context: boolean;
  toggling_repeat_track: boolean;
  toggling_shuffle: boolean;
}

export interface SpotifyContext {
  external_urls: SpotifyExternalUrls;
  href: string;
  type: string;
  uri: string;
}

export interface SpotifyExternalUrls {
  spotify: string;
}

export interface SpotifyDevice {
  id: string;
  is_active: boolean;
  is_private_session: boolean;
  is_restricted: boolean;
  name: string;
  supports_volume: boolean;
  type: string;
  volume_percent: number;
}

export interface SpotifyItem {
  album: SpotifyAlbum;
  artists: SpotifyArtist[];
  disc_number: number;
  duration_ms: number;
  explicit: boolean;
  external_ids: SpotifyExternalIDS;
  external_urls: SpotifyExternalUrls;
  href: string;
  id: string;
  is_local: boolean;
  is_playable: boolean;
  name: string;
  popularity: number;
  preview_url: string;
  track_number: number;
  type: string;
  uri: string;
}

export interface SpotifyAlbum {
  album_type: string;
  artists: SpotifyArtist[];
  external_urls: SpotifyExternalUrls;
  href: string;
  id: string;
  images: SpotifyImage[];
  is_playable: boolean;
  name: string;
  release_date: Date;
  release_date_precision: string;
  total_tracks: number;
  type: string;
  uri: string;
}

export interface SpotifyArtist {
  external_urls: SpotifyExternalUrls;
  href: string;
  id: string;
  name: string;
  type: string;
  uri: string;
}

export interface SpotifyImage {
  height: number;
  url: string;
  width: number;
}

export interface SpotifyExternalIDS {
  isrc: string;
}

export interface SpotifyUser {
  id: string;
}

export interface SpotifyQueue {
  currently_playing: SpotifyCurrentlyPlaying;
  queue: SpotifyCurrentlyPlaying[];
}

export interface SpotifyCurrentlyPlaying {
  album: SpotifyAlbum;
  artists: SpotifyArtist[];
  available_markets: string[];
  disc_number: number;
  duration_ms: number;
  explicit: boolean;
  external_ids: SpotifyExternalIDS;
  external_urls: SpotifyExternalUrls;
  href: string;
  id: string;
  is_playable: boolean;
  linked_from: LinkedFrom;
  restrictions: SpotifyRestrictions;
  name: string;
  popularity: number;
  preview_url: string;
  track_number: number;
  type: string;
  uri: string;
  is_local: boolean;
}

export interface SpotifyRestrictions {
  reason: string;
}

export interface SpotifyExternalIDS {
  isrc: string;
  ean: string;
  upc: string;
}

export interface LinkedFrom {}
