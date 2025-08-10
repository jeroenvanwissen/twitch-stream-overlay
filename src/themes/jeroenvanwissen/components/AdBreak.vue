<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import adbreakImg from '@/themes/jeroenvanwissen/assets/images/adbreak.png';

type AdBreakDetail = { durationSeconds: number; startedAt?: string };

const active = ref(false);
const endAt = ref<number>(0);
const now = ref<number>(Date.now());
let timer: number | null = null;

const remainingMs = computed(() => Math.max(0, endAt.value - now.value));

function tick() {
	now.value = Date.now();
	if (remainingMs.value <= 0) {
		active.value = false;
		stop();
	}
}

function start(durationSeconds: number) {
	endAt.value = Date.now() + durationSeconds * 1000;
	active.value = true;
	stop();
	timer = window.setInterval(tick, 200);
}

function stop() {
	if (timer) {
		clearInterval(timer);
		timer = null;
	}
}

function handleAdBreakStart(e: Event) {
	const { durationSeconds } = (e as CustomEvent<AdBreakDetail>).detail || {};
	if (!durationSeconds)
		return;
	start(durationSeconds);
}

onMounted(() => {
	window.addEventListener('AdBreakStart', handleAdBreakStart as EventListener);
});

onUnmounted(() => {
	window.removeEventListener('AdBreakStart', handleAdBreakStart as EventListener);
	stop();
});
</script>

<template>
	<div
		v-if="active"
		class="fixed inset-0 z-[9997] flex items-end justify-center pointer-events-none pb-[40px]"
	>
		<div class="pointer-events-auto">
			<div class="card rounded-xl overflow-hidden">
				<div class="relative flex flex-col items-center">
					<img :src="adbreakImg" alt="Ad break" class="w-[350px] max-w-[90vw] h-auto mb-3">
					<div class="text-theme-100 font-bold text-lg">
						Twitch ad break in progress
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
