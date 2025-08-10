import type { Command } from '@/types/chat';
import chatClient from '@/lib/twitch/chatClient';
import { useLocalStorage } from '@vueuse/core';
import { messageNow } from '@/store/config';

interface DedStorage {
	count: ReturnType<typeof useLocalStorage<number>>;
}

const command: Command<DedStorage> = {
	name: 'ded',
	permission: 'moderator',
	type: 'command',
	storage: {
		count: useLocalStorage<number>('ded-count', 0),
	},
	init: () => {},
	callback: async ({ channel, params, message }) => {
		// Check if user is broadcaster for special commands
		if (message.userInfo.isBroadcaster && params.length > 0) {
			const param = params[0].toLowerCase();

			if (param === 'reset') {
				command.storage.count.value = 0;
				const text = `Death counter has been reset to 0!`;
				await chatClient.say(channel, text, {
					replyTo: message.id,
				});
				return;
			}

			// Handle +/- operations
			if (param.startsWith('+') || param.startsWith('-')) {
				const value = Number.parseInt(param, 10);
				if (!Number.isNaN(value)) {
					command.storage.count.value += value;
					// Ensure count doesn't go below 0
					if (command.storage.count.value < 0) {
						command.storage.count.value = 0;
					}
					const text = `Death counter ${value > 0 ? 'increased' : 'decreased'} to ${command.storage.count.value}!`;
					await chatClient.say(channel, text, {
						replyTo: message.id,
					});
					return;
				}
			}
		}

		// Default behavior: increment by 1
		command.storage.count.value += 1;
		const text = `jeroen7Ded Jeroen has died! Death count is now ${command.storage.count.value}!`;
		await chatClient.say(channel, text, {
			replyTo: message.id,
		});
		// Add badge message for death
		messageNow(`Jeroen has died! Death count is now ${command.storage.count.value}!`);
	},
};

export default command;
