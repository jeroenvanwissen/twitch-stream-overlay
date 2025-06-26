import type { Command } from '@/types/chat';
import { spotifyState } from '@/store/spotify';
import chatClient from '@/lib/twitch/chatClient';
import { spotifyClient } from '@/lib/spotify/spotifyClient';

const command: Command = {
	name: 'volume',
	permission: 'moderator',
	type: 'command',
	storage: {},
	init: () => {},
	callback: async ({ channel, params }) => {
		if (!spotifyState.value.item) {
			await chatClient.say(channel, 'No song is currently playing!');
			return;
		}

		const volume = params[0] ? Number.parseInt(params[0], 10) : null;
		if (volume === null) {
			const volumeLevel = await spotifyClient.volume();
			const text = `Current volume level is ${volumeLevel}`;
			await chatClient.say(channel, text);
			return;
		}
		else if (Number.isNaN(volume) || volume < 0 || volume > 100) {
			await chatClient.say(channel, 'Please provide a valid volume level between 0 and 100: !volume <level> (0-100).');
			return;
		}

		await spotifyClient.volume(volume);

		const text = `Volume set to ${volume}%.`;
		await chatClient.say(channel, text);
	},
};

export default command;
