<script setup lang="ts">
import { ref } from 'vue';

import '@/lib/spotify/spotifyClient';
import '@/lib/spotify/spotifySocketClient';
import '@/lib/twitch/authClient';

import { botUser, user } from '@/store/auth';
import { isVisible } from '@/store/visibility';

import Chat from '@/components/Chat.vue';
import NextInQueue from '@/components/NextInQueue.vue';
import NowPlaying from '@/components/NowPlaying.vue';
import Pomodoro from '@/components/Pomodoro.vue';
import Tasks from '@/components/Tasks.vue';
import DeathCounter from './components/DeathCounter.vue';
import Badge from './components/Badge.vue';
import EmoteExplosion from './components/EmoteExplosion.vue';
import Meme from './components/Meme.vue';
import Ducky from './components/Ducky.vue';
import Seagull from './components/Seagull.vue';
import Alerts from './components/Alerts.vue';
import AdBreak from './components/AdBreak.vue';

const chatWindow = ref<HTMLDivElement>();
const mainWindow = ref<HTMLDivElement>();
</script>

<template>
	<div class="w-screen h-auto max-h-screen aspect-video flex justify-between relative overflow-hidden p-6">
		<Badge v-if="botUser" />
		<Alerts v-if="user" />
		<AdBreak v-if="user" />

		<div ref="mainWindow" class="relative flex flex-col w-available h-available justify-center -ml-6 mr-[5%] text-lg">
			<NextInQueue v-if="user && isVisible('spotify')" />
			<NowPlaying v-if="user && isVisible('spotify')" />
			<Pomodoro v-if="user && isVisible('pomodoro')" />
			<Tasks v-if="user && isVisible('tasks')" />
			<DeathCounter v-if="user && isVisible('deaths')" />
			<EmoteExplosion v-if="user && isVisible('emotes')" />
			<!-- <VideoElement /> -->

			<div class="top-[calc(100%/8)] flex flex-col gap-4 fixed left-10 card">
				<!-- <ListsRotator v-if="botUser && user" direction="left" /> -->
				<!-- dev only, lists all reward ids -->
				<!--				<RewardsList v-if="botUser && user" /> -->
			</div>
		</div>

		<div ref="chatWindow" class="absolute top-0 right-0 flex flex-col w-1/4 h-available mb-16 mr-6 mt-6">
			<Chat v-if="user" />
		</div>

		<div class="absolute bottom-[-20px] left-[30vw] w-full">
			<Ducky v-if="user && isVisible('ducky')" />
		</div>

		<div class="absolute top-[21vh] left-[30vw] w-full">
			<Seagull v-if="user && isVisible('seagull')" />
		</div>
		<Meme v-if="user" />
	</div>
</template>
