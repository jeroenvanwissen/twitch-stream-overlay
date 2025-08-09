import chatClient from '@/lib/twitch/chatClient';
import type { Command } from '@/types/chat';

const command: Command = {
	name: 'jeroen',
	permission: 'everyone',
	type: 'command',
	storage: {},
	init: () => {},
	callback: async ({ channel, message }) => {
		const text = `How to pronounce my name: https://www.twitch.tv/jeroenvanwissen/clip/CleanSneakySwallowSoonerLater-UajfGXXffu5W2IoK`;
		await chatClient.say(channel, text, {
			replyTo: message.id,
		});
	},
};

export default command;
