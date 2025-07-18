<script setup lang="ts">
import { computed } from 'vue';

import { useLocalStorage } from '@vueuse/core';
import type { UserRecord } from '@/types/chat';
import BaseList from './BaseList.vue';

const songs = useLocalStorage<UserRecord[]>('songs', []);

interface RecordItem {
	title: string;
	count?: number;
	displayName?: string;
}

const records = computed<RecordItem[]>(() => {
	const songsRecord = songs.value.length > 0
		? songs.value.toSorted((a, b) => b.count - a.count).at(0)
		: null;

	return [
		{
			title: 'Songs',
			count: songsRecord?.count,
			displayName: songsRecord?.displayName,
		},
	];
});
</script>

<template>
	<BaseList :items="records">
		<template #title>
			Channel Records
		</template>
		<template #item="{ item }">
			{{ item.title }}: <span class="font-bold">{{ item.displayName }}</span> {{ item.count ? `(${item.count})` : '' }}
		</template>
	</BaseList>
</template>

<style scoped>

</style>
