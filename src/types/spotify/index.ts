export interface SpotifyBroadcastEvent extends SpotifyGenricEvent<SpotifyBroadcastEvent> {
}

export interface SpotifyBroadcastEvent {
	events: SpotifyBroadcastEventPayload[];
}

export interface SpotifyBroadcastEventPayload {
	deviceBroadcastStatus: SpotifyDeviceBroadcastStatus;
}

export interface SpotifyDeviceBroadcastStatus {
	timestamp: string;
	broadcast_status: SpotifyEventType.BROADCAST_UNAVAILABLE;
	device_id: string;
}

export function isSpotifyBroadcastEvent(data: SpotifyEvent): data is SpotifyBroadcastEvent {
	return (data as SpotifyBroadcastEvent).uri === 'social-connect/v2/broadcast_status_update';
}

export interface SpotifyConnectEvent {
	headers: SpotifyConnectHeaders;
	method: SpotifyEventType.PUT;
	type: 'message';
	uri: string;
}

export interface SpotifyConnectHeaders {
	'Spotify-Connection-Id': string;
}

export function isSpotifyConnectEvent(data: SpotifyEvent): data is SpotifyConnectEvent {
	return (data as SpotifyConnectEvent).uri.startsWith('hm://pusher/v1/connections/');
}

export function isSpotifyLikeEvent(data: SpotifyEvent): data is SpotifyLikeEvent {
	return (data as SpotifyLikeEvent).uri?.startsWith('hm://collection/collection/');
}

export interface SpotifyLikeEvent extends SpotifyGenricEvent<string> {
}

export interface SpotifyMessageEventPayload {
	uri: string;
}

export interface SpotifyLikePayload {
	items: Array<{
		type: string;
		unheard: boolean;
		addedAt: number;
		removed: boolean;
		identifier: string;
	}>;
}

export interface SpotifyMe {
	country: string;
	display_name: string;
	email: string;
	explicit_content: SpotifyExplicitContent;
	external_urls: SpotifyExternalUrls;
	followers: SpotifyFollowers;
	href: string;
	id: string;
	images: SpotifyImage[];
	product: string;
	type: string;
	uri: string;
}

export interface SpotifyExplicitContent {
	filter_enabled: boolean;
	filter_locked: boolean;
}

export interface SpotifyExternalUrls {
	spotify: string;
}

export interface SpotifyFollowers {
	href: null;
	total: number;
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

export interface LinkedFrom {
}

export enum SpotifyEventType {
	PLAYER_STATE_CHANGED = 'PLAYER_STATE_CHANGED',
	BROADCAST_UNAVAILABLE = 'BROADCAST_UNAVAILABLE',
	PUT = 'PUT',
}

export type SpotifyEvent = SpotifyConnectEvent | SpotifyBroadcastEvent | SpotifyMessageEvent | SpotifyLikeEvent;

export interface SpotifyGenricEvent<T> {
	headers: SpotifyHeaders;
	payloads: T[];
	type: string;
	uri: string;
}

export interface SpotifyHeaders {
	'content-type': string;
}

export function isSpotifyMessageEvent(data: SpotifyEvent): data is SpotifyMessageEvent {
	return (data as SpotifyMessageEvent).uri === 'wss://event';
}

export interface SpotifyMessageEvent extends SpotifyGenricEvent<SpotifyMessageEventPayload> {
}

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
	is_liked: boolean;
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