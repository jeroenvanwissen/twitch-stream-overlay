<script setup lang="ts">
import { computed } from 'vue';
import { useLocalStorage } from '@vueuse/core';

const dedCount = useLocalStorage<number>('ded-count', 0);

const isVisible = computed(() => dedCount.value > 0);
</script>

<template>
    <div v-if="isVisible" class="fixed bottom-128 right-10 card">
        <div class="flex items-center gap-x-3 rounded-lg p-4 min-w-[200px] w-fit relative overflow-hidden">
            <div class="absolute inset-0 w-available h-available bg-theme-900/90 card -z-10" />
            <img 
                src="https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_316bad9f688d4344a1cbffbfb5e547b5/default/dark/3.0" 
                alt="Death emote" 
                class="w-12 h-12 -mt-2"
            />
            <span class="text-theme-100 font-bold text-xl">Deaths: {{ dedCount }}</span>
        </div>
    </div>
</template>

<style scoped>
.card {
    transition: all 0.3s ease-in-out;
}
</style>