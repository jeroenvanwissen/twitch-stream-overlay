<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useHeartRate } from '@/composables/useHeartRate';

const { reading, tryAutoConnect } = useHeartRate();

// One pulse per beat. 50% slower than real BPM; duration clamped for sanity.
const pulseDuration = computed(() => {
	const bpm = reading.value.bpm ?? 0;
	if (!bpm || bpm <= 0)
		return '1.8s';
	const raw = (60 / bpm) * 1.5;
	const dur = Math.max(0.6, Math.min(3.0, raw));
	return `${dur.toFixed(3)}s`;
});

const active = computed(() => (reading.value.bpm ?? 0) > 0);

onMounted(() => {
	tryAutoConnect();
});
</script>

<template>
	<div class="heart-box" :class="{ active }" :style="{ animationDuration: pulseDuration }" role="img" aria-label="Heart rate">
		<div class="heart-left" />
		<div class="heart-right" />
		<div class="bpm-text">
			{{ reading.bpm ?? '--' }}
		</div>
	</div>
</template>

<style scoped>
.heart-box {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	/* Animation */
	animation-name: beating;
	animation-timing-function: linear;
	animation-iteration-count: infinite;
	transform-origin: center;
}

.heart-box:not(.active) {
	animation-play-state: paused;
	opacity: 0.85;
}

.heart-box .heart-left,
.heart-box .heart-right {
	background: crimson;
	width: 32px; /* was 65px */
	height: 55px; /* was 110px */
	margin: 3px -8px; /* was 5px -16px */
	border-radius: 25px 25px 0 0; /* was 50px 50px 0 0 */
}
.heart-box .heart-left {
	transform: rotate(-45deg);
}
.heart-box .heart-right {
	transform: rotate(45deg);
}

.bpm-text {
	position: absolute;
	inset: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	font-weight: 900;
	font-size: 1.4rem; /* scaled down for smaller heart */
	line-height: 1;
	color: #fff;
	text-shadow: 0 1px 2px rgba(0, 0, 0, 0.45);
	letter-spacing: -0.02em;
}

@keyframes beating {
	20% {
		transform: scale(1.1);
	}
	40% {
		transform: scale(1);
	}
	50% {
		transform: scale(1.15);
	}
	100% {
		transform: scale(1);
	}
}
</style>
