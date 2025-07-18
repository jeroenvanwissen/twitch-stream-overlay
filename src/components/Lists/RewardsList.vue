<script setup lang="ts">
import { ref, watch } from 'vue';
import type { HelixCustomReward } from '@twurple/api';

import { user } from '@/store/auth';
import { getChannelRewards } from '@/lib/twitch/apiClient';

import BaseList from './BaseList.vue';

const rewards = ref<HelixCustomReward[]>([]);

watch(user, async (value) => {
	if (!value?.name)
		return;

	rewards.value = await getChannelRewards(value.name);
	console.log('Rewards loaded:', rewards.value);
});
</script>

<template>
	<BaseList :items="rewards">
		<template #title>
			Channel Rewards
		</template>
		<template #item="{ item }">
			{{ item.title }} - {{ item.id }}
		</template>
	</BaseList>
</template>

<style scoped>

</style>
