import type { Command } from '@/types/chat';
import chatClient from '@/lib/twitch/chatClient';
import { hasMinLevel } from '@/lib/twitch/helpers';
import { allCommands } from './index';

const command: Command = {
	name: 'commands',
	permission: 'everyone',
	type: 'command',
	storage: {},
	init: () => {},
	callback: async ({ channel, message }) => {
		let text = '';

		if (message.userInfo.isBroadcaster) {
			text += 'Broadcaster commands: ';
		}
		else if (message.userInfo.isMod) {
			text += 'Moderator commands: ';
		}
		else if (message.userInfo.isVip) {
			text += 'VIP commands: ';
		}
		else if (message.userInfo.isSubscriber) {
			text += 'Subscriber commands: ';
		}

		text += allCommands
			.filter(cmd => cmd.name !== 'commands' && hasMinLevel(message.userInfo, cmd.permission))
			.map(cmd => cmd.name)
			.sort((a, b) => a.localeCompare(b))
			.join(', ');

		await chatClient.say(channel, text, {
			replyTo: message.id
		});
	},
};

export default command;
