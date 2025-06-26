import { ref, watch } from 'vue';
import type { HelixChatBadgeSet } from '@twurple/api';
import { useLocalStorage } from '@vueuse/core';

import type { ChatPermissions, Message } from '@/types/chat';

import { chatAnimationDuration, chatShowDuration } from '@/store/config';

export const chatBadges = ref<HelixChatBadgeSet[]>([]);
export const chatMessageQueue = ref<Message[]>([]);
export const whitelistedUsers = useLocalStorage<ChatPermissions[]>('whitelistedUsers', []);

export const MAX_MESSAGES = 4;

// Add message with automatic removal
export async function addMessage(message: Message) {
	// Set initial animation state
	message.animationState = 'entering';

	// Remove oldest message if we're at max capacity
	if (chatMessageQueue.value.length >= MAX_MESSAGES) {
		const oldestMessage = chatMessageQueue.value[0]; // Changed from length-1 to 0
		oldestMessage.animationState = 'leaving';

		// Wait for leave animation
		await new Promise(resolve => setTimeout(resolve, chatAnimationDuration.value * 1000));
		chatMessageQueue.value.shift(); // Changed from pop to shift
	}

	// Add new message at the end
	chatMessageQueue.value.push(message); // Changed from unshift to push

	// Wait for enter animation
	await new Promise(resolve => setTimeout(resolve, chatAnimationDuration.value * 1000));

	// Set active state
	const msgIndex = chatMessageQueue.value.findIndex(m => m.id === message.id);
	if (msgIndex !== -1) {
		chatMessageQueue.value[msgIndex].animationState = 'active';
	}

	// Schedule removal
	setTimeout(async () => {
		const index = chatMessageQueue.value.findIndex(m => m.id === message.id);
		if (index !== -1) {
			// Set leaving state
			chatMessageQueue.value[index].animationState = 'leaving';

			// Wait for leave animation
			await new Promise(resolve => setTimeout(resolve, chatAnimationDuration.value * 1000));

			// Remove message
			chatMessageQueue.value = chatMessageQueue.value.filter(m => m.id !== message.id);
		}
	}, chatShowDuration.value * 1000);
}

// Optional: Clean existing messages when duration changes
watch(chatShowDuration, (newDuration) => {
	// Remove all messages that are older than the new duration
	const now = Date.now();
	chatMessageQueue.value = chatMessageQueue.value.filter((message) => {
		const messageAge = (now - message.date.getTime()) / 1000;
		return messageAge < newDuration;
	});
});
//
// watch(chatMessageQueue, (value) => {
//     console.log(value);
// });
