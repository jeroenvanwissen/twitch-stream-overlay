<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';

import { spotifyState } from "@/store/spotify";

import Marquee from "@/components/Marquee.vue";

const time = ref<number | null>(0);
const interval = ref<NodeJS.Timeout>();
const timeout = ref<NodeJS.Timeout>();

const progressBar = ref<HTMLElement>();

onMounted(() => {
  clearInterval(interval.value);
  clearTimeout(timeout.value);

  time.value = spotifyState.value.progress_ms ?? 0;
});

onUnmounted(() => {
  clearInterval(interval.value);
  clearTimeout(timeout.value);
});

watch(spotifyState, value => {
  clearInterval(interval.value);
  clearTimeout(timeout.value);

  progressBar.value?.classList.remove('duration-300');
  timeout.value = setTimeout(() => {
    progressBar.value?.classList.add('duration-300');
  }, 1000);

  time.value = value.progress_ms ?? 0;

  if (!value.is_playing) return;

  interval.value = setInterval(() => {
    time.value = spotifyState.value && time.value ? time.value + 100 : 0;
  }, 100);
});

const width = computed(() => spotifyState.value.item && time.value
  ? (time.value / spotifyState.value.item?.duration_ms) * 100
  : 0);

</script>

<template>
  <div class="fixed bottom-10 right-10" :class="{ 'hidden': !spotifyState.item }">
    <div class="flex flex-col rounded-lg p-4 gap-y-3 min-w-[300px] max-w-[600px] w-fit relative overflow-hidden">
      <div class="absolute inset-0 bg-theme-900/90 card -z-10" />
      <div class="flex items-center gap-x-4 overflow-hidden transition-all duration-300">
        <img :src="spotifyState.item?.album.images.at(0)?.url" :alt="`${spotifyState.item?.name} album art`"
          class="w-16 h-16 rounded-md transition-all duration-300" />
        <div class="flex flex-col card w-available flex-1 overflow-hidden">
          <div class="text-theme-300 font-bold text-xl overflow-hidden transition-all duration-300">
            <Marquee :text="spotifyState.item?.name" />
          </div>
          <div class="text-theme-400 text-lg transition-all duration-300">
            {{ spotifyState.item?.artists.at(0)?.name }}
          </div>
          <div class="text-theme-200 text-md transition-all duration-300">
            {{ spotifyState.is_playing ? 'Now Playing' : 'Paused' }}
          </div>
        </div>
      </div>
      <div class="w-full">
        <div class="relative w-full h-1 bg-gray-700 rounded">
          <div ref="progressBar" class="absolute top-0 left-0 h-full bg-theme-200 rounded card"
            :style="{ width: `${width}%` }"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>