import type { Command } from '@/types/chat';
import chatClient from '@/lib/twitch/chatClient';

const command: Command = {
	name: 'playlist',
	permission: 'everyone',
	type: 'command',
	storage: {},
	init: () => {},
	callback: async ({ channel }) => {
		if (!import.meta.env.VITE_SPOTIFY_BANGER_PLAYLIST_URI) {
			await chatClient.say(channel, 'Banger playlist is not configured!');
			return;
		}

		const playlistId = import.meta.env.VITE_SPOTIFY_BANGER_PLAYLIST_URI.split('?').at(0);

		const text = `The Banger playlist is: ${playlistId}`;

		await chatClient.say(channel, text);
	},
};

export default command;
