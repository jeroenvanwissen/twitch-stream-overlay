import type { SpotifyEvent, SpotifyEventType } from '@/types/spotify/shared';

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
