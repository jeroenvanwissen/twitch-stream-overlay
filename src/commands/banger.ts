import type { Command } from '@/types/chat';
import { spotifyState } from '@/store/spotify';
import chatClient from '@/lib/twitch/chatClient';
import { spotifyClient } from '@/lib/spotify/spotifyClient';

const command: Command = {
	name: 'banger',
	permission: 'everyone',
	type: 'command',
	storage: {},
	init: () => {},
	callback: async ({ channel, message }) => {
		if (!spotifyState.value.item) {
			await chatClient.say(channel, 'No song is currently playing!');
			return;
		}

		const currentPlayback = await spotifyClient.getCurrentlyPlaying();
		if (currentPlayback?.item) {
			await spotifyClient.addToPlaylist(currentPlayback.item.uri);
			const text = `Added ${currentPlayback.item.name} to the bangers playlist!`;

			await chatClient.say(channel, text, {
				replyTo: message.id,
			});
		}
	},
};

export default command;
