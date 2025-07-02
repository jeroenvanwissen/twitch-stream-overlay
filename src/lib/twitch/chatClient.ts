import { ref, toRaw } from 'vue';
import type { HelixChatBadgeVersion } from '@twurple/api';
import type { Message } from '@/types/chat';
import { ChatClient } from '@twurple/chat';

import { getUserData } from '@/lib/twitch/getUserData';
import messageParser from '@/lib/twitch/messageParser';
import { scopes, user } from '@/store/auth';
import { addMessage, chatBadges } from '@/store/chat';

import { getChannelBadges, getUserIdFromName } from '@/lib/twitch/apiClient';
import { TwitchClient } from '@/lib/twitch/twitchClient';
import {
	broadcasterCommands,
	everyoneCommands,
	moderatorCommands,
	subscriberCommands,
	vipCommands,
} from '@/commands';
import { rewards } from '@/rewards';
import { hasMinLevel } from '@/lib/twitch/helpers';

export const chatClient = new ChatClient({
	authProvider: TwitchClient.botAuthProvider!,
	channels: [user.value!.name],
	authIntents: scopes,
	isAlwaysMod: true,
});
export default chatClient;

const messageHandler = ref();

messageHandler.value?.unbind();

messageHandler.value = chatClient.onMessage(async (channel, user, text, msg) => {
	const userData = (await getUserData(channel, msg.userInfo.userId))!;

	if (userData.badges.length === 0) {
		const channelBadges = await getChannelBadges(channel);

		userData.badges
            = msg.userInfo.badges.size > 0
				? [...msg.userInfo.badges.entries()].map(([key, value]) => {
						const channelBadge = channelBadges.find(badge => badge.id === key);
						if (channelBadge?.versions.some(version => version.id === value)) {
							return channelBadge.getVersion(value) as HelixChatBadgeVersion;
						}

						return chatBadges.value.find(badge => badge.id === key)!.getVersion(value) as HelixChatBadgeVersion;
					})
				: [];
	}

	const message: Message = {
		channelId: channel,
		date: msg.date,
		emoteOffsets: msg.emoteOffsets,
		id: msg.id,
		isCheer: msg.isCheer,
		isFirst: msg.isFirst,
		isHighlight: msg.isHighlight,
		isRedemption: msg.isRedemption,
		isReply: msg.isReply,
		isReturningChatter: msg.isReturningChatter,
		parentMessageId: msg.parentMessageId,
		parentMessageText: msg.parentMessageText,
		rewardId: msg.rewardId,
		userInfo: {
			avatarUrl: userData.profile_image_url,
			badgeInfo: msg.userInfo.badgeInfo,
			badges: userData.badges,
			color: msg.userInfo.color || '#FF000',
			displayName: msg.userInfo.displayName,
			id: msg.userInfo.userId,
			isArtist: msg.userInfo.isArtist,
			isBroadcaster: msg.userInfo.isBroadcaster,
			isFounder: msg.userInfo.isFounder,
			isMod: msg.userInfo.isMod,
			isSubscriber: msg.userInfo.isSubscriber,
			isVip: msg.userInfo.isVip,
			userId: msg.userInfo.userId,
			userName: msg.userInfo.userName,
			userType: msg.userInfo.userType,
			pronoun: userData.pronoun,
		},
		message: messageParser(msg.userInfo.userName, msg.id, text, msg.emoteOffsets),
		plainText: text,
	};

	if (message.isRedemption && message.rewardId) {
		await handleReward(channel, user, text, message);
	}
	else if (text.startsWith('!')) {
		await handleCommand(channel, user, text, message);
	}
	else {
		console.log(toRaw(message));
		await addMessage(message);
	}
});

async function handleReward(channel: string, user: string, text: string, message: Message) {
	const broadcasterId = (await getUserIdFromName(channel))!;

	rewards
		.filter(c => c.id === message.rewardId)
		.forEach((command) => {
			command.callback({ channel, broadcasterId, message });
		});
}

async function handleCommand(channel: string, user: string, text: string, message: Message) {
	const broadcasterId = (await getUserIdFromName(channel))!;
	const [commandName, ...params] = text.slice(1).split(' ');

	const cbObject = { channel, broadcasterId, commandName, params, message };

	if (hasMinLevel(message.userInfo, 'broadcaster')) {
		broadcasterCommands
			.filter(c => c.name === commandName)
			.forEach((command) => {
				command.callback(cbObject);
			});
	}
	if (hasMinLevel(message.userInfo, 'moderator')) {
		moderatorCommands
			.filter(c => c.name === commandName)
			.forEach((command) => {
				command.callback(cbObject);
			});
	}
	if (hasMinLevel(message.userInfo, 'vip')) {
		vipCommands
			.filter(c => c.name === commandName)
			.forEach((command) => {
				command.callback(cbObject);
			});
	}
	if (hasMinLevel(message.userInfo, 'subscriber')) {
		subscriberCommands
			.filter(c => c.name === commandName)
			.forEach((command) => {
				command.callback(cbObject);
			});
	}
	everyoneCommands
		.filter(c => c.name === commandName)
		.forEach((command) => {
			command.callback(cbObject);
		});
}

const giftCounts = new Map<string | undefined, number>();

chatClient.onCommunitySub(async (channel, gifterName, giftInfo) => {
	console.log('onCommunitySub', channel, gifterName, giftInfo);
	const previousGiftCount = giftCounts.get(gifterName) ?? 0;
	giftCounts.set(gifterName, previousGiftCount + giftInfo.count);
	await chatClient.say(channel, `Thanks ${gifterName} for gifting ${giftInfo.count} subs to the community!`);
});

chatClient.onSubGift(async (channel, recipientName, subInfo) => {
	console.log('onSubGift', channel, recipientName, subInfo);
	const gifterName = subInfo.gifter;
	const previousGiftCount = giftCounts.get(gifterName) ?? 0;
	if (previousGiftCount > 0) {
		giftCounts.set(gifterName, previousGiftCount - 1);
	}
	else {
		await chatClient.say(channel, `Thanks ${gifterName} for gifting a sub to ${recipientName}!`);
	}
});
