import chatClient from '@/lib/twitch/chatClient';
import type { Command } from '@/types/chat';

const command: Command = {
	name: 'work',
	permission: 'everyone',
	type: 'command',
	storage: {},
	init: () => {},
	callback: async ({ channel, message }) => {
		const text = `I work as a Software Engineer for an IT agency / consultancy firm. I have a strong background as Full Stack JavaScript/TypeScript developer.`;
		await chatClient.say(channel, text, {
			replyTo: message.id,
		});
	},
};

export default command;
