import type { Command } from '@/types/chat';
import { spotifyState } from '@/store/spotify';
import chatClient from '@/lib/twitch/chatClient';

const command: Command = {
	name: 'song',
	permission: 'everyone',
	type: 'command',
	storage: {},
	init: () => {},
	callback: async ({ channel, message }) => {
		if (!spotifyState.value.item) {
			const text = 'No song is currently playing!';
			await chatClient.say(channel, text, {
				replyTo: message.id,
			});
			return;
		}

		const text = `The current song is: ${spotifyState.value.item.name} by 
            ${spotifyState.value.item.artists.at(0)?.name} ${spotifyState.value.item.external_urls.spotify}`;

		await chatClient.say(channel, text, {
			replyTo: message.id,
		});
	},
};

export default command;
