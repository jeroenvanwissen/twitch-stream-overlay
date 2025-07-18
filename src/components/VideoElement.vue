<script setup lang="ts">
import { hasVideo, video } from '@/store/blerps';
</script>

<template>
	<div class="absolute w-1/3 left-1/2 -translate-x-1/2 h-auto aspect-video"
		:class="{
			'opacity-0': !hasVideo,
		}"
	>
		<video ref="video" src="" class="w-full h-full rounded-lg shadow-lg" />
	</div>
</template>

<style scoped>

</style>
