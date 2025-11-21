import chatClient from '@/lib/twitch/chatClient';
import type { Command } from '@/types/chat';
import { resetDropScores } from '@/store/dropGame';

const command: Command = {
	name: 'dropreset',
	permission: 'broadcaster',
	type: 'command',
	storage: {},
	init: () => {},
	callback: async ({ channel, message }) => {
		resetDropScores();
		const text = `Drop stats have been reset.`;
		await chatClient.say(channel, text, { replyTo: message.id });
	},
};

export default command;
