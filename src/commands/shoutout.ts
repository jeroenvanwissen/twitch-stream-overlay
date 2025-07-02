import type { Command } from '@/types/chat';
import chatClient from '@/lib/twitch/chatClient';
import { getUserIdFromName, shoutoutUser } from '@/lib/twitch/apiClient';

const command: Command = {
	name: 'so',
	permission: 'moderator',
	type: 'command',
	storage: {},
	init: () => {},
	callback: async ({ channel, broadcasterId, params, message }) => {
		if (params!.length === 0) {
			await chatClient.say(channel, `@${message.userInfo.displayName} You need to specify a user to shoutout!`);
			return;
		}

		const name = params.at(0)?.replace('@', '');
		const userId = await getUserIdFromName(name ?? message.userInfo.userName);

		await shoutoutUser(broadcasterId!, userId!)
			.catch(async (e) => {
				const error = JSON.parse(e.message.split('Body:')[1]);
				await chatClient.say(channel, error.message);
			});
	},
};

export default command;
