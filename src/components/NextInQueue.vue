<script setup lang="ts">
import { spotifyQueue } from "@/store/spotify";

</script>

<template>
  <div class="fixed bottom-44 right-10" v-if="spotifyQueue.length > 0">
    <div class="flex flex-col rounded-lg p-4 gap-y-3 min-w-[200px] max-w-[600px] w-fit relative overflow-clip">
      <div class="absolute inset-0 w-available h-available bg-theme-900/90 card -z-10" />
      <div class="text-theme-200 text-md mb-1 card">Next in queue:</div>
      <div v-for="(track, index) in spotifyQueue.toSpliced(1)" :key="index" class="flex items-center space-x-3">
        <img :src="track.album.images.at(0)?.url" :alt="`${track.name} album art`" class="w-10 h-10 rounded-md" />
        <div class="flex flex-col card">
          <div class="text-theme-300 font-bold text-base">
            {{ track.name }}
          </div>
          <div class="text-theme-400 text-md">
            {{ track.artists.at(0)?.name }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>