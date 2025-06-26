import { computed, ref } from 'vue';

import type { SpotifyState } from '@/types/spotify/state';
import type { SpotifyCurrentlyPlaying } from '@/types/spotify/queue';

const me = ref<SpotifyApi.CurrentUsersProfileResponse>(<SpotifyApi.CurrentUsersProfileResponse>{});
export const spotifyMe = computed(() => me.value);
export function setSpotifyMe(value: SpotifyApi.CurrentUsersProfileResponse) {
	me.value = value;
}

const state = ref<SpotifyState>(<SpotifyState>{});
export const spotifyState = computed(() => state.value);
export function setSpotifyState(value: SpotifyState) {
	state.value = value;
}

const queue = ref<SpotifyCurrentlyPlaying[]>(<SpotifyCurrentlyPlaying[]>[]);
export const spotifyQueue = computed(() => queue.value);
export function setSpotifyQueue(value: SpotifyCurrentlyPlaying[]) {
	queue.value = value;
}
