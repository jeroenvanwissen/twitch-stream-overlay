<script setup lang="ts">
import { onMounted, ref } from 'vue';
import seagullSound from '@/themes/jeroenvanwissen/assets/sounds/seagull.mp3';

const audioRef = ref<HTMLAudioElement>();

function playAudio() {
	if (audioRef.value) {
		audioRef.value.volume = 0.2;
		audioRef.value.play().catch((error) => {
			console.warn('Audio play failed:', error);
		});
	}
}

onMounted(() => {
	playAudio();
});
</script>

<template>
	<div>
		<div class="seagull">
			<img src="../assets/images/seagull.webp" alt="Seagull">
			<audio ref="audioRef" :src="seagullSound" loop />
		</div>
	</div>
</template>

<style scoped>
.seagull {
	position: relative;
	width: 150px;
	animation: animation 25s infinite linear;
}

@keyframes animation {
	0% {
		bottom: 0;
	}
	10% {
		bottom: -1rem;
		transform: translateX(10rem);
	}
	20% {
		transform: translateX(20rem) rotate(-20deg);
	}
	30% {
		bottom: 0;
	}
	40% {
		transform: translateX(40rem) rotate(5deg);
	}
	47% {
		transform: translateX(49rem) rotateY(0deg);
	}
	50% {
		bottom: -1rem;
		transform: translateX(48rem) rotateY(180deg);
	}
	60% {
		transform: translateX(40rem) rotateY(180deg) rotate(10deg);
	}
	70% {
		transform: translateX(30rem) rotateY(180deg) rotate(-20deg);
	}
	80% {
		bottom: 0;
		transform: translateX(20rem) rotateY(180deg) rotate(0deg);
	}
	90% {
		transform: translateX(10rem) rotateY(180deg) rotate(-10deg);
	}
	97% {
		transform: rotateY(180deg);
	}
	100% {
		transform: translateX(0) rotateY(0deg) rotate(0deg);
	}
}
</style>
