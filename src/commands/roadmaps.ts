import chatClient from '@/lib/twitch/chatClient';
import type { Command } from '@/types/chat';

const command: Command = {
	name: 'roadmaps',
	permission: 'everyone',
	type: 'command',
	storage: {},
	init: () => {},
	callback: async ({ channel, message }) => {
		const text = `Want to start your developer journey? Want to learn new skills? Switch careers? But don't know where to start? https://roadmap.sh is a community effort to create roadmaps, guides and other educational content to help guide developers in picking up a path and guide their learnings.`;
		await chatClient.say(channel, text, {
			replyTo: message.id,
		});
	},
};

export default command;
