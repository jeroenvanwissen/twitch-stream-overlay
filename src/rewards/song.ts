import { useLocalStorage } from '@vueuse/core';
import type { Ref } from 'vue';

import type { Reward, UserRecord } from '@/types/chat';
import type { EventSubChannelRedemptionAddEvent } from '@twurple/eventsub-base/lib/events/EventSubChannelRedemptionAddEvent';

import { spotifyClient } from '@/lib/spotify/spotifyClient';
import chatClient from '@/lib/twitch/chatClient';

const reward: Reward<{ songs: Ref<UserRecord[]> }> = {
	name: 'song',
	id: '14dbf63b-fb01-4e73-9d13-c0bd8da97658',
	storage: {
		songs: useLocalStorage<UserRecord[]>('songs', []),
	},
	init: () => {},
	callback: async ({ channel, message }) => {
		message = message as EventSubChannelRedemptionAddEvent;
		if (!message.input.includes('spotify.com') && !message.input.includes('track/')) {
			const text = `Failed to add song to queue. Make sure you provided a valid Spotify track URL!`;
			await chatClient.say(channel, text, {
				replyTo: message.id,
			});
			return;
		}

		const songs = reward.storage.songs;
		const user = songs.value.find(song => song.userId === message.userId)!;
		if (user) {
			user.count += 1;
			user.dates.push(new Date());
			songs.value = [...songs.value!.filter(song => song.userId !== message.userId), user];
		}
		else {
			const user = {
				userId: message.userId,
				displayName: message.userDisplayName,
				count: 1,
				dates: [new Date()],
			};
			songs.value = [...songs.value.filter(song => song.userId !== message.userId), user];
		}

		const trackId
			= message.input.includes('spotify.com') && message.input.includes('track/')
				? message.input.split('/').pop()?.split('?').at(0)
				: message.input.split(':').pop();

		const queueResponse = await spotifyClient.addToQueue(trackId!);

		if (queueResponse && 'body' in queueResponse && queueResponse.statusCode === 200) {
			const text = `${queueResponse.body.name} by ${queueResponse.body.artists.at(0)?.name} has been added to the queue!`;
			await chatClient.say(channel, text);
		}
		else {
			const text = `Failed to add song to queue. Make sure you provided a valid Spotify track URL!`;
			await chatClient.say(channel, text, {
				replyTo: message.id,
			});
		}
	},
};

export default reward;
