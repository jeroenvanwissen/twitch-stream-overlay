import type { Ref } from 'vue';
import type { Reward, UserRecord } from '@/types/chat';
import { useLocalStorage } from '@vueuse/core';

const reward: Reward<{ hydrates: Ref<UserRecord[]> }> = {
	name: 'hydrate',
	id: '24cc90b5-dbf4-43be-a373-e9085b0e351c',
	storage: {
		hydrates: useLocalStorage<UserRecord[]>('hydrates', []),
	},
	init: () => {},
	callback: async ({ message }) => {
		const hydrates = reward.storage.hydrates.value;

		if (hydrates.some(hydrate => hydrate.userId === message.userInfo.userId)) {
			const user = hydrates.find(hydrate => hydrate.userId === message.userInfo.userId);
			if (user) {
				user.count += 1;
				user.dates.push(new Date());
				reward.storage.hydrates.value = [...hydrates];
			}
		}
		else {
			reward.storage.hydrates.value = [
				...hydrates.filter(hydrate => hydrate.userId !== message.userInfo.userId),
				{
					userId: message.userInfo.userId,
					displayName: message.userInfo.displayName,
					count: 1,
					dates: [new Date()],
				},
			];
		}
	},
};

export default reward;
