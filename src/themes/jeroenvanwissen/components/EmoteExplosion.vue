<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import type { Ref } from 'vue';

// Define the event detail type for EmoteExplosion
type EmoteExplosionEventDetail = {
	x?: number;
	y?: number;
	emotes: Array<{ url: string; name?: string }>;
	count?: number | null;
};

const activeEmotes = ref<Emote[]>([]);
const animationId: Ref<number | null> = ref(null);
const containerWidth = ref(window.innerWidth);
const containerHeight = ref(window.innerHeight);

// Performance controls
const MAX_EMOTES = 60; // Limit total emotes on screen
const CLEANUP_INTERVAL = 500; // Clean up dead emotes every 500ms

class Emote {
	id: string;
	url: string;
	name: string;
	x: number;
	y: number;
	vx: number;
	vy: number;
	opacity: number;
	scale: number;
	rotation: number;
	rotationSpeed: number;
	gravity: number;
	bounce: number;
	fadeStart: number;
	lifetime: number;
	birth: number;
	isDead: boolean;

	constructor(x: number, y: number, emoteData: any) {
		this.id = Math.random().toString(36).substr(2, 9);

		// Use the provided emote data
		this.url = emoteData.url;
		this.name = emoteData.name || 'emote';

		this.x = x;
		this.y = y;
		this.vx = (Math.random() - 0.5) * 16; // Reduced random velocity X
		this.vy = (Math.random() - 0.5) * 16; // Reduced random velocity Y
		this.opacity = 1;
		this.scale = 2.5; // Slightly smaller initial scale
		this.rotation = 0;
		this.rotationSpeed = (Math.random() - 0.5) * 8; // Reduced rotation speed
		this.gravity = 0.18; // Slightly reduced gravity
		this.bounce = 0.75; // Slightly reduced bounce
		this.fadeStart = Date.now() + 2500; // Start fading after 2.5 seconds
		this.lifetime = 12000; // Reduced lifetime to 12 seconds
		this.birth = Date.now();
		this.isDead = false; // Cache dead state for performance
	}

	update() {
		// Early exit if already marked as dead
		if (this.isDead)
			return;

		// Check if emote should die (do this first to avoid unnecessary calculations)
		const age = Date.now() - this.birth;
		if (age > this.lifetime) {
			this.isDead = true;
			return;
		}

		// Apply gravity
		this.vy += this.gravity;

		// Update position
		this.x += this.vx;
		this.y += this.vy;

		// Update rotation
		this.rotation += this.rotationSpeed;

		// Bounce off edges
		if (this.x <= 0 || this.x >= containerWidth.value - 28) {
			this.vx *= -this.bounce;
			this.x = Math.max(0, Math.min(containerWidth.value - 28, this.x));
		}

		if (this.y <= 0 || this.y >= containerHeight.value - 28) {
			this.vy *= -this.bounce;
			this.y = Math.max(0, Math.min(containerHeight.value - 28, this.y));
		}

		// Handle fading
		if (age > this.fadeStart) {
			const fadeProgress = (age - this.fadeStart) / (this.lifetime - 2500);
			this.opacity = Math.max(0, 1 - fadeProgress);
			this.scale = Math.max(0.1, 2.5 - fadeProgress * 1.2);
		}

		// Reduce velocity over time (air resistance) - more aggressive
		this.vx *= 0.99;
		this.vy *= 0.99;
	}

	isDeadMethod() {
		return this.isDead || Date.now() - this.birth > this.lifetime;
	}
}

let lastCleanup = 0;

function triggerExplosion(
	x: number = containerWidth.value / 2,
	y: number = containerHeight.value / 2,
	emotes: Array<{ url: string; name?: string }> = [],
	count: number | null = null,
) {
	if (!emotes || emotes.length === 0) {
		console.warn('No emotes provided for explosion');
		return;
	}

	// Performance safeguard: if we have too many emotes, remove the oldest ones
	if (activeEmotes.value.length > MAX_EMOTES) {
		const excessCount = activeEmotes.value.length - MAX_EMOTES + 15;
		activeEmotes.value.splice(0, excessCount);
	}

	// Reduce explosion count for better performance, max 12 emotes per explosion
	const explosionCount = count || Math.min(emotes.length * 2, 12);

	for (let i = 0; i < explosionCount; i++) {
		// Pick a random emote from the provided emotes
		const randomEmote = emotes[Math.floor(Math.random() * emotes.length)];
		activeEmotes.value.push(new Emote(x, y, randomEmote));
	}
}

function animate() {
	const now = Date.now();

	// Update all emotes (iterate backwards to safely remove if needed)
	for (let i = 0; i < activeEmotes.value.length; i++) {
		activeEmotes.value[i].update();
	}

	// Cleanup dead emotes periodically instead of every frame
	if (now - lastCleanup > CLEANUP_INTERVAL) {
		activeEmotes.value = activeEmotes.value.filter(emote => !emote.isDead);
		lastCleanup = now;
	}

	animationId.value = requestAnimationFrame(animate);
}

function handleResize() {
	containerWidth.value = window.innerWidth;
	containerHeight.value = window.innerHeight;
}

// Listen for custom event
function handleEmoteExplosion(event: Event) {
	const { x, y, emotes, count } = (event as CustomEvent<EmoteExplosionEventDetail>).detail || {};
	triggerExplosion(x, y, emotes, count);
}

onMounted(() => {
	animate();
	window.addEventListener('resize', handleResize);
	window.addEventListener('EmoteExplosion', handleEmoteExplosion);
});

onUnmounted(() => {
	if (animationId.value) {
		cancelAnimationFrame(animationId.value);
	}
	window.removeEventListener('resize', handleResize);
	window.removeEventListener('EmoteExplosion', handleEmoteExplosion);

	// Clear all emotes on unmount
	activeEmotes.value = [];
});

// Expose trigger function for direct calls
defineExpose({
	triggerExplosion,
});
</script>

<template>
	<div class="emote-explosion-container">
		<img
			v-for="emote in activeEmotes"
			:key="emote.id"
			class="emote"
			:src="emote.url"
			:alt="emote.name"
			:style="{
				left: `${emote.x}px`,
				top: `${emote.y}px`,
				opacity: emote.opacity,
				transform: `scale(${emote.scale}) rotate(${emote.rotation}deg)`,
			}"
		>
	</div>
</template>

<style scoped>
.emote-explosion-container {
	position: fixed;
	top: 0;
	left: 0;
	width: 100vw;
	height: 100vh;
	pointer-events: none;
	z-index: 9999;
	overflow: hidden;
}

.emote {
	position: absolute;
	width: 48px;
	height: 48px;
	user-select: none;
	pointer-events: none;
	will-change: transform, opacity;
	filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3));
	/* Add GPU acceleration hints */
	transform-style: preserve-3d;
	backface-visibility: hidden;
}
</style>
