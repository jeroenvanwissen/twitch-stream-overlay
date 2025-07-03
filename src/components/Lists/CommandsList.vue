<script setup lang="ts">
import { everyoneCommands } from '@/commands';
import BaseList from './BaseList.vue';
</script>

<template>
	<BaseList :items="everyoneCommands">
		<template #title>
			Commands
		</template>
		<template #item="{ item }">
			{{ item.name }}
		</template>
	</BaseList>
</template>
