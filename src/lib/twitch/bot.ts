import { ref } from 'vue';
import { Bot } from '@twurple/easy-bot';
import { useLocalStorage } from '@vueuse/core';

import { secondsToDuration } from '@/lib/dateTime';
import apiClient, { getUserIdFromName, shoutoutUser } from '@/lib/twitch/apiClient';
import { botAuthProvider } from '@/lib/twitch/authClient';
import chatClient from '@/lib/twitch/chatClient';
import { TwitchClient } from '@/lib/twitch/twitchClient';
import { accessToken, botUser, botUserId, clientId, user } from '@/store/auth';
import { latestSubscriber, messageNow } from '@/store/config';

import { rewards } from '@/rewards';

import type { EventSubChannelAdBreakBeginEvent } from '@twurple/eventsub-base/lib/events/EventSubChannelAdBreakBeginEvent';
import type { EventSubChannelRedemptionAddEvent } from '@twurple/eventsub-base/lib/events/EventSubChannelRedemptionAddEvent';
import { EventSubWsListener } from '@twurple/eventsub-ws';
import { ApiClient } from '@twurple/api';
import { StaticAuthProvider } from '@twurple/auth';

interface WelcomeUser {
	name: string;
	hasSpoken: boolean;
}

const welcomeUsers = ref<WelcomeUser[]>([]);
const knownUsers = useLocalStorage<string[]>('knownUsers', []);

console.log('Creating bot client for', user.value!.name);
const bot = new Bot({
	authProvider: botAuthProvider,
	channels: [user.value!.name!],
	debug: false,
	chatClientOptions: {
		requestMembershipEvents: true,
	},
});

TwitchClient.botApiClient!.users.getUserByName(import.meta.env.VITE_TWITCH_BOT_NAME).then((user) => {
	botUserId.value = user!.id;
	botUser.value = user!;
});

bot.onConnect(async () => {
	// await apiClient.moderation.deleteChatMessages(user.value!.id);
	// await bot.say(user.value!.name!, 'Chatbot connected!');
});

bot.onJoin(async ({ userName }) => {
	console.log(`${userName} has joined the channel!`);

	if (!welcomeUsers.value.some(u => u.name === userName)) {
		welcomeUsers.value.push({ name: userName, hasSpoken: false });
	}
});
bot.onLeave(async ({ userName }) => {
	console.log(`${userName} has left the channel!`);
});

bot.onMessage(async ({ broadcasterName, userName }) => {
	if (!welcomeUsers.value.some(u => u.name === userName)) {
		welcomeUsers.value = welcomeUsers.value.filter(u => u.name !== userName);
		if (knownUsers.value.includes(userName)) {
			await bot.say(broadcasterName, `Welcome back @${userName}!`);
		}
		else {
			await bot.say(broadcasterName, `Welcome @${userName}!`);
		}
	}

	if (!knownUsers.value.includes(userName)) {
		knownUsers.value = [...knownUsers.value, userName];
	}
});

bot.onSubGift(async ({ broadcasterName, gifterName, userName }) => {
	await bot.say(broadcasterName, `Thanks @${gifterName} for gifting a subscription to @${userName}!`);
});

bot.onBan(async ({ broadcasterName, userName }) => {
	await bot.say(broadcasterName, `Trash taken out! @${userName} has been banned!`);
});

bot.onTimeout(async ({ broadcasterName, userName, duration }) => {
	await bot.say(
		broadcasterName,
		`Take a break, @${userName}! You have been timed out for ${
			duration! > 3600 ? secondsToDuration(duration!) : duration
		} seconds!`,
	);
});

bot.onRaid(async ({ broadcasterName, userName, viewerCount }) => {
	await bot.announce(broadcasterName, `Thanks @${userName} for raiding with ${viewerCount} viewers!`, 'primary');
	const broadcasterId = await getUserIdFromName(broadcasterName);
	const userId = await getUserIdFromName(userName);
	await shoutoutUser(broadcasterId!, userId!).catch(async (e) => {
		const error = JSON.parse(e.message.split('Body:')[1]);
		await chatClient.say(broadcasterName, error.message);
	});
	await messageNow(`Thanks @${userName} for raiding with ${viewerCount} viewers!`);
});

bot.onChatClear(async ({ broadcasterName }) => {
	await bot.say(broadcasterName, `Chat has been cleared!`);
});

bot.onSub(async ({ broadcasterName, userName }) => {
	await bot.say(broadcasterName, `Thanks @${userName} for subscribing to the channel!`);
	latestSubscriber.value = (await apiClient.users.getUserByName(userName))!;
});
bot.onResub(async ({ broadcasterName, userName, months }) => {
	await bot.say(broadcasterName, `Thanks @${userName} for subscribing to the channel for a total of ${months} months!`);
});
// bot.onSubGift(async ({ broadcasterName, gifterDisplayName, userName }) => {
//     await bot.say(broadcasterName, `Thanks @${gifterDisplayName} for gifting a subscription to @${userName}!`);
// });
// bot.onCommunitySub(async ({ broadcasterName, gifterDisplayName, count }) => {
//     await bot.say(broadcasterName, `Thanks @${gifterDisplayName} for gifting ${count} subscriptions to the community!`);
// });
bot.onCommunityPayForward(async ({ broadcasterName, gifterDisplayName, originalGifterDisplayName }) => {
	await bot.say(
		broadcasterName,
		`Thanks @${gifterDisplayName} for paying forward a gift from ${originalGifterDisplayName}!`,
	);
});
bot.onGiftPaidUpgrade(async ({ broadcasterName, gifterDisplayName, userName }) => {
	await bot.say(broadcasterName, `Thanks @${userName} for continuing the gift sub gifted by ${gifterDisplayName}!`);
});

async function handleAdBreakStart(data: EventSubChannelAdBreakBeginEvent) {
	console.log('Ad break started:', data);
	// await bot.say(user.value!.name!, `Ad break started! Duration: ${data.durationSeconds} seconds.`);
}

async function handleChannelPointRedemption(data: EventSubChannelRedemptionAddEvent) {
	console.log('Channel point redemption:', data);

	rewards
		.filter(c => c.id === data.rewardId)
		.forEach((command) => {
			command.callback({
				channel: user.value!.name!,
				broadcasterId: data.broadcasterId,
				message: data,
			});
		});
}

export async function setupEventSub() {
	console.log('Setting up EventSub listeners...', clientId.value, accessToken.value);

	const authProvider = new StaticAuthProvider(clientId.value, accessToken.value);
	const apiClient = new ApiClient({ authProvider });
	const eventSub = new EventSubWsListener({ apiClient });

	eventSub.onChannelAdBreakBegin(user.value!.id!, handleAdBreakStart);
	eventSub.onChannelRedemptionAdd(user.value!.id!, handleChannelPointRedemption);

	eventSub.start();
}
