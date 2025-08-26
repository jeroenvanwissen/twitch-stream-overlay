<script setup lang="ts">
import { danceVisible } from '@/store/effects';
// Using explicit import so bundler includes the asset.
import jeanClaude from '../assets/images/jeanclaude.gif';
</script>

<template>
	<transition name="dance-fade">
		<div v-if="danceVisible" class="dance-wrapper">
			<img :src="jeanClaude" alt="Dance" class="dance-gif">
		</div>
	</transition>
</template>

<style scoped>
.dance-wrapper {
	position: absolute;
	bottom: -10px;
	left: 100px;
	pointer-events: none;
	z-index: 5000;
}
.dance-gif {
	/* Removed max-width centering approach; scale image 2x */
	transform: scale(2);
	transform-origin: bottom left;
	image-rendering: -webkit-optimize-contrast;
	animation: bop 1s steps(2) infinite;
}
@keyframes bop {
	0% {
		transform: scale(2) translateY(0);
	}
	50% {
		transform: scale(2) translateY(-6px);
	}
	100% {
		transform: scale(2) translateY(0);
	}
}
.dance-fade-enter-active,
.dance-fade-leave-active {
	transition: opacity 0.4s;
}
.dance-fade-enter-from,
.dance-fade-leave-to {
	opacity: 0;
}
</style>
