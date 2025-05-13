<template>
  <div class="p-4 bg-theme-900/90 rounded-lg shadow-lg text-theme-100 text-center fixed left-[40px] bottom-[650px]">
    <h2 class="text-2xl font-bold font-mono mb-2">
      {{ store.formattedTime() }}
    </h2>
    <div class="text-xl mb-2">
      {{ store.state.value.isFocusMode ? 'Focus' : 'Break' }}
    </div>
    <div class="text-lg text-theme-400">
      Pomo {{ store.state.value.currentPomo }}/{{ store.state.value.totalPomos }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { usePomodoroStore } from '../store/pomodoro'

const store = usePomodoroStore()

let timer: number

onMounted(() => {
  timer = window.setInterval(() => {
    store.tick()
  }, 1000)
})

onUnmounted(() => {
  clearInterval(timer)
})
</script>
