<script setup lang="ts">
import { spotifyClient } from '@/lib/spotify/spotifyClient'
import { onMounted, onUnmounted, ref } from 'vue'

const formatTime = (ms: number): string => {
  const seconds = Math.floor((ms / 1000) % 60)
  const minutes = Math.floor(ms / 1000 / 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

const currentTrack = ref<any>(null)
const refreshInterval = ref<ReturnType<typeof setInterval>>()

const updateNowPlaying = async () => {
  const response = await spotifyClient.getCurrentlyPlaying()
  if (response && response.item && 'artists' in response.item) {
    currentTrack.value = {
      name: response.item.name,
      artist: response.item.artists[0].name,
      albumArt: response.item.album.images[0].url,
      isPlaying: response.is_playing,
      progressMs: response.progress_ms,
      durationMs: response.item.duration_ms
    }
  } else {
    currentTrack.value = null
  }
}

onMounted(async () => {
  await updateNowPlaying()
  refreshInterval.value = setInterval(updateNowPlaying, 5000)
})

onUnmounted(() => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
  }
})
</script>

<template>
  <div class="now-playing" v-if="currentTrack">
    <div class="flex flex-col bg-theme-900/90 rounded-lg p-4 space-y-3 min-w-[300px] max-w-[800px] w-fit">
      <div class="flex items-center space-x-4">
        <img :src="currentTrack.albumArt" :alt="`${currentTrack.name} album art`" class="w-16 h-16 rounded-md" />
        <div class="flex flex-col">
          <div class="text-theme-300 font-bold text-xl">
            {{ currentTrack.name }}
          </div>
          <div class="text-theme-400 text-lg">{{ currentTrack.artist }}</div>
          <div class="text-green-500 text-md">
            {{ currentTrack.isPlaying ? 'Now Playing' : 'Paused' }}
          </div>
        </div>
      </div>
      <div class="w-full">
        <div class="relative w-full h-1 bg-gray-700 rounded">
          <div
            class="absolute top-0 left-0 h-full bg-green-500 rounded transition-all duration-500"
            :style="{
              width: `${(currentTrack.progressMs / currentTrack.durationMs) * 100}%`
            }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.now-playing {
  position: fixed;
  bottom: 40px;
  right: 40px;
}
</style>
