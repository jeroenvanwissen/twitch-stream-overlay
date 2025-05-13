<script setup lang="ts">
import { spotifyClient } from '@/lib/spotify/spotifyClient'
import { onMounted, onUnmounted, ref } from 'vue'

interface QueuedTrack {
  name: string
  artist: string
  albumArt: string
}

const queuedTracks = ref<QueuedTrack[]>([])
const refreshInterval = ref<ReturnType<typeof setInterval>>()

const updateQueue = async () => {
  const response = await spotifyClient.getQueue()
  if (response && response.queue) {
    queuedTracks.value = response.queue.slice(0, 1).map((track: any) => ({
      name: track.name,
      artist: track.artists[0].name,
      albumArt: track.album.images[0].url
    }))
  } else {
    queuedTracks.value = []
  }
}

onMounted(async () => {
  await updateQueue()
  refreshInterval.value = setInterval(updateQueue, 5000)
})

onUnmounted(() => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
  }
})
</script>

<template>
  <div class="next-in-queue" v-if="queuedTracks.length > 0">
    <div class="flex flex-col bg-theme-900/90 rounded-lg p-4 space-y-3 min-w-[200px] max-w-[800px] w-fit">
      <div class="text-theme-200 text-md mb-1">Next in queue:</div>
      <div v-for="(track, index) in queuedTracks" :key="index" class="flex items-center space-x-3">
        <img :src="track.albumArt" :alt="`${track.name} album art`" class="w-10 h-10 rounded-md" />
        <div class="flex flex-col">
          <div class="text-theme-300 font-bold text-base">{{ track.name }}</div>
          <div class="text-theme-400 text-md">{{ track.artist }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.next-in-queue {
  position: fixed;
  bottom: 180px;
  right: 40px;
}
</style>
