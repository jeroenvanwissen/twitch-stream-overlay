<script setup lang="ts">
import type { PropType } from 'vue';

import type { MessageNode } from '@/types/chat';

defineProps({
	node: {
		type: Object as PropType<MessageNode>,
		required: true,
	},
});
</script>

<template>
	<span v-if="node.type === 'rootNode'" :id="node.id" class="message flex items-end flex-wrap gap-0.5"
		:class="node.classes"
	>
		<template v-for="child in node.children ?? []" :key="child.id">
			<MessageNode :node="child" />
		</template>
	</span>
	<span v-else-if="node.type === 'span'" :id="node.id" class="inline font-sans" :class="node.classes"
		v-bind="node.attribs"
	>
		<template v-for="child in node.children ?? []" :key="child.id">
			<MessageNode :node="child" />
		</template>
	</span>
	<p v-else-if="node.type === 'p'" :id="node.id" class="text-[1.1rem] leading-7 font-medium" :class="node.classes"
		v-bind="node.attribs"
	>
		{{ node.text }}
	</p>
	<div v-else-if="node.type === 'div'" :id="node.id" :class="node.classes" v-bind="node.attribs">
		<template v-for="child in node.children ?? []" :key="child.id">
			<MessageNode :node="child" />
		</template>
	</div>
	<img v-else-if="node.type === 'emote'" :id="node.id" class="size-7 mx-1" :class="node.classes" v-bind="node.attribs" :alt="node.attribs?.alt">
	<img v-else-if="node.type === 'img'" :id="node.id" class="h-7" :class="node.classes" v-bind="node.attribs" :alt="node.attribs?.alt">
	<marquee v-else-if="node.type === 'marquee'" :id="node.id" :class="node.classes" v-bind="node.attribs">
		<template v-for="child in node.children ?? []" :key="child.id">
			<MessageNode :node="child" />
		</template>
	</marquee>
</template>

<style scoped>
.message-custom {
	height: auto;
	max-height: 250px;
}
</style>
