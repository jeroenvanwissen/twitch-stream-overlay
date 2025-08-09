import chatClient from '@/lib/twitch/chatClient';
import type { Command } from '@/types/chat';

const command: Command = {
	name: 'of',
	permission: 'everyone',
	type: 'command',
	storage: {},
	init: () => {},
	callback: async ({ channel, message }) => {
		const text = `I have only one fan, it's small and it blows. Use some channel points to turn it on or off.`;
		await chatClient.say(channel, text, {
			replyTo: message.id,
		});
	},
};

export default command;
