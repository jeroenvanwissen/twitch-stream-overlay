import { ApiClient } from '@twurple/api';

import { userId } from '@/store/auth';
import { authProvider } from './authClient';
import type { HelixChatAnnouncementColor } from '@twurple/api/lib/interfaces/endpoints/chat.external';

export const apiClient = new ApiClient({
	authProvider,
});

export async function getUserIdFromName(name: string) {
	const user = await apiClient.users.getUserByName(name);
	return user!.id;
}

// location.reload();
export async function getChannelInformation(broadcaster: string) {
	return await apiClient.asUser(userId.value, (ctx) => {
		return ctx.channels.getChannelInfoById(broadcaster);
	});
}
export async function getChannelFollowers(broadcaster: string, user: string) {
	return await apiClient.asUser(userId.value, (ctx) => {
		return ctx.channels.getChannelFollowers(broadcaster, user);
	});
}

export async function getGlobalBadges() {
	return await apiClient.asUser(userId.value, (ctx) => {
		return ctx.chat.getGlobalBadges();
	});
}

export async function getChannelBadges(broadcaster: string) {
	const broadcasterId = (await getUserIdFromName(broadcaster));
	if (!broadcasterId) {
		return [];
	}
	return await apiClient.chat.getChannelBadges(broadcasterId);
}

export async function getChannelSubscriptions(broadcaster: string) {
	return await apiClient.asUser(userId.value, (ctx) => {
		return ctx.subscriptions.getSubscriptions(broadcaster);
	});
}

export async function getUserSubscriptions(broadcaster: string, user: string) {
	return await apiClient.asUser(userId.value, (ctx) => {
		return ctx.subscriptions.getSubscriptionForUser(broadcaster, user);
	});
}

export async function getChannelTeam(broadcaster: string) {
	return await apiClient.asUser(userId.value, (ctx) => {
		return ctx.teams.getTeamById(broadcaster);
	});
}

export async function shoutoutUser(broadcaster: string, user: string) {
	return await apiClient.asUser(userId.value, (ctx) => {
		return ctx.chat.shoutoutUser(broadcaster, user);
	});
}

export async function getChannelRewards(broadcaster: string) {
	const broadcasterId = (await getUserIdFromName(broadcaster));
	if (!broadcasterId) {
		return [];
	}
	return await apiClient.asUser(userId.value, (ctx) => {
		return ctx.channelPoints.getCustomRewards(broadcasterId);
	});
}

export async function announce(broadcaster: string, message: string, color: HelixChatAnnouncementColor = 'primary') {
	const broadcasterId = (await getUserIdFromName(broadcaster));
	if (!broadcasterId) {
		return [];
	}
	return await apiClient.asUser(userId.value, (ctx) => {
		return ctx.chat.sendAnnouncement(broadcasterId, { message, color });
	});
}

export default apiClient;
