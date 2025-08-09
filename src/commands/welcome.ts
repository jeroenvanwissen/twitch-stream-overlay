import chatClient from '@/lib/twitch/chatClient';
import type { Command } from '@/types/chat';

const command: Command = {
	name: 'welcome',
	permission: 'everyone',
	type: 'command',
	storage: {},
	init: () => {},
	callback: async ({ channel, message }) => {
		const text = `Hi! jeroen7Hey Welcome in jeroen7Woohoo I'm Jeroen, a Full-Stack JavaScript / TypeScript developer currently working as a Test Automation Engineer at an international consultancy firm. I usually stream Co-Working on Tuesday, Thursday and Friday during my dayjob. Occasionally I throw in a live coding stream. Ask me anything, I might have an answer to some of your questions....`;
		await chatClient.say(channel, text, {
			replyTo: message.id,
		});
	},
};

export default command;
