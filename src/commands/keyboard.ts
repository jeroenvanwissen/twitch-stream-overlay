import chatClient from '@/lib/twitch/chatClient';
import type { Command } from '@/types/chat';

const command: Command = {
	name: 'keyboard',
	permission: 'everyone',
	type: 'command',
	storage: {},
	init: () => {},
	callback: async ({ channel, message }) => {
		const text = `Ask me about my keyboards! I love mechanical keyboards and have a few different ones. If you're curious about my current setup or want to know more about mechanical keyboards in general, just ask!`;
		await chatClient.say(channel, text, {
			replyTo: message.id,
		});
	},
};

export default command;
