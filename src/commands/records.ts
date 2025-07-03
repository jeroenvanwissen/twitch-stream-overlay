import type { Ref } from 'vue';
import { useLocalStorage } from '@vueuse/core';

import type { Command, UserRecord } from '@/types/chat';
import chatClient from '@/lib/twitch/chatClient';

type Storage = {
	firsts: Ref<UserRecord[]>;
	songs: Ref<UserRecord[]>;
	hydrates: Ref<UserRecord[]>;
};

const command: Command<Storage> = {
	name: 'records',
	permission: 'everyone',
	type: 'command',
	storage: {
		firsts: useLocalStorage<UserRecord[]>('firsts', []),
		songs: useLocalStorage<UserRecord[]>('songs', []),
		hydrates: useLocalStorage<UserRecord[]>('hydrates', []),
	},
	init: () => {},
	callback: async ({ channel, message }) => {
		const firsts = command.storage.firsts.value;
		const songs = command.storage.songs.value;

		const records = [];

		if (firsts.some(first => first.userId === message.userInfo.userId)) {
			const user = firsts.find(first => first.userId === message.userInfo.userId);
			if (user) {
				records.push({
					type: 'first',
					amount: user.count,
				});
			}
		}

		if (songs.some(song => song.userId === message.userInfo.userId)) {
			const user = songs.find(song => song.userId === message.userInfo.userId);
			if (user) {
				records.push({
					type: 'song',
					amount: user.count,
				});
			}
		}

		if (command.storage.hydrates.value.some(hydrate => hydrate.userId === message.userInfo.userId)) {
			const user = command.storage.hydrates.value.find(hydrate => hydrate.userId === message.userInfo.userId);
			if (user) {
				records.push({
					type: 'hydrate',
					amount: user.count,
				});
			}
		}

		if (records.length > 0) {
			const recordText = records.map(record => `${record.type}: ${record.amount} times`).join(', ');
			const text = `@${message.userInfo.displayName} your records: ${recordText}`;
			await chatClient.say(channel, text);
		}
		else {
			const text = `@${message.userInfo.displayName} you have no records yet!`;
			await chatClient.say(channel, text);
		}
	},
};

export default command;
