import chatClient from '@/lib/twitch/chatClient';
import type { Command } from '@/types/chat';

const command: Command = {
	name: 'work',
	permission: 'everyone',
	type: 'command',
	storage: {},
	init: () => {},
	callback: async ({ channel, message }) => {
		const text = `I work as a Test Automation Engineer for an international consultancy company. I have a strong background as Full Stack JavaScript/TypeScript developer.`;
		await chatClient.say(channel, text, {
			replyTo: message.id,
		});
	},
};

export default command;
