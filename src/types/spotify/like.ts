import {SpotifyEvent, SpotifyGenricEvent} from "@/types/spotify/shared";

export function isSpotifyLikeEvent(data: SpotifyEvent): data is SpotifyLikeEvent {
    return (data as SpotifyLikeEvent).uri?.startsWith('hm://collection/collection/');
}

export interface SpotifyLikeEvent extends SpotifyGenricEvent<string> {}

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