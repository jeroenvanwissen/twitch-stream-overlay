<script setup lang="ts" generic="T">
import type { PropType } from 'vue';

defineProps({
	items: {
		type: Array as PropType<T[]>,
		required: true,
	},
});
</script>

<template>
	<div class="relative px-4 py-2 flex flex-col gap-2 w-fit min-w-[240px]">
		<div id="background" class="absolute rounded-md overflow-hidden inset-0 -z-10" />
		<h2 class="text-xl font-bold">
			<slot name="title" />
		</h2>
		<ul>
			<template v-for="item in items" :key="item.name">
				<li class="ml-6 py-1 list-disc font-semibold">
					<slot name="item" :item="item as typeof items[number]" />
				</li>
			</template>
		</ul>
	</div>
</template>

<style scoped>

</style>
