import type { Reward } from '@/types/chat';

const rewardFiles = import.meta.glob('./*.ts', {
	import: 'default',
	eager: true,
});

export const rewards: Reward[] = [];

Object.entries(rewardFiles)
	.forEach((page) => {
		rewards.push(page[1] as Reward);
	});

rewards.forEach((reward) => {
	reward.init();
});
