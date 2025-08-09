import chatClient from '@/lib/twitch/chatClient';
import type { Command } from '@/types/chat';

interface HelpStorage {}

const command: Command<HelpStorage> = {
	name: 'help',
	permission: 'everyone',
	type: 'command',
	storage: {},
	init: () => {},
	callback: async ({ channel, params, message }) => {
		if (params.length === 0) {
			const text = `Invalid usage of the help command. Use !commands to see what commands are available for you.`;
			await chatClient.say(channel, text, {
				replyTo: message.id,
			});
			return;
		}

		const command = params[0];

		let helpText = '';

		switch (command) {
			case 'banger':
				helpText = '!banger will add the current song to the banger list.';
				break;
			case 'command':
				helpText = '!command will list all available commands for your permission level.';
				break;
			case 'commands':
				helpText = '!commands will list all available commands for your permission level.';
				break;
			case 'followage':
				helpText = '!followage will show how long you have been following the channel.';
				break;
			case 'overlay':
				helpText = '!overlay will tell you about it.';
				break;
			case 'playlist':
				helpText = '!playlist will give you the spotify link to the bangers playlist.';
				break;
			case 'records':
				helpText = '!records will show your personal records of stream redemptions.';
				break;
			case 'shoutout':
				helpText = '!shoutout <username> will give a shoutout to the specified user.';
				break;
			case 'skip':
				helpText = '!skip will skip the current song playing on stream.';
				break;
			case 'song':
				helpText = '!song will show the current song playing on stream.';
				break;
			case 'unwhitelist':
				helpText = '!unwhitelist <username> will revoke special abilities.';
				break;
			case 'whitelist':
				helpText = '!whitelist <username> will give special abilities to the specified user.';
				break;
			case 'volume':
				helpText = '!volume <0-100> will set the volume of the music in the stream.';
				break;
			default:
				helpText = 'This command does not exist, use !commands to see what commands are available to you.';
				break;
		}

		await chatClient.say(channel, `${helpText}`, {
			replyTo: message.id,
		});
	},
};

export default command;
