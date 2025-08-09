import chatClient from '@/lib/twitch/chatClient';
import type { Command } from '@/types/chat';

const command: Command = {
	name: 'odin',
	permission: 'everyone',
	type: 'command',
	storage: {},
	init: () => {},
	callback: async ({ channel, message }) => {
		const text = `The Odin Project - Full Stack JavaScript - https://www.theodinproject.com/paths/full-stack-javascript`;
		await chatClient.say(channel, text, {
			replyTo: message.id,
		});
	},
};

export default command;
