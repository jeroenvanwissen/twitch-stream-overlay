import type { Reward } from '@/types/chat';
import songReward from './songReward';

export const rewards: Reward[] = [
	songReward,
];

rewards.forEach((reward) => {
	reward.init();
});
