// eslint-disable unused-imports/no-unused-vars
import type { Reward } from '@/types/chat';

const reward: Reward = {
	name: 'example reward',
	id: '',
	storage: {},
	init: () => {},
	callback: async ({ channel, broadcasterId, message }) => {
		console.log(`Reward triggered by ${message.userInfo.displayName} in channel ${channel}, broadcaster ID: ${broadcasterId}`);
	},
};

export default reward;
