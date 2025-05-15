import {SpotifyEvent, SpotifyEventType, SpotifyGenricEvent} from "@/types/spotify/shared";

export interface SpotifyBroadcastEvent extends SpotifyGenricEvent<SpotifyBroadcastEvent> {}

export interface SpotifyBroadcastEvent {
    events: SpotifyBroadcastEventPayload[];
}

export interface SpotifyBroadcastEventPayload {
    deviceBroadcastStatus: SpotifyDeviceBroadcastStatus;
}

export interface SpotifyDeviceBroadcastStatus {
    timestamp:        string;
    broadcast_status: SpotifyEventType.BROADCAST_UNAVAILABLE;
    device_id:        string;
}

export function isSpotifyBroadcastEvent(data: SpotifyEvent): data is SpotifyBroadcastEvent {
    return (data as SpotifyBroadcastEvent).uri == "social-connect/v2/broadcast_status_update";
}
