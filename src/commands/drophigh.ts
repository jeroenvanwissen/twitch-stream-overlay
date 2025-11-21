import chatClient from '@/lib/twitch/chatClient';
import type { Command } from '@/types/chat';
import { getHighestSingleDrop } from '@/store/dropGame';

const command: Command = {
	name: 'drophigh',
	permission: 'everyone',
	type: 'command',
	storage: {},
	init: () => {},
	callback: async ({ channel, message }) => {
		const top = getHighestSingleDrop();
		const response = top
			? `Highest drop: ${top.displayName} with ${top.best} pts.`
			: `No drops recorded yet. Be the first with !drop`;

		await chatClient.say(channel, response, { replyTo: message.id });
	},
};

export default command;
