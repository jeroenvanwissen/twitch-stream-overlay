import type { Ref } from 'vue';
import { useLocalStorage } from '@vueuse/core';

import type { Command, UserRecord } from '@/types/chat';
import chatClient from '@/lib/twitch/chatClient';

type Storage = {
	songs: Ref<UserRecord[]>;
};

const command: Command<Storage> = {
	name: 'records',
	permission: 'everyone',
	type: 'command',
	storage: {
		songs: useLocalStorage<UserRecord[]>('songs', []),
	},
	init: () => {},
	callback: async ({ channel, message }) => {
		const songs = command.storage.songs.value;

		const records = [];

		if (songs.some(song => song.userId === message.userInfo.userId)) {
			const user = songs.find(song => song.userId === message.userInfo.userId);
			if (user) {
				records.push({
					type: 'song',
					amount: user.count,
				});
			}
		}

		if (records.length > 0) {
			const recordText = records.map(record => `${record.type}: ${record.amount} times`).join(', ');
			const text = `your records: ${recordText}`;
			await chatClient.say(channel, text, {
				replyTo: message.id,
			});
		}
		else {
			const text = `you have no records yet!`;
			await chatClient.say(channel, text, {
				replyTo: message.id,
			});
		}
	},
};

export default command;
