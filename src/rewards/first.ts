import type { Ref } from 'vue';
import type { Reward, UserRecord } from '@/types/chat';
import chatClient from '@/lib/twitch/chatClient';
import { useLocalStorage } from '@vueuse/core';

const reward: Reward<{ firsts: Ref<UserRecord[]> }> = {
	name: 'first',
	id: '9acdd464-4da9-4a56-9e5a-634e9ef20fef',
	storage: {
		firsts: useLocalStorage<UserRecord[]>('firsts', []),
	},
	init: () => {},
	callback: async ({ channel, message }) => {
		const firsts = reward.storage.firsts.value;

		if (firsts.some(first => first.userId === message.userInfo.userId)) {
			const user = firsts.find(first => first.userId === message.userInfo.userId);
			if (user) {
				user.count += 1;
				user.dates.push(new Date());
				reward.storage.firsts.value = [...firsts];

				const text = `@${message.userInfo.displayName} you have been first ${user.count} times!, the last time was on ${user.dates.at(-1)?.toLocaleDateString()}`;
				await chatClient.say(channel, text);
			}
		}
		else {
			reward.storage.firsts.value = [
				...firsts.filter(first => first.userId !== message.userInfo.userId),
				{
					userId: message.userInfo.userId,
					displayName: message.userInfo.displayName,
					count: 1,
					dates: [new Date()],
				},
			];

			const text = `@${message.userInfo.displayName} this the first time you been first!`;
			await chatClient.say(channel, text);
		}
	},
};

export default reward;
