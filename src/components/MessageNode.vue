<script setup lang="ts">
import type {PropType} from "vue";

interface MessageNode {
  type: string;
  id: string;
  classes?: string[];
  children?: MessageNode[];
  text?: string;
  attribs?: Record<string, string>;
}

defineProps({
  node: {
    type: Object as PropType<MessageNode>,
    required: true
  },
});

</script>

<template>
  <span class="message flex items-end flex-wrap gap-0.5" v-if="node.type == 'rootNode'" :id="node.id" :class="node.classes">
    <template v-for="child in node.children ?? []" :id="child.id">
      <MessageNode :node="child"/>
    </template>
  </span>
  <span v-else-if="node.type == 'span'" :id="node.id" class="inline font-sans" :class="node.classes" v-bind="node.attribs">
      <template v-for="child in node.children ?? []" :id="child.id">
        <MessageNode :node="child"/>
      </template>
    </span>
  <p v-else-if="node.type == 'p'" :id="node.id" class="text-md leading-none font-medium" :class="node.classes" v-bind="node.attribs">
    {{ node.text }}
  </p>
  <div v-else-if="node.type == 'div'" :id="node.id" :class="node.classes" v-bind="node.attribs">
    <template v-for="child in node.children ?? []" :id="child.id">
      <MessageNode :node="child"/>
    </template>
  </div>
  <img v-else-if="node.type == 'emote'" :id="node.id" class="size-6" :class="node.classes" v-bind="node.attribs"/>
  <img v-else-if="node.type == 'img'" :id="node.id" class="h-6" :class="node.classes" v-bind="node.attribs"/>
  <marquee v-else-if="node.type == 'marquee'" :id="node.id" :class="node.classes" v-bind="node.attribs">
    <template v-for="child in node.children ?? []" :id="child.id">
      <MessageNode :node="child"/>
    </template>
  </marquee>
</template>

<style scoped>

.message-custom {
  height: auto;
  max-height: 250px;
}

</style>