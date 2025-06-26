import type { SpotifyAlbum, SpotifyArtist, SpotifyExternalUrls } from '@/types/spotify/state';

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
