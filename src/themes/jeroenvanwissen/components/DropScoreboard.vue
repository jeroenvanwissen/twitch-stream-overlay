<script setup lang="ts">
import { computed } from 'vue';

import { sortedDropScores } from '@/store/dropGame';

const topScores = computed(() => sortedDropScores.value.slice(0, 5));
const hasScores = computed(() => topScores.value.length > 0);
</script>

<template>
	<div v-if="hasScores" class="relative rounded-xl border border-theme-500/30 bg-gradient-to-br from-[#0b1328]/80 via-[#0c1a35]/70 to-[#0b1328]/80 text-theme-100 shadow-xl overflow-hidden w-[320px]">
		<div class="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#5ed0ff22,transparent_35%),radial-gradient(circle_at_80%_0%,#f475ff22,transparent_25%)] blur-2xl pointer-events-none" />
		<div class="flex items-center justify-between px-5 pt-4 pb-2 relative">
			<div>
				<p class="text-xs uppercase tracking-[0.2em] text-theme-200/70">Drop Game</p>
				<h3 class="text-xl font-bold leading-tight">Landing Scores</h3>
			</div>
			<div class="px-3 py-1 text-xs font-semibold bg-theme-500/20 border border-theme-500/40 rounded-full uppercase tracking-wide">
				Live
			</div>
		</div>
		<ul class="flex flex-col gap-2 px-3 pb-4 relative">
			<li
				v-for="(score, index) in topScores"
				:key="score.userName"
				class="flex items-center gap-3 px-3 py-2 rounded-lg border border-white/5 bg-white/5 backdrop-blur-sm shadow-sm"
			>
				<span class="flex items-center justify-center w-8 h-8 rounded-md font-bold text-sm bg-theme-500/20 border border-theme-500/30 text-theme-50">
					#{{ index + 1 }}
				</span>
				<div class="flex-1 min-w-0">
					<p class="font-semibold leading-tight truncate">{{ score.displayName }}</p>
					<p class="text-xs text-theme-200/70 leading-tight truncate">{{ score.userName }}</p>
				</div>
				<span class="text-lg font-black tracking-tight text-theme-50 drop-shadow-[0_0_12px_rgba(94,208,255,0.45)]">
					{{ score.totalPoints }} pts
				</span>
			</li>
		</ul>
	</div>
</template>

<style scoped>
</style>
