<script setup lang="ts">
import { computed } from 'vue';

import { useLocalStorage } from '@vueuse/core';
import type { UserRecord } from '@/types/chat';
import BaseList from './BaseList.vue';

const firsts = useLocalStorage<UserRecord[]>('firsts', []);
const songs = useLocalStorage<UserRecord[]>('songs', []);
const hydrates = useLocalStorage<UserRecord[]>('hydrates', []);

interface RecordItem {
	title: string;
	count?: number;
	displayName?: string;
}

const records = computed<RecordItem[]>(() => {
	const firstRecord = firsts.value.length > 0
		? firsts.value.toSorted((a, b) => a.count - b.count).at(0)
		: null;

	const songsRecord = songs.value.length > 0
		? songs.value.toSorted((a, b) => a.count - b.count).at(0)
		: null;

	const hydratesRecord = hydrates.value.length > 0
		? hydrates.value.toSorted((a, b) => a.count - b.count).at(0)
		: null;

	return [
		{
			title: 'Firsts',
			count: firstRecord?.count,
			displayName: firstRecord?.displayName,
		},
		{
			title: 'Songs',
			count: songsRecord?.count,
			displayName: songsRecord?.displayName,
		},
		{
			title: 'Hydrates',
			count: hydratesRecord?.count,
			displayName: hydratesRecord?.displayName,
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
