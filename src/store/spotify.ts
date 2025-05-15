import { computed, ref } from 'vue';

import type { SpotifyCurrentlyPlaying, SpotifyState } from '@/types/spotify';

const me = ref<SpotifyApi.CurrentUsersProfileResponse>(<SpotifyApi.CurrentUsersProfileResponse>{});
export const spotifyMe = computed(() => me.value);
export const setSpotifyMe = (value: SpotifyApi.CurrentUsersProfileResponse) => {
  me.value = value;
};

const state = ref<SpotifyState>(<SpotifyState>{});
export const spotifyState = computed(() => state.value);
export const setSpotifyState = (value: SpotifyState) => {
  state.value = value;
};

const queue = ref<SpotifyCurrentlyPlaying[]>(<SpotifyCurrentlyPlaying[]>[]);
export const spotifyQueue = computed(() => queue.value);
export const setSpotifyQueue = (value: SpotifyCurrentlyPlaying[]) => {
  queue.value = value;
};
