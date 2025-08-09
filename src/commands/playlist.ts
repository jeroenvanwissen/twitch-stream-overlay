import type { Command } from '@/types/chat';
import chatClient from '@/lib/twitch/chatClient';

const command: Command = {
	name: 'playlist',
	permission: 'everyone',
	type: 'command',
	storage: {},
	init: () => {},
	callback: async ({ channel, message }) => {
		if (!import.meta.env.VITE_SPOTIFY_BANGER_PLAYLIST_URI) {
			const text = 'Banger playlist is not configured!';
			await chatClient.say(channel, text, {
				replyTo: message.id,
			});
			return;
		}

		const playlistId = import.meta.env.VITE_SPOTIFY_BANGER_PLAYLIST_URI.split('?').at(0);

		const text = `The Banger playlist is: ${playlistId}`;

		await chatClient.say(channel, text, {
			replyTo: message.id,
		});
	},
};

export default command;
