<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { chatMessageQueue } from '@/store/chat';
import MessageNode from '@/components/MessageNode.vue';

const chatBox = ref<HTMLElement | null>(null);

onMounted(() => {
	console.log('Chat mounted');
	setTimeout(() => {
		console.log('Connecting chat client');
	}, 1000);
});
</script>

<template>
	<div id="chat-box" ref="chatBox"
		class="w-available h-auto max-h-screen flex flex-col gap-3 pl-4 pt-2 pr-1 overflow-y-auto scrollbar-none"
	>
		<TransitionGroup name="list" tag="div" class="flex flex-col gap-3 will-change-auto">
			<div v-for="message in chatMessageQueue" :key="message.id" class="flex flex-col message-container mt-3" :class="[
				message.animationState,
			]"
			>
				<div class="relative pt-3" :style="{
					'--color-300': `hsl(from ${message.userInfo.color} h calc(s * .30) l)`,
					'--color-500': `hsl(from ${message.userInfo.color} h calc(s * .50) l)`,
					'--color-700': `hsl(from ${message.userInfo.color} h s l)`,
				}"
				>
					<div class="shine-wrapper -mt-6 relative z-10 overflow-hidden banner-animate">
						<div class="relative flex flex-row bg-theme-700 rounded-lg gap-1 h-8 px-2 items-center pr-12">
							<template v-for="badge in message.userInfo.badges" :key="badge.id">
								<img :src="badge.getImageUrl(2)" alt="userImage" class="size-5">
							</template>

							<span class="text-white font-bold text-lg self-start leading-none my-auto">
								{{ message.userInfo.displayName }}
							</span>
							<span v-if="message.userInfo.pronoun"
								class="text-white text-sm font-semibold font-mono ml-0.5 translate-y-0.5 leading-none my-auto whitespace-nowrap"
							>
								({{ message.userInfo.pronoun.subject }}/{{ message.userInfo.pronoun.object }})
							</span>
						</div>
					</div>

					<div
						class="absolute size-14 -right-1 -top-5 rounded-full overflow-hidden bg-theme-700 z-20 avatar-animate border border-theme-700"
					>
						<img class="size-available object-cover" :src="message.userInfo.avatarUrl" alt="profile picture">
					</div>
				</div>

				<div class="flex flex-row p-3 bg-neutral-900 rounded-lg -mt-3 -ml-4 mr-4 pt-5 message-bubble">
					<div class="message-content opacity-0">
						<MessageNode :node="message.message" />
					</div>
				</div>
			</div>
		</TransitionGroup>
	</div>
</template>

<style scoped>
/* Base states and transitions */
.message-container {
	@apply opacity-100 transition-all duration-500 ease-in-out;
}

/* Banner animation */
.banner-animate {
	@apply transform translate-x-[120%];
	/* Changed from -translate-x to translate-x */
	transition: transform 0.5s ease-out;
}

.message-container.active .banner-animate {
	@apply translate-x-0;
}

/* Avatar animation */
.avatar-animate {
	@apply scale-0;
	transition: transform 0.3s ease-out;
	transition-delay: 0.3s;
}

.message-container.active .avatar-animate {
	@apply scale-100;
}

/* Message bubble animation */
.message-bubble {
	@apply transform origin-top scale-y-0;
	transition: transform 0.4s ease-out;
	transition-delay: 0.6s;
}

.message-container.active .message-bubble {
	@apply scale-y-100;
}

/* Message content fade in */
.message-content {
	@apply opacity-0;
	transition: opacity 0.3s ease-out;
	transition-delay: 0.9s;
}

.message-container.active .message-content {
	@apply opacity-100;
}

/* Changed entering animation */
.message-container {
	@apply translate-x-[120%];
	/* Start from right */
}

.message-container.entering {
	@apply translate-x-[120%];
	/* Stay at right */
}

.message-container.active {
	@apply translate-x-0 h-min;
	/* Move to center */
}

/* Changed leaving animation */
.message-container.leaving {
	@apply translate-x-[-120%];
	/* Exit to left */
}

/* Shine effect */
.shine-wrapper::after {
	content: '';
	@apply absolute inset-0 w-full h-full pointer-events-none z-10;
	transform: translateX(100%);
	/* Changed from -100% to 100% */
	background: linear-gradient(
		65deg,
		/* Changed from -65deg to 65deg to flip direction */ rgba(255, 255, 255, 0) 0%,
		rgba(255, 255, 255, 0) 35%,
		rgba(255, 255, 255, 0.2) 50%,
		rgba(128, 186, 232, 0) 65%,
		rgba(128, 186, 232, 0) 99%,
		rgba(125, 185, 232, 0) 100%
	);
}

.shine-wrapper div {
	background-image: linear-gradient(45deg, var(--color-300), var(--color-500) 23%, var(--color-700));
}

.message-container.active .shine-wrapper::after {
	animation: shine 12s forwards;
	animation-iteration-count: 1;
}

/* Leave animation */
.message-container.leaving {
	@apply opacity-0 translate-x-[50px];
}

@keyframes shine {
	1% {
		transform: translateX(100%);
		/* Changed from -100% to 100% */
	}

	15%,
	100% {
		transform: translateX(-100%);
		/* Changed from 100% to -100% */
	}
}

/* Message position movement animation */
.list-move {
	@apply transition-all duration-500 ease-in-out;
}

/* Make sure items are animated in the correct stacking context */
.message-container {
	@apply opacity-100 transition-all duration-500 ease-in-out z-[1];
}

.message-container.active {
	@apply translate-x-0 h-min z-[2];
}

/* Prevent layout jump during leave animation */
.list-leave-active {
	@apply absolute;
}
</style>
