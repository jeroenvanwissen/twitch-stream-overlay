<script lang="ts" setup>
import type { PropType } from 'vue';
import type { MessageNode } from '@/types/chat';
import OGMetaPreview from '@/components/OGMetaPreview.vue';

defineProps({
	node: {
		type: Object as PropType<MessageNode>,
		required: true,
	},
});
</script>

<template>
	<div v-if="node.type === 'rootNode'" :id="node.id" :class="node.classes"
		class="message gap-0.5 children:inline break-words"
	>
		<template v-for="child in node.children ?? []" :key="child.id">
			<MessageNode :node="child" />
		</template>
	</div>
	<span v-else-if="node.type === 'span'" :id="node.id" :class="node.classes" class="font-sans inline break-words"
		v-bind="node.attribs"
	>
		<template v-for="child in node.children ?? []" :key="child.id">
			<MessageNode :node="child" />
		</template>
	</span>
	<p v-else-if="node.type === 'p'" :id="node.id" :class="node.classes" class="inline break-words"
		v-bind="node.attribs"
	>
		<template v-for="child in node.children ?? []" :key="child.id">
			<MessageNode :node="child" />
		</template>
		{{ node.text }}
	</p>
	<a v-else-if="node.type === 'a'" :id="node.id" :class="node.classes" class="cursor-pointer inline break-words"
		v-bind="node.attribs"
	>
		<template v-for="child in node.children ?? []" :key="child.id">
			<MessageNode :node="child" />
		</template>
		{{ node.text }}
	</a>
	<b v-else-if="node.type === 'b'" :id="node.id" :class="node.classes" class="inline break-words"
		v-bind="node.attribs"
	>
		<template v-for="child in node.children ?? []" :key="child.id">
			<MessageNode :node="child" />
		</template>
		{{ node.text }}
	</b>
	<u v-else-if="node.type === 'u'" :id="node.id" :class="node.classes" class="inline break-words"
		v-bind="node.attribs"
	>
		<template v-for="child in node.children ?? []" :key="child.id">
			<MessageNode :node="child" />
		</template>
		{{ node.text }}
	</u>
	<i v-else-if="node.type === 'i'" :id="node.id" :class="node.classes" class="inline break-words"
		v-bind="node.attribs"
	>
		<template v-for="child in node.children ?? []" :key="child.id">
			<MessageNode :node="child" />
		</template>
		{{ node.text }}
	</i>
	<strong v-else-if="node.type === 'strong'" :id="node.id" :class="node.classes" class="inline break-words"
		v-bind="node.attribs"
	>
		<template v-for="child in node.children ?? []" :key="child.id">
			<MessageNode :node="child" />
		</template>
		{{ node.text }}
	</strong>
	<small v-else-if="node.type === 'small'" :id="node.id" :class="node.classes" class="inline break-words"
		v-bind="node.attribs"
	>
		<template v-for="child in node.children ?? []" :key="child.id">
			<MessageNode :node="child" />
		</template>
		{{ node.text }}
	</small>
	<div v-else-if="node.type === 'div'" :id="node.id" :class="node.classes" v-bind="node.attribs">
		<template v-for="child in node.children ?? []" :key="child.id">
			<MessageNode :node="child" />
		</template>
	</div>
	<img v-else-if="node.type === 'emote'" :id="node.id" :alt="node.attribs?.alt" :class="node.classes"
		class="size-7 mx-1 inline" v-bind="node.attribs"
	>
	<img v-else-if="node.type === 'img'" :id="node.id" :alt="node.attribs?.alt" :class="node.classes"
		class="w-full h-auto max-h-96 inline"
		v-bind="node.attribs"
	>
	<marquee v-else-if="node.type === 'marquee'" :id="node.id" :class="node.classes" v-bind="node.attribs">
		<template v-for="child in node.children ?? []" :key="child.id">
			<MessageNode :node="child" />
		</template>
	</marquee>
	<div v-else-if="node.type === 'og-preview'" :id="node.id" :class="node.classes">
		<OGMetaPreview :url="node.attribs?.url || ''" />
	</div>
</template>
