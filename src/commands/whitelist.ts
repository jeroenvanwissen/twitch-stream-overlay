import type { ChatPermissions, Command } from '@/types/chat';
import chatClient from '@/lib/twitch/chatClient';
import { ALLOWED_ATTR, ALLOWED_TAGS, FORBID_ATTR, FORBID_TAGS } from '@/lib/twitch/messageParser';
import { whitelistedUsers } from '@/store/chat';
import { getUserIdFromName } from '@/lib/twitch/apiClient';

const command: Command = {
	name: 'whitelist',
	permission: 'moderator',
	type: 'command',
	storage: {},
	init: () => {},
	callback: async ({ channel, params, message }) => {
		if (!params || params.length === 0) {
			await chatClient.say(channel, `@${message.userInfo.displayName} You need to specify a user to shoutout!`);
			return;
		}

		const name = params.at(0)!.replace('@', '')!.toLowerCase();
		const userId = await getUserIdFromName(name);

		const permission: ChatPermissions = {
			userName: name,
			ALLOWED_TAGS,
			ALLOWED_ATTR,
			FORBID_TAGS,
			FORBID_ATTR,
		};

		let filtered = false;

		// if params includes noimg remove img from elements
		if (params.includes('noimg')) {
			filtered = true;
			permission.ALLOWED_TAGS = permission.ALLOWED_TAGS.filter((element: string) => element !== 'img');
			permission.FORBID_TAGS = [...FORBID_TAGS, ...ALLOWED_TAGS.filter(element => element === 'img')];
			permission.ALLOWED_ATTR = [];
			permission.FORBID_ATTR = FORBID_ATTR;
		}

		if (userId) {
			whitelistedUsers.value = [
				...whitelistedUsers.value.filter(user => user.userName !== name),
				permission,
			];
			if (filtered) {
				const text = `@${message.userInfo.displayName} User ${params.at(0)} has been whitelisted with no images!`;
				await chatClient.say(channel, text);
			}
			else {
				const text = `@${message.userInfo.displayName} User ${params.at(0)} has been whitelisted!`;
				await chatClient.say(channel, text);
			}
		}
		else {
			const text = `@${message.userInfo.displayName} User ${params.at(0)} not found!`;
			await chatClient.say(channel, text);
		}
	},
};

export default command;
