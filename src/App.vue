<script setup lang="ts">
import '@/lib/twitch/authClient'
import { botUser, user } from '@/store/auth'
import { pomodoroVisible, spotifyVisible, tasksVisible } from '@/store/visibility'
import { ref } from 'vue'

import Badge from '@/components/Badge.vue'
import Chat from '@/components/Chat.vue'
import NowPlaying from '@/components/NowPlaying.vue'
import Pomodoro from '@/components/Pomodoro.vue'
import Tasks from '@/components/Tasks.vue'

const chatWindow = ref<HTMLDivElement>()
const mainWindow = ref<HTMLDivElement>()
</script>

<template>
  <div class="w-screen h-auto max-h-screen aspect-video flex justify-between relative overflow-hidden p-6">
    <Badge v-if="botUser" />

    <div ref="mainWindow" class="relative flex flex-col w-available h-available justify-center -ml-6 mr-[5%]">
      <NowPlaying v-if="user && spotifyVisible" />
      <Pomodoro v-if="user && pomodoroVisible" />
      <Tasks v-if="user && tasksVisible" />
    </div>

    <div ref="chatWindow" class="absolute top-0 right-0 flex flex-col w-1/4 h-available mb-16 mr-6 mt-6">
      <Chat v-if="user" />
    </div>
  </div>
</template>

<style scoped></style>
