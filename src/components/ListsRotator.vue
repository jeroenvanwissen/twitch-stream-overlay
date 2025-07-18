<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import CommandsList from '@/components/Lists/CommandsList.vue';
import RecordsList from '@/components/Lists/RecordsList.vue';
import { listsAnimationDuration, listsShowDuration, listsSwitchDelay } from '@/store/config';

interface Props {
	direction?: 'left' | 'right' | 'top' | 'bottom';
}

const props = withDefaults(defineProps<Props>(), {
	direction: 'left',
});

// Controls which list is currently visible
const showCommands = ref(false);

// Animation states
const isVisible = ref(false);
let switchTimer: NodeJS.Timeout | null = null;
let animationTimer: NodeJS.Timeout | null = null;
let delayTimer: NodeJS.Timeout | null = null;

// Function to switch between lists with animation
function switchLists() {
	// Start exit animation
	isVisible.value = false;

	// Wait for exit animation to complete
	animationTimer = setTimeout(() => {
		// Wait for the configured delay before showing the next list
		delayTimer = setTimeout(() => {
			// Switch the list
			showCommands.value = !showCommands.value;

			// Start entrance animation
			setTimeout(() => {
				isVisible.value = true;
			}, 50); // Small delay to ensure DOM updates

			// Schedule the next switch
			scheduleNextSwitch();
		}, listsSwitchDelay.value * 1000);
	}, listsAnimationDuration.value * 1000);
}

// Schedule the next list switch
function scheduleNextSwitch() {
	switchTimer = setTimeout(() => {
		switchLists();
	}, listsShowDuration.value * 1000);
}

// Start the rotation when the component is mounted
onMounted(() => {
	isVisible.value = true;
	scheduleNextSwitch();
});

// Clean up timers when component is unmounted
onUnmounted(() => {
	if (switchTimer)
		clearTimeout(switchTimer);
	if (animationTimer)
		clearTimeout(animationTimer);
	if (delayTimer)
		clearTimeout(delayTimer);
});

// Get the appropriate transition name for current direction
function getTransitionName() {
	return `slide-${props.direction}`;
}
</script>

<template>
	<div class="list-container">
		<transition
			:name="getTransitionName()"
			:duration="listsAnimationDuration * 1000"
			mode="out-in"
		>
			<CommandsList v-if="showCommands && isVisible" key="commands" />
			<RecordsList v-else-if="!showCommands && isVisible" key="records" />
		</transition>
	</div>
</template>

<style scoped>
.list-container {
	position: relative;
	width: 240px; /* Match the min-width in BaseList */
	min-height: 150px; /* Set a minimum height to prevent layout shifts */
}

/* Animation base styles */
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active,
.slide-top-enter-active,
.slide-top-leave-active,
.slide-bottom-enter-active,
.slide-bottom-leave-active {
	transition: all v-bind('`${listsAnimationDuration}s`') cubic-bezier(0.25, 0.46, 0.45, 0.94);
	position: absolute;
	width: 100%;
	max-width: 100%;
	box-sizing: border-box;
}

/* Left direction - both enter and leave from left */
.slide-left-enter-from,
.slide-left-leave-to {
	transform: translateX(-100%);
	opacity: 0;
}

/* Right direction - both enter and leave from right */
.slide-right-enter-from,
.slide-right-leave-to {
	transform: translateX(100%);
	opacity: 0;
}

/* Top direction - both enter and leave from top */
.slide-top-enter-from,
.slide-top-leave-to {
	transform: translateY(-100%);
	opacity: 0;
}

/* Bottom direction - both enter and leave from bottom */
.slide-bottom-enter-from,
.slide-bottom-leave-to {
	transform: translateY(100%);
	opacity: 0;
}
</style>
