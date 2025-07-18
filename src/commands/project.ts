import type { Command } from '@/types/chat';
import chatClient from '@/lib/twitch/chatClient';
import { spotifyClient } from '@/lib/spotify/spotifyClient';
import { playBlerp } from '@/store/blerps';

const command: Command = {
	name: 'project',
	permission: 'everyone',
	type: 'command',
	storage: {},
	init: () => {},
	callback: async ({ channel }) => {
		const text = `
			I'm working on a project named NoMercy TV, the Effortless Encoder.
            It is a self-hosted streaming solution that allows you to stream your own movies, tv shows and music.
            Rip and archive your physical cd's, dvd's and blu-rays effortlessly, no more need to manually put in all the effort.
            It is time to take back control of your media and return to enjoying what you love.
            No tracking, no ads, no data collection, NoMercy!
		`;

		await chatClient.say(channel, text);

		await spotifyClient.volume(10);

		await playBlerp('nomercy');

		await spotifyClient.volume(70);
	},
};

export default command;
