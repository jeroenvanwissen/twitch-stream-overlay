import chatClient from '@/lib/twitch/chatClient';
import type { Command } from '@/types/chat';

const command: Command = {
	name: 'github',
	permission: 'everyone',
	type: 'command',
	storage: {},
	init: () => {},
	callback: async ({ channel, message }) => {
		const text = `There's not much interesting on my GitHub profile.. but here it is... https://github.com/jeroenvanwissen`;
		await chatClient.say(channel, text, {
			replyTo: message.id,
		});
	},
};

export default command;
