import chatClient from '@/lib/twitch/chatClient';
import { triggerDance } from '@/store/effects';
import type { Command } from '@/types/chat';

const command: Command = {
	name: 'dance',
	permission: 'everyone',
	type: 'command',
	storage: {},
	init: () => {},
	callback: async ({ channel, message }) => {
		triggerDance();
		await chatClient.say(channel, 'Let’s dance!', { replyTo: message.id });
	},
};

export default command;
