import { setVisibility } from '@/store/visibility';
import type { Reward } from '@/types/chat';

interface RewardNameStorage {}

const reward: Reward<RewardNameStorage> = {
	name: 'ducky',
	id: '58f65804-06eb-4f72-805b-201f51d7e77e',
	storage: {},
	init: () => {},
	callback: async () => {
		setVisibility('ducky', true);
		setTimeout(() => {
			setVisibility('ducky', false);
		}, 60000);
	},
};

export default reward;
